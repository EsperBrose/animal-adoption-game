// The airport on the east side of the land: a terminal, a control tower,
// a windsock and a boxy airplane parked at the end of the runway.

// A boxy airplane. Its nose points along +z.
function buildPlane() {
  const plane = new THREE.Group();
  const body = new THREE.Group();
  body.position.y = 1.6;
  plane.add(body);

  const add = (w, h, d, color, x, y, z) => {
    const mesh = makeBox(w, h, d, color);
    mesh.position.set(x, y, z);
    body.add(mesh);
    return mesh;
  };

  add(1.8, 1.8, 10, 0xffffff, 0, 0, 0); // body
  add(1.82, 0.35, 10.02, 0xe53935, 0, -0.35, 0); // red stripe
  add(1.4, 1.4, 1.2, 0xffffff, 0, -0.1, 5.5); // nose
  add(1.2, 0.5, 0.3, 0x1e88e5, 0, 0.25, 6.05); // cockpit window
  for (let i = 0; i < 6; i++) {
    for (const side of [-1, 1]) add(0.05, 0.4, 0.5, 0x90caf9, side * 0.91, 0.3, 3 - i * 1.2); // windows
  }
  add(11, 0.2, 2, 0xeeeeee, 0, -0.3, 0.5); // wings
  for (const side of [-1, 1]) {
    add(0.8, 0.8, 1.6, 0x9e9e9e, side * 2.8, -0.75, 0.8); // engines
    add(0.15, 1.0, 0.15, 0x424242, side * 0.6, -1.1, 0.5); // back wheels
    add(0.2, 0.3, 0.4, 0x212121, side * 0.6, -1.5, 0.5);
  }
  add(0.15, 1.0, 0.15, 0x424242, 0, -1.1, 4.5); // front wheel
  add(0.2, 0.3, 0.4, 0x212121, 0, -1.5, 4.5);
  add(0.2, 2.0, 1.6, 0xe53935, 0, 1.6, -4.4); // tail fin
  add(4, 0.15, 1.2, 0xeeeeee, 0, 0.2, -4.6); // tail wings
  add(0.06, 1.1, 0.7, 0x5d4037, 0.92, 0.0, 3.6); // door

  plane.userData.body = body;
  return plane;
}

function makeTerminal(x, z) {
  const terminal = new THREE.Group();
  const hall = makeBox(5, 3, 8, 0xeceff1);
  hall.position.y = 1.5;
  const glass = makeBox(0.1, 1.8, 7, 0x81d4fa);
  glass.position.set(2.55, 1.6, 0);
  const roof = makeBox(5.6, 0.3, 8.6, 0x546e7a);
  roof.position.y = 3.15;
  terminal.add(hall, glass, roof);
  // Control tower.
  const tower = makeBox(1.4, 6, 1.4, 0xeceff1);
  tower.position.set(-1, 6, -2.5);
  const cab = makeBox(2.4, 1.4, 2.4, 0x4fc3f7);
  cab.position.set(-1, 9.6, -2.5);
  const cap = makeBox(2.8, 0.3, 2.8, 0x546e7a);
  cap.position.set(-1, 10.45, -2.5);
  terminal.add(tower, cab, cap);
  terminal.position.set(x, 0, z);
  terminal.userData.wide = true;
  return terminal;
}

function makeWindsock(x, z) {
  const sock = new THREE.Group();
  const pole = makeBox(0.12, 3, 0.12, 0x9e9e9e);
  pole.position.y = 1.5;
  sock.add(pole);
  for (let i = 0; i < 4; i++) {
    const piece = makeBox(0.4 - i * 0.05, 0.4 - i * 0.05, 0.4, i % 2 ? 0xffffff : 0xff7043);
    piece.position.set(0, 2.8, 0.25 + i * 0.4);
    sock.add(piece);
  }
  sock.position.set(x, 0, z);
  return sock;
}

function createAirport(scene, world) {
  const terminal = makeTerminal(31, -2);
  scene.add(terminal);
  world.colliders.push({ x: 31, z: -2, hw: 2.7, hd: 4.2 });

  scene.add(makeWindsock(44, 0));

  // The plane waits at the south end of the runway, nose pointing north (-z).
  const plane = buildPlane();
  const parked = new THREE.Vector3(AIRPORT.runwayX, 0, 15);
  plane.position.copy(parked);
  plane.rotation.y = Math.PI;
  scene.add(plane);
  // You bump into the plane's body (and can walk under the wings).
  const planeCollider = { x: parked.x, z: parked.z, hw: 1, hd: 5.6 };
  world.colliders.push(planeCollider);

  // Where you stand to get on (next to the door, on the plane's left side).
  const boardSpot = new THREE.Vector3(AIRPORT.runwayX - 2.2, 0, 15 - 3.6);

  return { plane, planeCollider, parked, boardSpot };
}
