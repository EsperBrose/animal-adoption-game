// The boxy 3D world: grass tiles, the magic pond, trees, flowers and a fence.

const WORLD_SIZE = 96;
const POND = { rx: 6.5, rz: 4.5 };

// The town is north of the pond: a road with a row of houses behind it.
const TOWN = {
  roadZ: -15,
  houseZ: -21,
  houseXs: [-18, -6, 6, 18],
  edgeZ: -11, // everything north of this is town (no trees)
};

function isPath(x, z) {
  if (Math.abs(z - TOWN.roadZ) < 1.5 && Math.abs(x) < 30) return true; // main road
  if (Math.abs(x) < 1.2 && z > TOWN.roadZ && z < -POND.rz - 1) return true; // pond to town
  return TOWN.houseXs.some((hx) => Math.abs(x - hx) < 0.8 && z < TOWN.roadZ && z > TOWN.houseZ + 2); // front paths
}

function makeHouse(x, z, wallColor, roofColor) {
  const house = new THREE.Group();
  const walls = makeBox(4.5, 3, 4, wallColor);
  walls.position.y = 1.5;
  house.add(walls);
  // Stepped boxy roof.
  [[5.1, 4.6], [4.1, 3.6], [3.1, 2.6], [2.1, 1.6]].forEach(([w, d], i) => {
    const step = makeBox(w, 0.6, d, roofColor);
    step.position.y = 3.3 + i * 0.6;
    house.add(step);
  });
  const chimney = makeBox(0.6, 1.2, 0.6, 0x8d6e63);
  chimney.position.set(1.4, 4.6, -0.6);
  house.add(chimney);
  const door = makeBox(1, 1.8, 0.1, 0x8d5524);
  door.position.set(0, 0.9, 2.02);
  house.add(door);
  for (const side of [-1, 1]) {
    const pane = makeBox(0.8, 0.8, 0.1, 0xb3e5fc);
    pane.position.set(side * 1.4, 1.7, 2.02);
    house.add(pane);
  }
  const step = makeBox(1.4, 0.15, 0.6, 0xbdbdbd);
  step.position.set(0, 0.07, 2.3);
  house.add(step);
  house.position.set(x, 0, z);
  house.userData.wide = true;
  return house;
}

// Small seeded random so the world looks the same every time.
function seededRandom(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeBox(w, h, d, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color })
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function inPond(x, z, grow = 0) {
  const rx = POND.rx + grow;
  const rz = POND.rz + grow;
  return (x * x) / (rx * rx) + (z * z) / (rz * rz) < 1;
}

function makeTree(x, z, rand) {
  const tree = new THREE.Group();
  const leafColor = [0x4caf50, 0x43a047, 0x66bb6a][Math.floor(rand() * 3)];
  const trunk = makeBox(0.6, 1.6, 0.6, 0x8d6e63);
  trunk.position.y = 0.8;
  const leaves = makeBox(2, 1.6, 2, leafColor);
  leaves.position.y = 2.3;
  const top = makeBox(1.2, 0.8, 1.2, leafColor);
  top.position.y = 3.5;
  tree.add(trunk, leaves, top);
  tree.position.set(x, 0, z);
  tree.rotation.y = Math.floor(rand() * 4) * (Math.PI / 2);
  return tree;
}

// ---------- the forest (south part of the land) ----------

const FOREST_Z = 22;
const isForest = (x, z) => z > FOREST_Z;
const isTrail = (x, z) => Math.abs(x - Math.sin(z * 0.15) * 3) < 1.1 && z > FOREST_Z - 4;

function makePine(x, z, rand) {
  const tree = new THREE.Group();
  const green = [0x2e7d32, 0x1b5e20, 0x388e3c][Math.floor(rand() * 3)];
  const tall = 0.8 + rand() * 0.5;
  const trunk = makeBox(0.5, 1.2, 0.5, 0x6d4c41);
  trunk.position.y = 0.6;
  tree.add(trunk);
  [[2.4, 1.6], [1.8, 2.4], [1.2, 3.2], [0.6, 3.9]].forEach(([w, y]) => {
    const layer = makeBox(w, 0.8, w, green);
    layer.position.y = y;
    tree.add(layer);
  });
  tree.scale.set(1, tall, 1);
  tree.position.set(x, 0, z);
  tree.rotation.y = Math.floor(rand() * 4) * (Math.PI / 2);
  return tree;
}

function makeMushroom(x, z, rand) {
  const mushroom = new THREE.Group();
  const big = 0.7 + rand() * 0.8;
  const stem = makeBox(0.14, 0.3, 0.14, 0xfff8e1);
  stem.position.y = 0.15;
  const cap = makeBox(0.42, 0.16, 0.42, rand() < 0.7 ? 0xe53935 : 0xa1887f);
  cap.position.y = 0.36;
  const spot = makeBox(0.1, 0.03, 0.1, 0xffffff);
  spot.position.set(0.08, 0.45, 0.05);
  mushroom.add(stem, cap, spot);
  mushroom.scale.setScalar(big);
  mushroom.position.set(x, 0, z);
  return mushroom;
}

function makeRock(x, z, size, rand) {
  const rock = makeBox(size, size * (0.5 + rand() * 0.4), size * (0.7 + rand() * 0.5), rand() < 0.5 ? 0x9e9e9e : 0x8d8d8d);
  rock.position.set(x, rock.geometry.parameters.height / 2, z);
  rock.rotation.y = rand() * Math.PI;
  return rock;
}

function makeFlower(x, z, rand) {
  const flower = new THREE.Group();
  const stem = makeBox(0.08, 0.35, 0.08, 0x2e7d32);
  stem.position.y = 0.175;
  const petalColor = [0xff8a80, 0xffeb3b, 0xce93d8, 0xffffff, 0x90caf9][Math.floor(rand() * 5)];
  const head = makeBox(0.25, 0.25, 0.25, petalColor);
  head.position.y = 0.42;
  flower.add(stem, head);
  flower.position.set(x, 0, z);
  return flower;
}

function buildWorld(scene) {
  const rand = seededRandom(42);
  const half = WORLD_SIZE / 2;
  const colliders = []; // circles {x, z, r} for trees, boxes {x, z, hw, hd} for houses
  const trees = [];

  // Is a circle of this radius at (x, z) bumping into the fence, a tree or a house?
  function isBlocked(x, z, radius = 0.5) {
    const limit = half - 0.5 - radius;
    if (Math.abs(x) > limit || Math.abs(z) > limit) return true;
    return colliders.some((c) =>
      c.r
        ? Math.hypot(c.x - x, c.z - z) < c.r + radius
        : Math.abs(c.x - x) < c.hw + radius && Math.abs(c.z - z) < c.hd + radius
    );
  }

  // Ground tiles: one instanced mesh, each tile gets its own color.
  const ground = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshLambertMaterial(),
    WORLD_SIZE * WORLD_SIZE
  );
  ground.receiveShadow = true;
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  const grass = [0x7ec850, 0x74bf47, 0x88d15a];
  const water = [0x4fc3f7, 0x29b6f6];
  let i = 0;
  for (let gx = 0; gx < WORLD_SIZE; gx++) {
    for (let gz = 0; gz < WORLD_SIZE; gz++) {
      const x = gx - half + 0.5;
      const z = gz - half + 0.5;
      let hex;
      let y = -0.5;
      if (inPond(x, z)) {
        hex = water[Math.floor(rand() * water.length)];
        y = -0.75;
      } else if (inPond(x, z, 1.5)) {
        hex = 0xf2d98d; // sandy shore
      } else if (isPath(x, z)) {
        hex = rand() < 0.5 ? 0xd7ccc8 : 0xcfc2bd;
      } else if (isTrail(x, z)) {
        hex = rand() < 0.5 ? 0xa1887f : 0x8d6e63; // dirt trail into the forest
      } else if (isForest(x, z)) {
        hex = [0x4e8f3a, 0x467f34, 0x55993f][Math.floor(rand() * 3)];
      } else {
        hex = grass[Math.floor(rand() * grass.length)];
      }
      matrix.makeTranslation(x, y, z);
      ground.setMatrixAt(i, matrix);
      ground.setColorAt(i, color.setHex(hex));
      i++;
    }
  }
  scene.add(ground);

  // Houses along the north side of the road.
  const houseColors = [[0xffe0b2, 0xe57373], [0xb3e5fc, 0x5c6bc0], [0xfff9c4, 0x66bb6a], [0xf8bbd0, 0x8d6e63]];
  const houses = TOWN.houseXs.map((hx, h) => {
    const group = makeHouse(hx, TOWN.houseZ, ...houseColors[h]);
    scene.add(group);
    trees.push(group); // houses fade out too when they block the view
    colliders.push({ x: hx, z: TOWN.houseZ, hw: 2.4, hd: 2.1 });
    return { group, x: hx, z: TOWN.houseZ, doorX: hx, doorZ: TOWN.houseZ + 3 };
  });

  // The forest: lots of pine trees, with a dirt trail winding through.
  const edge = half - 2;
  for (let tries = 0, pines = 0; pines < 200 && tries < 5000; tries++) {
    const x = (rand() - 0.5) * 2 * edge;
    const z = FOREST_Z + 1 + rand() * (edge - FOREST_Z - 1);
    if (isTrail(x, z)) continue;
    if (colliders.some((c) => c.r && Math.hypot(c.x - x, c.z - z) < 2.5)) continue;
    const pine = makePine(x, z, rand);
    scene.add(pine);
    trees.push(pine);
    colliders.push({ x, z, r: 0.7 });
    pines++;
  }
  for (let m = 0; m < 70; m++) {
    const x = (rand() - 0.5) * 2 * edge;
    const z = FOREST_Z + rand() * (edge - FOREST_Z);
    if (!isBlocked(x, z, 0.3)) scene.add(makeMushroom(x, z, rand));
  }
  for (let r = 0; r < 35; r++) {
    const x = (rand() - 0.5) * 2 * edge;
    const z = FOREST_Z - 6 + rand() * (edge - FOREST_Z + 6);
    const size = 0.4 + rand() * 1.4;
    if (isTrail(x, z) || isBlocked(x, z, size)) continue;
    scene.add(makeRock(x, z, size, rand));
    if (size > 0.9) colliders.push({ x, z, r: size * 0.5 });
  }
  for (let l = 0; l < 8; l++) {
    const x = (rand() - 0.5) * 2 * (edge - 3);
    const z = FOREST_Z + 2 + rand() * (edge - FOREST_Z - 4);
    if (isTrail(x, z) || isBlocked(x, z, 1.8)) continue;
    const log = makeBox(3, 0.6, 0.6, 0x795548);
    log.position.set(x, 0.3, z);
    scene.add(log);
    colliders.push({ x, z, hw: 1.5, hd: 0.3 });
  }

  // Trees, kept away from the pond, the town, the forest and the start area.
  let placed = 0;
  while (placed < 130) {
    const x = Math.round((rand() - 0.5) * (WORLD_SIZE - 4));
    const z = Math.round((rand() - 0.5) * (WORLD_SIZE - 4));
    if (inPond(x, z, 4)) continue;
    if (z < TOWN.edgeZ || isPath(x, z) || isForest(x, z) || isTrail(x, z)) continue;
    if (Math.abs(x) < 5 && z > 0 && z < POND.rz + 14) continue; // keep the start area clear

    if (colliders.some((c) => c.r && Math.hypot(c.x - x, c.z - z) < 3)) continue;
    const tree = makeTree(x, z, rand);
    scene.add(tree);
    trees.push(tree);
    colliders.push({ x, z, r: 0.9 });
    placed++;
  }

  // Flowers sprinkled on the grass.
  for (let f = 0; f < 380; f++) {
    const x = (rand() - 0.5) * (WORLD_SIZE - 3);
    const z = (rand() - 0.5) * (WORLD_SIZE - 3);
    if (inPond(x, z, 2) || isPath(x, z) || isForest(x, z) || isTrail(x, z) || isBlocked(x, z, 0.3)) continue;
    scene.add(makeFlower(x, z, rand));
  }

  // Fence around the edge.
  const postCount = Math.floor(WORLD_SIZE / 2) * 4;
  const posts = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.3, 1, 0.3),
    new THREE.MeshLambertMaterial({ color: 0xbc8f5f }),
    postCount
  );
  posts.castShadow = true;
  let p = 0;
  for (let s = -half; s < half; s += 2) {
    for (const [px, pz] of [[s, -half], [s + 2, half], [-half, s + 2], [half, s]]) {
      matrix.makeTranslation(px, 0.5, pz);
      posts.setMatrixAt(p++, matrix);
    }
  }
  scene.add(posts);
  for (const [w, d, x, z] of [
    [WORLD_SIZE, 0.15, 0, -half], [WORLD_SIZE, 0.15, 0, half],
    [0.15, WORLD_SIZE, -half, 0], [0.15, WORLD_SIZE, half, 0],
  ]) {
    const rail = makeBox(w, 0.15, d, 0xd7a574);
    rail.position.set(x, 0.7, z);
    scene.add(rail);
  }

  // Magic sparkles floating over the pond.
  const sparkles = [];
  for (let s = 0; s < 14; s++) {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshBasicMaterial({ color: s % 2 ? 0xfff59d : 0xffffff })
    );
    cube.userData.angle = (s / 14) * Math.PI * 2;
    cube.userData.speed = 0.3 + rand() * 0.4;
    scene.add(cube);
    sparkles.push(cube);
  }

  function update(t) {
    for (const cube of sparkles) {
      const a = cube.userData.angle + t * cube.userData.speed;
      cube.position.set(Math.cos(a) * POND.rx * 0.6, 0.6 + Math.sin(t * 2 + a * 3) * 0.3, Math.sin(a) * POND.rz * 0.6);
      cube.rotation.x = t * 2;
      cube.rotation.y = t * 3;
    }
  }

  // Trees standing between the camera and the player turn see-through.
  function fadeTrees(playerPos, cameraPos) {
    for (const tree of trees) {
      const p = tree.position;
      const inTheWay = p.z > playerPos.z + 0.3 && p.z < cameraPos.z + 1.5 && Math.abs(p.x - playerPos.x) < (tree.userData.wide ? 3.5 : 2.4);
      if (!inTheWay && !tree.userData.faded) continue; // most trees: nothing to do
      const goal = inTheWay ? 0.25 : 1;
      for (const mesh of tree.children) {
        const m = mesh.material;
        m.opacity += (goal - m.opacity) * 0.15;
        if (!inTheWay && m.opacity > 0.98) m.opacity = 1;
        m.transparent = m.opacity < 1;
        mesh.castShadow = !m.transparent;
      }
      tree.userData.faded = tree.children[0].material.opacity < 1;
    }
  }

  return { update, fadeTrees, isBlocked, colliders, houses, half };
}
