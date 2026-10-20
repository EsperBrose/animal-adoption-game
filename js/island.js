// Sunny Island: a round tropical island far out at sea, with a sandy beach,
// palm trees, a smoothie hut, a little runway and wild animals.

const ISLAND = { x: 400, z: 0, r: 28 };
const ISLAND_RUNWAY = { x: ISLAND.x - 15, halfWidth: 2.5, zMin: -18, zMax: 15 };

function makePalm(x, z, rand) {
  const palm = new THREE.Group();
  const lean = (rand() - 0.5) * 0.5;
  for (let i = 0; i < 5; i++) {
    const piece = makeBox(0.45, 0.8, 0.45, i % 2 ? 0x8d6e63 : 0xa1887f);
    piece.position.set(lean * i * 0.4, 0.4 + i * 0.8, 0);
    palm.add(piece);
  }
  const topX = lean * 2;
  for (let i = 0; i < 5; i++) {
    const leaf = makeBox(0.5, 0.12, 2.4, i % 2 ? 0x43a047 : 0x2e7d32);
    const angle = (i / 5) * Math.PI * 2;
    leaf.position.set(topX + Math.sin(angle) * 1.1, 4.1, Math.cos(angle) * 1.1);
    leaf.rotation.y = angle;
    leaf.rotation.x = 0.35;
    palm.add(leaf);
  }
  for (const side of [-1, 1]) {
    const coconut = makeBox(0.3, 0.3, 0.3, 0x6d4c41);
    coconut.position.set(topX + side * 0.25, 3.75, 0.2);
    palm.add(coconut);
  }
  palm.position.set(x, 0, z);
  palm.rotation.y = rand() * Math.PI * 2;
  return palm;
}

function makeHut(x, z) {
  const hut = new THREE.Group();
  for (const [px, pz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) {
    const post = makeBox(0.25, 2.2, 0.25, 0x8d6e63);
    post.position.set(px, 1.1, pz);
    hut.add(post);
  }
  const counter = makeBox(3, 1, 0.6, 0xffcc80);
  counter.position.set(0, 0.5, 1.3);
  hut.add(counter);
  [[3.6, 3.6], [2.6, 2.6], [1.4, 1.4]].forEach(([w, d], i) => {
    const straw = makeBox(w, 0.4, d, i % 2 ? 0xffe082 : 0xffd54f);
    straw.position.y = 2.4 + i * 0.4;
    hut.add(straw);
  });
  for (let i = 0; i < 3; i++) {
    const cup = makeBox(0.2, 0.3, 0.2, [0xff80ab, 0xffeb3b, 0x80deea][i]);
    cup.position.set(-0.8 + i * 0.8, 1.15, 1.3);
    hut.add(cup);
  }
  hut.position.set(x, 0, z);
  return hut;
}

function createIsland(scene, world) {
  const rand = seededRandom(2026);
  const group = new THREE.Group();
  scene.add(group);
  const colliders = [];
  const inIsland = (x, z, margin = 0) => Math.hypot(x - ISLAND.x, z - ISLAND.z) < ISLAND.r - margin;
  const onRunway = (x, z) => Math.abs(x - ISLAND_RUNWAY.x) < ISLAND_RUNWAY.halfWidth + 1 && z > ISLAND_RUNWAY.zMin - 1 && z < ISLAND_RUNWAY.zMax + 1;

  // Ground: sand around the edge, jungle green in the middle, and the runway.
  const size = ISLAND.r * 2;
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial(), size * size);
  tiles.receiveShadow = true;
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();
  let count = 0;
  for (let gx = 0; gx < size; gx++) {
    for (let gz = 0; gz < size; gz++) {
      const x = ISLAND.x - ISLAND.r + gx + 0.5;
      const z = ISLAND.z - ISLAND.r + gz + 0.5;
      if (!inIsland(x, z)) continue;
      let hex;
      if (Math.abs(x - ISLAND_RUNWAY.x) < ISLAND_RUNWAY.halfWidth && z > ISLAND_RUNWAY.zMin && z < ISLAND_RUNWAY.zMax) {
        hex = Math.abs(x - ISLAND_RUNWAY.x) < 0.6 && Math.floor(z) % 3 === 0 ? 0xffffff : 0x616161;
      } else if (!inIsland(x, z, 4)) {
        hex = rand() < 0.5 ? 0xffe0a3 : 0xf6d88f; // beach
      } else {
        hex = [0x5cb85c, 0x4caf50, 0x66bb6a][Math.floor(rand() * 3)];
      }
      matrix.makeTranslation(x, -0.5, z);
      tiles.setMatrixAt(count, matrix);
      tiles.setColorAt(count, color.setHex(hex));
      count++;
    }
  }
  tiles.count = count;
  group.add(tiles);

  const hutSpot = { x: ISLAND.x + 8, z: ISLAND.z + 10 };
  group.add(makeHut(hutSpot.x, hutSpot.z));
  colliders.push({ x: hutSpot.x, z: hutSpot.z, hw: 1.6, hd: 1.6 });

  // Palm trees (not on the runway or by the hut).
  for (let tries = 0, palms = 0; palms < 45 && tries < 2000; tries++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * (ISLAND.r - 2);
    const x = ISLAND.x + Math.cos(a) * d;
    const z = ISLAND.z + Math.sin(a) * d;
    if (onRunway(x, z) || Math.hypot(x - hutSpot.x, z - hutSpot.z) < 4) continue;
    if (Math.hypot(x - ISLAND.x, z - ISLAND.z) < 4) continue; // a clearing in the middle
    if (colliders.some((c) => c.r && Math.hypot(c.x - x, c.z - z) < 2.6)) continue;
    const palm = makePalm(x, z, rand);
    group.add(palm);
    world.addFadeable(palm);
    colliders.push({ x, z, r: 0.6 });
    palms++;
  }

  // Bright tropical flowers.
  for (let f = 0; f < 70; f++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * (ISLAND.r - 5);
    const x = ISLAND.x + Math.cos(a) * d;
    const z = ISLAND.z + Math.sin(a) * d;
    if (onRunway(x, z)) continue;
    const flower = makeFlower(x, z, rand);
    flower.children[1].material.color.setHex([0xff1744, 0xff4081, 0xffab00][f % 3]);
    group.add(flower);
  }

  function isBlocked(x, z, radius = 0.5) {
    if (!inIsland(x, z, 1 + radius)) return true; // the sea
    return colliders.some((c) =>
      c.r
        ? Math.hypot(c.x - x, c.z - z) < c.r + radius
        : Math.abs(c.x - x) < c.hw + radius && Math.abs(c.z - z) < c.hd + radius
    );
  }
  const contains = (x, z) => Math.abs(x - ISLAND.x) < 80 && Math.abs(z - ISLAND.z) < 80;

  // ---------- wild animals ----------

  const wild = [];
  for (const [kind, n] of [["monkey", 3], ["parrot", 3], ["turtle", 2], ["frog", 2], ["elephant", 1]]) {
    for (let i = 0; i < n; i++) {
      const animal = buildAnimal(findAnimal(kind));
      const a = rand() * Math.PI * 2;
      const d = 5 + rand() * (ISLAND.r - 10);
      animal.position.set(ISLAND.x + Math.cos(a) * d, 0, ISLAND.z + Math.sin(a) * d);
      animal.userData.target = animal.position.clone();
      animal.userData.rest = rand() * 3;
      animal.userData.walk = 0;
      group.add(animal);
      wild.push(animal);
    }
  }

  // Wild animals amble about, and stop to look at you when you come close.
  function update(dt, t, player) {
    for (const animal of wild) {
      const u = animal.userData;
      const speed = 1.2 * (u.speed ?? 1);
      let moving = false;
      const near = player && Math.hypot(player.position.x - animal.position.x, player.position.z - animal.position.z) < 4;
      if (near) {
        turnToward(animal, player.position.x - animal.position.x, player.position.z - animal.position.z, Math.min(1, dt * 5));
      } else if (u.rest > 0) {
        u.rest -= dt;
      } else {
        const dx = u.target.x - animal.position.x;
        const dz = u.target.z - animal.position.z;
        const dist = Math.hypot(dx, dz);
        const nx = animal.position.x + (dx / dist) * speed * dt;
        const nz = animal.position.z + (dz / dist) * speed * dt;
        if (dist < 0.3 || isBlocked(nx, nz, u.radius ?? 0.5)) {
          // Pick somewhere new to go, then rest a moment.
          const a = rand() * Math.PI * 2;
          const d = rand() * (ISLAND.r - 6);
          u.target.set(ISLAND.x + Math.cos(a) * d, 0, ISLAND.z + Math.sin(a) * d);
          u.rest = 1 + rand() * 4;
        } else {
          animal.position.x = nx;
          animal.position.z = nz;
          turnToward(animal, dx, dz, Math.min(1, dt * 6));
          moving = true;
        }
      }
      u.walk += ((moving ? 1 : 0) - u.walk) * Math.min(1, dt * 6);
      animateAnimal(animal, t, u.walk);
    }
  }

  // Where the plane parks, and where you stand to get on.
  const parked = new THREE.Vector3(ISLAND_RUNWAY.x, 0, 12);
  const boardSpot = new THREE.Vector3(ISLAND_RUNWAY.x - 2.2, 0, 12 - 3.6);

  return { group, contains, isBlocked, update, parked, boardSpot, colliders };
}
