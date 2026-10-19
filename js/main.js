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
let playerSpec = null; // the animal you are (or were, while human)
let humanLook = null; // set the first time you make your human
let isHuman = false;
let playerName = "";
const START = new THREE.Vector3(0, 0, POND.rz + 2.5);

// Swap the player's model, keeping where it stands and which way it faces.
function placePlayer(model) {
  const position = player ? player.position.clone() : START.clone();
  const heading = player ? player.rotation.y : 0;
  if (player) scene.remove(player);
  player = model;
  player.position.copy(position);
  player.rotation.y = heading;
  scene.add(player);
}

const placeAnimal = (spec) => placePlayer(buildAnimal(spec));
const placeHuman = (look) => placePlayer(buildPerson({ ...look, kid: true }));

function turnInto(text) {
  playerSpec = { ...findAnimal(text), baby: playerSpec?.baby ?? false };
  isHuman = false;
  placeAnimal(playerSpec);
  effects.poof(player.position);
  ui.showToast(`${playerSpec.emoji} You turned into ${/^[aeiou]/i.test(playerSpec.name) ? "an" : "a"} ${playerSpec.name}!`);
  ui.showStyleStep(playerSpec, playerName);
}

function recolor(color) {
  playerSpec = { ...playerSpec, color };
  placeAnimal(playerSpec);
}

function setAge(baby) {
  playerSpec = { ...playerSpec, baby };
  placeAnimal(playerSpec);
}

function finishStyle(name) {
  playerName = name || playerSpec.name;
  ui.setNameTag(playerName);
  ui.hidePicker();
  ui.setForm(isHuman);
  ui.showToast(`Hi, ${playerName}! 💖 Let's go exploring!`);
}

// One click: animal → human → animal. The first time, you design your human.
function toggleForm() {
  if (!humanLook) return editHuman();
  isHuman = !isHuman;
  if (isHuman) placeHuman(humanLook);
  else placeAnimal(playerSpec);
  effects.poof(player.position);
  ui.setForm(isHuman);
  ui.showToast(isHuman ? "🧍 You turned into a human!" : `${playerSpec.emoji} You're ${/^[aeiou]/i.test(playerSpec.name) ? "an" : "a"} ${playerSpec.name} again!`);
}

let lookBeforeEdit = null;
function editHuman() {
  lookBeforeEdit = isHuman ? humanLook : null;
  const look = humanLook ?? DEFAULT_HUMAN;
  placeHuman(look); // live preview while choosing
  ui.showHumanPanel(look);
  pendingLook = look;
}

let pendingLook = null;
function previewHuman(look) {
  pendingLook = look;
  placeHuman(look);
}

function finishHuman() {
  const firstTime = !humanLook;
  humanLook = pendingLook;
  isHuman = true;
  placeHuman(humanLook);
  effects.poof(player.position);
  ui.setForm(true);
  if (firstTime) ui.showToast("🧍 You're a human! Press 🐾 Animal to change back.");
}

function cancelHuman() {
  // Go back to whatever you were before opening the panel.
  if (lookBeforeEdit) placeHuman(lookBeforeEdit);
  else {
    isHuman = false;
    placeAnimal(playerSpec);
  }
  ui.setForm(isHuman);
}

const ui = createUI({
  onChoose: turnInto,
  onColor: recolor,
  onAge: setAge,
  onDone: finishStyle,
  onHop: () => hop(),
  onToggleForm: toggleForm,
  onEditHuman: editHuman,
  onHumanChange: previewHuman,
  onHumanDone: finishHuman,
  onHumanCancel: cancelHuman,
  onAction: doAction,
});

const town = createFamilies(scene, world);
for (const family of town.families) {
  family.label = ui.makeLabel(`The ${family.name} family`, "family-label");
  family.bubble = ui.makeLabel("", "speech");
  family.bubbleTime = 0;
}

// ---------- making families happy ----------

const ACTION_COOLDOWN = 1.2;
let actionCooldown = 0;
let trickSpin = 0; // seconds of spinning left
let cardKey = ""; // which family card is showing, so we only rebuild it when it changes

function say(family, text) {
  family.bubble.textContent = text;
  family.bubble.hidden = false;
  family.bubbleTime = 2.5;
}

function doAction(action) {
  const family = town.meeting();
  if (!family || isHuman || actionCooldown > 0 || !player) return;
  actionCooldown = ACTION_COOLDOWN;
  ui.setActionsEnabled(false);

  const leaderPos = family.leader.position;
  if (action === "trick") {
    trickSpin = 0.6;
    hop();
  } else if (action === "cuddle") {
    // Snuggle up close to the family, then hearts!
    const away = Math.hypot(leaderPos.x - player.position.x, leaderPos.z - player.position.z);
    const close = Math.max(0, away - 1.2 - (player.userData.radius ?? 0.5));
    player.position.x += ((leaderPos.x - player.position.x) / away) * close;
    player.position.z += ((leaderPos.z - player.position.z) / away) * close;
    effects.hearts(player.position, 6);
  } else if (action === "play") {
    effects.ball(player.position, leaderPos);
    hop();
  }

  const { line } = reactToAction(family, action, playerSpec);
  say(family, line);
  effects.hearts(leaderPos, action === family.loves ? 12 : 5);
  ui.setHearts(family.hearts);
}

function updateFamilyCard(dt) {
  if (actionCooldown > 0) {
    actionCooldown -= dt;
    if (actionCooldown <= 0) ui.setActionsEnabled(true);
  }
  const family = player && !ui.isPickerOpen() && !carriedBy ? town.meeting() : null;
  if (!family) for (const f of town.families) f.notYet = false; // ask again next visit
  const myFamily = town.adoptedFamily();
  let mode = "";
  if (family) {
    if (myFamily && myFamily !== family) mode = "taken";
    else if (!isHuman && family.hearts >= MAX_HEARTS && !family.notYet) mode = "adopt";
    else mode = "hearts";
  }
  const key = family ? `${family.name}|${isHuman}|${mode}` : "";
  if (key !== cardKey) {
    cardKey = key;
    if (!family) ui.hideFamilyCard();
    else if (mode === "taken") ui.showTakenCard(family);
    else if (mode === "adopt") {
      ui.showAdoptCard(family, () => goHome(family), () => (family.notYet = true));
      say(family, "We want to adopt you! 💖");
    } else {
      ui.showFamilyCard(family, isHuman);
      ui.setActionsEnabled(actionCooldown <= 0);
      if (!isHuman && family.hearts === 0) say(family, "Hello there, cutie!");
    }
  }
}

// ---------- getting adopted ----------

const CARRY_LIMIT = 1.5; // animals taller than this get walked home instead
let carriedBy = null; // the family taking you home
let carried = false; // in their arms (true) or walking beside them (false)

function goHome(family) {
  carried = player.userData.height <= CARRY_LIMIT;
  carriedBy = family;
  town.takeHome(family, carried);
  walkTarget = null;
  ui.hideFamilyCard();
  ui.setPlayLocked(true);
  say(family, carried ? "Up you go! Let's go home! 🏠" : "You're too big to carry! Let's walk home together.");
}

// Keep the player in the carrier's arms, or walking right beside them.
function followCarrier() {
  const leader = carriedBy.leader;
  const heading = leader.rotation.y;
  const r = player.userData.radius ?? 0.5;
  const [side, ahead] = carried ? [0, 0.6 + r * 0.5] : [1.2 + r, 0];
  player.position.set(
    leader.position.x + side * Math.cos(heading) + ahead * Math.sin(heading),
    carried ? 1.15 - player.userData.height * 0.35 : 0,
    leader.position.z - side * Math.sin(heading) + ahead * Math.cos(heading)
  );
  player.rotation.y = heading;
  walkAmount = carried ? 0 : leader.userData.walk;
}

function welcomeHome(family) {
  family.arrived = false;
  carriedBy = null;
  const house = family.house;
  player.position.set(house.doorX + 1.5, 0, house.doorZ + 1.5);
  hopY = 0;
  effects.confetti(player.position);
  effects.hearts(player.position, 20);
  world.markHome(house);
  family.label.textContent = `❤️ Your family: the ${family.name}s`;
  ui.setPlayLocked(false);
  ui.setForm(isHuman);
  ui.showBanner(
    "🎉 Adopted! 🎉",
    `${playerName} the ${playerSpec.name} is now part of the ${family.name} family! They'll follow you everywhere.`
  );
  say(family, "Welcome home! 🏠💖");
}

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
  const action = { 1: "trick", 2: "cuddle", 3: "play" }[key];
  if (action) doAction(action);
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
  if (player && !ui.isPickerOpen() && !carriedBy && hopY === 0) hopSpeed = 7;
}

const blocked = (x, z) => world.isBlocked(x, z, player.userData.radius ?? 0.5);

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
    move.normalize().multiplyScalar(WALK_SPEED * (player.userData.speed ?? 1) * dt);
    const p = player.position;
    const startX = p.x;
    const startZ = p.z;
    // Try each direction on its own so you slide along trees and fences.
    // If you are already stuck inside something (say you just grew into an
    // elephant next to a tree), you can always walk out.
    const stuck = blocked(p.x, p.z);
    if (stuck || !blocked(p.x + move.x, p.z)) p.x += move.x;
    if (stuck || !blocked(p.x, p.z + move.z)) p.z += move.z;
    const edge = world.half - 1;
    p.x = Math.max(-edge, Math.min(edge, p.x)); // never leave through the fence
    p.z = Math.max(-edge, Math.min(edge, p.z));
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
let lastFrame = 0;
function frame() {
  lastFrame = performance.now();
  const dt = Math.min(clock.getDelta(), 0.1);
  t += dt;
  world.update(t);
  effects.update(dt);

  if (player) {
    if (carriedBy) followCarrier();
    else updatePlayer(dt);
    if (trickSpin > 0) {
      // A full spin in 0.6 seconds.
      const step = Math.min(trickSpin, dt);
      player.rotation.y += (step / 0.6) * Math.PI * 2;
      trickSpin -= step;
    }
    if (player.userData.arms) animatePerson(player, t, walkAmount); // people have arms, animals don't
    else animateAnimal(player, t, walkAmount);
    world.fadeTrees(player.position, camera.position);
    // The sun follows the player so shadows work all over the big map.
    sun.position.set(player.position.x + 15, 25, player.position.z + 10);
    sun.target.position.set(player.position.x, 0, player.position.z);
    const h = player.userData.height;
    // Back the camera up for big animals and lean in for tiny ones.
    camGoal.set(player.position.x, player.position.y + 1.2 + h * 1.3, player.position.z + 2.5 + h * 2.2);
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
    if (family.bubbleTime > 0) {
      family.bubbleTime -= dt;
      family.bubble.hidden = family.bubbleTime <= 0 || !near;
      placeLabel(family.bubble, leader.position.x, leader.userData.height + 1.5, leader.position.z);
    }
  }
  for (const family of town.families) if (family.arrived) welcomeHome(family);
  updateFamilyCard(dt);

  renderer.render(scene, camera);
}

function loop() {
  frame();
  requestAnimationFrame(loop);
}
loop();

// ---------- test helpers ----------
// Open the game with ?debug to let testing tools see and move things.
// Status is written as JSON into a hidden #debug element; setting its
// data-teleport="x,z" attribute moves the player there.
if (new URLSearchParams(location.search).has("debug")) {
  const status = document.createElement("pre");
  status.id = "debug";
  status.hidden = true;
  document.body.appendChild(status);
  new MutationObserver(() => {
    const [x, z] = (status.dataset.teleport || "").split(",").map(Number);
    if (player && Number.isFinite(x) && Number.isFinite(z)) player.position.set(x, 0, z);
  }).observe(status, { attributes: true, attributeFilter: ["data-teleport"] });
  setInterval(() => {
    // Keep the game running even when the browser isn't drawing frames.
    if (performance.now() - lastFrame > 200) frame();
    const round = (n) => Math.round(n * 10) / 10;
    status.textContent = JSON.stringify({
      player: player && { x: round(player.position.x), y: round(player.position.y), z: round(player.position.z), human: isHuman, carriedBy: carriedBy?.name ?? null },
      families: town.families.map((f) => ({ name: f.name, state: f.state, hearts: f.hearts, x: round(f.leader.position.x), z: round(f.leader.position.z) })),
    });
  }, 100);
}
