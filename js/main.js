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
function loop() {
  const t = clock.getElapsedTime();
  world.update(t);

  // Slowly circle the magic pond.
  const a = t * 0.1;
  camera.position.set(Math.sin(a) * 22, 16, Math.cos(a) * 22);
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();
