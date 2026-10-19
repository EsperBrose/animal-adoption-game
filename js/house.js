// The inside of your family's house: one cozy boxy room. It is built far
// away from the land (hidden by the fog), and the front door teleports you
// there. The front wall is left open like a dollhouse so the camera can see in.

const ROOM = { x: 0, z: 200, w: 12, d: 9, h: 3.2 };

function createInterior(scene) {
  const group = new THREE.Group();
  group.position.set(ROOM.x, 0, ROOM.z);
  scene.add(group);

  const halfW = ROOM.w / 2;
  const halfD = ROOM.d / 2;

  // Wooden floor planks.
  for (let i = 0; i < ROOM.w; i++) {
    const plank = makeBox(1, 0.2, ROOM.d, i % 2 ? 0xc8a27a : 0xbf9670);
    plank.position.set(-halfW + 0.5 + i, -0.1, 0);
    plank.castShadow = false;
    group.add(plank);
  }

  // Walls (they don't cast shadows, so the room stays bright).
  const wallColor = 0xfff3e0;
  const back = makeBox(ROOM.w + 0.6, ROOM.h, 0.3, wallColor);
  back.position.set(0, ROOM.h / 2, -halfD - 0.15);
  group.add(back);
  for (const side of [-1, 1]) {
    const wall = makeBox(0.3, ROOM.h, ROOM.d, wallColor);
    wall.position.set(side * (halfW + 0.15), ROOM.h / 2, 0);
    group.add(wall);
  }
  group.children.forEach((mesh) => (mesh.castShadow = false));

  // Baseboards, windows and a doormat.
  const baseboard = makeBox(ROOM.w, 0.25, 0.05, 0xa1887f);
  baseboard.position.set(0, 0.125, -halfD + 0.03);
  group.add(baseboard);
  for (const wx of [-3, 3]) {
    const frame = makeBox(2.2, 1.4, 0.06, 0xffffff);
    frame.position.set(wx, 1.9, -halfD + 0.03);
    const glass = makeBox(1.9, 1.1, 0.06, 0x90caf9);
    glass.position.set(wx, 1.9, -halfD + 0.06);
    group.add(frame, glass);
  }
  const mat = makeBox(1.6, 0.05, 1, 0x8d6e63);
  mat.position.set(0, 0.03, halfD - 0.6);
  group.add(mat);

  // A warm lamp light so it feels like inside.
  const glow = new THREE.PointLight(0xffe0b2, 0.5, 14);
  glow.position.set(0, ROOM.h - 0.3, 0);
  group.add(glow);

  // Furniture placed in the room: { id, x, z, hw, hd, mesh } in room coordinates.
  const placed = [];

  const contains = (x, z) => Math.abs(x - ROOM.x) < 40 && Math.abs(z - ROOM.z) < 40;

  function isBlocked(x, z, radius = 0.5) {
    const lx = x - ROOM.x;
    const lz = z - ROOM.z;
    // The open front edge is blocked too; you leave through the doormat.
    if (Math.abs(lx) > halfW - radius || lz < -halfD + radius || lz > halfD - radius) return true;
    return placed.some((p) => Math.abs(p.x - lx) < p.hw + radius && Math.abs(p.z - lz) < p.hd + radius);
  }

  // Where you appear when you come in, and where you stand to go out.
  const entry = new THREE.Vector3(ROOM.x, 0, ROOM.z + halfD - 1.3);
  const nearExit = (pos) => Math.hypot(pos.x - ROOM.x, pos.z - (ROOM.z + halfD - 0.8)) < 1.4;

  return { group, contains, isBlocked, entry, nearExit, placed };
}
