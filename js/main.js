// Sets up the 3D scene, camera and lights, and runs the game loop.

const canvas = document.getElementById("game");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaee3ff);
scene.fog = new THREE.Fog(0xaee3ff, 40, 80);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);

scene.add(new THREE.HemisphereLight(0xffffff, 0x88aa66, 0.75));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(15, 25, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, far: 80 });
scene.add(sun);

const world = buildWorld(scene);
const effects = createEffects(scene);

let player = null;
const START = new THREE.Vector3(0, 0, POND.rz + 2.5);

function turnInto(text) {
  const spec = findAnimal(text);
  const position = player ? player.position.clone() : START.clone();
  const heading = player ? player.rotation.y : 0;
  if (player) scene.remove(player);
  player = buildAnimal(spec);
  player.position.copy(position);
  player.rotation.y = heading;
  scene.add(player);
  effects.poof(position);
  ui.showToast(`${spec.emoji} You turned into ${/^[aeiou]/i.test(spec.name) ? "an" : "a"} ${spec.name}!`);
  ui.hidePicker();
}

const ui = createUI({ onChoose: turnInto });

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

const clock = new THREE.Clock();
const camGoal = new THREE.Vector3();
const lookAt = new THREE.Vector3();
let t = 0;
function loop() {
  const dt = Math.min(clock.getDelta(), 0.1);
  t += dt;
  world.update(t);
  effects.update(dt);

  if (player) {
    animateAnimal(player, t, 0);
    const h = player.userData.height;
    camGoal.set(player.position.x, player.position.y + 3 + h, player.position.z + 6 + h * 1.5);
    camera.position.lerp(camGoal, 0.05);
    lookAt.set(player.position.x, player.position.y + h * 0.5, player.position.z);
    camera.lookAt(lookAt);
  } else {
    // Slowly circle the magic pond while choosing.
    const a = t * 0.1;
    camera.position.set(Math.sin(a) * 22, 16, Math.cos(a) * 22);
    camera.lookAt(0, 0, 0);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();
