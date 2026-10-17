// Sets up the 3D scene, camera and lights, and runs the game loop.

const canvas = document.getElementById("game");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaee3ff);
scene.fog = new THREE.Fog(0xaee3ff, 50, 100);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);

scene.add(new THREE.HemisphereLight(0xffffff, 0x88aa66, 0.75));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(15, 25, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, far: 90 });
scene.add(sun, sun.target);

const world = buildWorld(scene);
const effects = createEffects(scene);

let player = null;
let playerSpec = null;
let playerName = "";
const START = new THREE.Vector3(0, 0, POND.rz + 2.5);

// Swap the player's model, keeping where it stands and which way it faces.
function placeAnimal(spec) {
  const position = player ? player.position.clone() : START.clone();
  const heading = player ? player.rotation.y : 0;
  if (player) scene.remove(player);
  player = buildAnimal(spec);
  player.position.copy(position);
  player.rotation.y = heading;
  scene.add(player);
}

function turnInto(text) {
  playerSpec = findAnimal(text);
  placeAnimal(playerSpec);
  effects.poof(player.position);
  ui.showToast(`${playerSpec.emoji} You turned into ${/^[aeiou]/i.test(playerSpec.name) ? "an" : "a"} ${playerSpec.name}!`);
  ui.showStyleStep(playerSpec, playerName);
}

function recolor(color) {
  playerSpec = { ...playerSpec, color };
  placeAnimal(playerSpec);
}

function finishStyle(name) {
  playerName = name || playerSpec.name;
  ui.setNameTag(playerName);
  ui.hidePicker();
  ui.showToast(`Hi, ${playerName}! 💖 Let's go exploring!`);
}

const ui = createUI({ onChoose: turnInto, onColor: recolor, onDone: finishStyle, onHop: () => hop() });

const town = createFamilies(scene, world);
for (const family of town.families) family.label = ui.makeLabel(`The ${family.name} family`, "family-label");

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

// ---------- walking ----------

const WALK_SPEED = 4.5;
const keys = new Set();
let walkTarget = null;
let walkAmount = 0; // 0 = standing still, 1 = walking (smoothed for animation)
let hopY = 0;
let hopSpeed = 0;

window.addEventListener("keydown", (event) => {
  if (event.target.tagName === "INPUT") return;
  const key = event.key.toLowerCase();
  keys.add(key);
  if (key === " ") hop();
  if (key === " " || key.startsWith("arrow")) event.preventDefault();
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());

// Tap or click the ground to walk there; hold and drag to steer.
const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const pointer = new THREE.Vector2();
let pointerHeld = false;

function setWalkTarget(event) {
  pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(groundPlane, hit)) walkTarget = hit;
}
canvas.addEventListener("pointerdown", (event) => {
  if (!player || ui.isPickerOpen()) return;
  pointerHeld = true;
  setWalkTarget(event);
});
canvas.addEventListener("pointermove", (event) => {
  if (pointerHeld) setWalkTarget(event);
});
window.addEventListener("pointerup", () => (pointerHeld = false));

function hop() {
  if (player && !ui.isPickerOpen() && hopY === 0) hopSpeed = 7;
}

const blocked = (x, z) => world.isBlocked(x, z, 0.5);

const move = new THREE.Vector3();
function updatePlayer(dt) {
  move.set(0, 0, 0);
  if (!ui.isPickerOpen()) {
    if (keys.has("arrowup") || keys.has("w")) move.z -= 1;
    if (keys.has("arrowdown") || keys.has("s")) move.z += 1;
    if (keys.has("arrowleft") || keys.has("a")) move.x -= 1;
    if (keys.has("arrowright") || keys.has("d")) move.x += 1;
  }
  if (move.lengthSq() > 0) {
    walkTarget = null;
  } else if (walkTarget) {
    move.set(walkTarget.x - player.position.x, 0, walkTarget.z - player.position.z);
    if (move.length() < 0.2) {
      walkTarget = null;
      move.set(0, 0, 0);
    }
  }

  const moving = move.lengthSq() > 0;
  if (moving) {
    move.normalize().multiplyScalar(WALK_SPEED * dt);
    const p = player.position;
    const startX = p.x;
    const startZ = p.z;
    // Try each direction on its own so you slide along trees and fences.
    if (!blocked(p.x + move.x, p.z)) p.x += move.x;
    if (!blocked(p.x, p.z + move.z)) p.z += move.z;
    if (walkTarget && Math.hypot(p.x - startX, p.z - startZ) < 0.001) walkTarget = null; // stuck

    // Turn smoothly to face where we're going.
    const facing = Math.atan2(move.x, move.z);
    const turn = Math.atan2(Math.sin(facing - player.rotation.y), Math.cos(facing - player.rotation.y));
    player.rotation.y += turn * Math.min(1, dt * 12);
  }
  walkAmount += ((moving ? 1 : 0) - walkAmount) * Math.min(1, dt * 8);

  // Hopping.
  if (hopSpeed !== 0 || hopY > 0) {
    hopY += hopSpeed * dt;
    hopSpeed -= 20 * dt;
    if (hopY <= 0) {
      hopY = 0;
      hopSpeed = 0;
    }
  }

  // Wade a little lower in the pond.
  const groundY = inPond(player.position.x, player.position.z) ? -0.35 : 0;
  player.userData.groundY = (player.userData.groundY ?? groundY) + (groundY - (player.userData.groundY ?? groundY)) * Math.min(1, dt * 8);
  player.position.y = player.userData.groundY + hopY;
}

// ---------- game loop ----------

const clock = new THREE.Clock();
const camGoal = new THREE.Vector3();
const lookAt = new THREE.Vector3();
const screenPoint = new THREE.Vector3();
let t = 0;

// Put an HTML label over a spot in the 3D world (hidden when off screen).
function placeLabel(label, x, y, z) {
  screenPoint.set(x, y, z).project(camera);
  const onScreen = screenPoint.z < 1 && Math.abs(screenPoint.x) < 1.1 && Math.abs(screenPoint.y) < 1.1;
  label.style.visibility = onScreen ? "visible" : "hidden";
  const sx = ((screenPoint.x + 1) / 2) * window.innerWidth;
  const sy = ((1 - screenPoint.y) / 2) * window.innerHeight;
  label.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -100%)`;
}
function loop() {
  const dt = Math.min(clock.getDelta(), 0.1);
  t += dt;
  world.update(t);
  effects.update(dt);

  if (player) {
    updatePlayer(dt);
    animateAnimal(player, t, walkAmount);
    world.fadeTrees(player.position, camera.position);
    // The sun follows the player so shadows work all over the big map.
    sun.position.set(player.position.x + 15, 25, player.position.z + 10);
    sun.target.position.set(player.position.x, 0, player.position.z);
    const h = player.userData.height;
    camGoal.set(player.position.x, player.position.y + 3 + h, player.position.z + 6 + h * 1.5);
    camera.position.lerp(camGoal, 0.05);
    lookAt.set(player.position.x, player.position.y + h * 0.5, player.position.z);
    camera.lookAt(lookAt);

    // Keep the name tag floating above the animal's head.
    placeLabel(ui.nameTag, player.position.x, player.position.y + h + 0.4, player.position.z);
  } else {
    // Slowly circle the magic pond while choosing.
    const a = t * 0.1;
    camera.position.set(Math.sin(a) * 24, 18, Math.cos(a) * 24);
    camera.lookAt(0, 0, -4);
  }

  town.update(dt, t, player);
  for (const family of town.families) {
    const leader = family.leader;
    const near = player && !ui.isPickerOpen() &&
      Math.hypot(player.position.x - leader.position.x, player.position.z - leader.position.z) < 14;
    family.label.hidden = !near;
    if (near) placeLabel(family.label, leader.position.x, leader.userData.height + 0.6, leader.position.z);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();
