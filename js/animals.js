// Boxy animals! Every animal is built only from boxes, using a "spec" that says
// how big each part is and which extras (manes, horns, wings...) it has.
// Animals face +z.

const ANIMALS = {
  dog:      { name: "Dog", emoji: "🐶", color: 0xc68642, ears: "floppy", tail: "up", snout: 0.3 },
  cat:      { name: "Cat", emoji: "🐱", color: 0xf4a460, body: [0.65, 0.6, 1.2], legs: 0.45, head: 0.62, tail: "long", snout: 0.12 },
  bunny:    { name: "Bunny", emoji: "🐰", color: 0xf5f5f5, accent: 0xffc0cb, body: [0.7, 0.65, 0.9], legs: 0.25, head: 0.6, ears: "long", tail: "puff", snout: 0.1 },
  fox:      { name: "Fox", emoji: "🦊", color: 0xff7f27, accent: 0xffffff, body: [0.65, 0.6, 1.3], legs: 0.45, head: 0.6, tail: "fluffy", snout: 0.35 },
  wolf:     { name: "Wolf", emoji: "🐺", color: 0x8a8f99, accent: 0xeeeeee, body: [0.8, 0.75, 1.5], legs: 0.6, head: 0.65, tail: "fluffy", snout: 0.4 },
  horse:    { name: "Horse", emoji: "🐴", color: 0x8b5a2b, accent: 0x3e2723, body: [0.9, 0.9, 1.8], legs: 1.0, legW: 0.25, head: 0.6, neck: 0.6, snout: 0.45, tail: "long", extras: ["mane"] },
  unicorn:  { name: "Unicorn", emoji: "🦄", color: 0xffffff, accent: 0xce93d8, body: [0.9, 0.9, 1.8], legs: 1.0, legW: 0.25, head: 0.6, neck: 0.6, snout: 0.45, tail: "long", extras: ["mane", "horn"] },
  zebra:    { name: "Zebra", emoji: "🦓", color: 0xffffff, accent: 0x222222, body: [0.9, 0.9, 1.7], legs: 1.0, legW: 0.24, head: 0.6, neck: 0.6, snout: 0.45, tail: "tuft", extras: ["mane", "stripes"] },
  pig:      { name: "Pig", emoji: "🐷", color: 0xffb6c1, body: [0.9, 0.8, 1.3], legs: 0.3, head: 0.7, snout: 0.15, ears: "floppy", tail: "curly" },
  cow:      { name: "Cow", emoji: "🐮", color: 0xffffff, accent: 0x222222, body: [1, 0.9, 1.7], legs: 0.7, legW: 0.26, head: 0.75, snout: 0.25, ears: "side", tail: "tuft", extras: ["spots", "horns"] },
  sheep:    { name: "Sheep", emoji: "🐑", color: 0xfafafa, accent: 0x333333, body: [1, 0.9, 1.3], legs: 0.45, head: 0.55, snout: 0.15, ears: "side", tail: "short", extras: ["wool"] },
  bear:     { name: "Bear", emoji: "🐻", color: 0x8b5a2b, body: [1.1, 1, 1.6], legs: 0.55, legW: 0.32, head: 0.85, snout: 0.25, ears: "round", tail: "short" },
  panda:    { name: "Panda", emoji: "🐼", color: 0xffffff, accent: 0x222222, body: [1.1, 1, 1.6], legs: 0.55, legW: 0.32, head: 0.85, snout: 0.2, ears: "round", tail: "short", extras: ["panda"] },
  koala:    { name: "Koala", emoji: "🐨", color: 0x9e9e9e, accent: 0x424242, body: [0.8, 0.8, 1.0], legs: 0.4, legW: 0.26, head: 0.75, snout: 0, ears: "fluffy", tail: "none", extras: ["bigNose"] },
  lion:     { name: "Lion", emoji: "🦁", color: 0xe0a43c, accent: 0x8d4a1d, body: [0.9, 0.85, 1.6], legs: 0.65, head: 0.75, snout: 0.25, ears: "round", tail: "tuft", extras: ["bigMane"] },
  tiger:    { name: "Tiger", emoji: "🐯", color: 0xff8c1a, accent: 0x222222, body: [0.9, 0.8, 1.7], legs: 0.6, head: 0.75, snout: 0.25, ears: "round", tail: "long", extras: ["stripes"] },
  cheetah:  { name: "Cheetah", emoji: "🐆", color: 0xf2c14e, accent: 0x3e2723, body: [0.7, 0.65, 1.6], legs: 0.75, legW: 0.18, head: 0.55, snout: 0.2, ears: "round", tail: "long", extras: ["spots"] },
  elephant: { name: "Elephant", emoji: "🐘", color: 0x9e9e9e, body: [1.4, 1.3, 2], legs: 0.9, legW: 0.45, head: 1.0, snout: 0, ears: "big", tail: "short", extras: ["trunk", "tusks"] },
  giraffe:  { name: "Giraffe", emoji: "🦒", color: 0xf4c542, accent: 0x8b5a2b, body: [0.9, 0.8, 1.4], legs: 1.5, legW: 0.2, head: 0.5, neck: 2.0, snout: 0.3, tail: "tuft", extras: ["spots", "ossicones"] },
  deer:     { name: "Deer", emoji: "🦌", color: 0xa0662f, accent: 0xffffff, body: [0.8, 0.75, 1.4], legs: 0.9, legW: 0.16, head: 0.55, neck: 0.4, snout: 0.25, tail: "short", extras: ["antlers", "spots"] },
  mouse:    { name: "Mouse", emoji: "🐭", color: 0xb0b0b0, accent: 0xffc0cb, body: [0.5, 0.45, 0.8], legs: 0.15, legW: 0.12, head: 0.45, snout: 0.15, ears: "round", tail: "long" },
  raccoon:  { name: "Raccoon", emoji: "🦝", color: 0x7d7d7d, accent: 0x222222, body: [0.7, 0.6, 1.1], legs: 0.3, head: 0.6, snout: 0.2, tail: "ringed", extras: ["mask"] },
  monkey:   { name: "Monkey", emoji: "🐵", color: 0x8b5a2b, accent: 0xf1c27d, body: [0.7, 0.8, 0.9], legs: 0.55, head: 0.65, snout: 0.1, ears: "side", tail: "curlyLong", extras: ["face"] },
  frog:     { name: "Frog", emoji: "🐸", color: 0x6ccf4f, accent: 0xb9f6ca, body: [0.9, 0.5, 0.9], legs: 0.2, legW: 0.25, head: 0.6, snout: 0, ears: "none", tail: "none", extras: ["frogEyes"] },
  turtle:   { name: "Turtle", emoji: "🐢", color: 0x9ccc65, accent: 0x6d4c41, body: [0.9, 0.4, 1.1], legs: 0.2, legW: 0.25, head: 0.4, snout: 0.1, ears: "none", tail: "short", extras: ["shell"] },
  dragon:   { name: "Dragon", emoji: "🐉", color: 0x7e57c2, accent: 0xffca28, body: [1, 0.9, 1.8], legs: 0.6, legW: 0.3, head: 0.75, neck: 0.3, snout: 0.45, ears: "none", tail: "long", extras: ["wings", "spikes", "horns"] },
  penguin:  { name: "Penguin", emoji: "🐧", type: "bird", color: 0x263238, accent: 0xffffff, body: [0.75, 1.0, 0.65], legs: 0.12, head: 0.55, extras: ["belly"] },
  duck:     { name: "Duck", emoji: "🦆", type: "bird", color: 0xfff176, accent: 0xff9800, body: [0.7, 0.6, 0.9], legs: 0.3, head: 0.5, beak: "flat" },
  chicken:  { name: "Chicken", emoji: "🐔", type: "bird", color: 0xffffff, accent: 0xff9800, body: [0.7, 0.7, 0.85], legs: 0.35, head: 0.45, extras: ["comb"] },
  owl:      { name: "Owl", emoji: "🦉", type: "bird", color: 0x8d6e63, accent: 0xd7ccc8, body: [0.8, 0.9, 0.7], legs: 0.2, head: 0.7, extras: ["bigEyes", "tufts", "belly"] },
  parrot:   { name: "Parrot", emoji: "🦜", type: "bird", color: 0x43a047, accent: 0xe53935, body: [0.6, 0.8, 0.6], legs: 0.3, head: 0.5, extras: ["colorTail"] },
  snake:    { name: "Snake", emoji: "🐍", type: "snake", color: 0x8bc34a, accent: 0xffeb3b },
  fish:     { name: "Fish", emoji: "🐠", type: "fish", color: 0xff9800, accent: 0xffffff },
};

const ALIASES = {
  puppy: "dog", doggy: "dog", doggo: "dog", husky: "dog", kitten: "cat", kitty: "cat",
  rabbit: "bunny", hare: "bunny", pony: "horse", piglet: "pig", lamb: "sheep", goat: "sheep",
  cub: "bear", "polar bear": "bear", hamster: "mouse", rat: "mouse", gerbil: "mouse",
  bird: "parrot", hen: "chicken", rooster: "chicken", chick: "chicken", duckling: "duck",
  cobra: "snake", python: "snake", goldfish: "fish", shark: "fish", toad: "frog",
  tortoise: "turtle", leopard: "cheetah", jaguar: "cheetah", ape: "monkey", gorilla: "monkey",
  reindeer: "deer", moose: "deer", calf: "cow", bull: "cow", wolfie: "wolf", dino: "dragon",
  dinosaur: "dragon",
};

// ---------- looking up an animal from what the player typed ----------

function hashString(text) {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

function titleCase(text) {
  return text.replace(/\b\w/g, (c) => c.toUpperCase());
}

function findAnimal(text) {
  let clean = text.toLowerCase().trim().replace(/[^a-z\s-]/g, "").replace(/^(a|an|the)\s+/, "");
  if (!clean) clean = "dog";
  const singular = clean.replace(/(?<!s)s$/, "");
  for (const word of [clean, singular]) {
    if (ANIMALS[word]) return { key: word, ...ANIMALS[word] };
    if (ALIASES[word]) return { key: ALIASES[word], ...ANIMALS[ALIASES[word]], name: titleCase(word) };
  }
  // "fluffy baby dragon" -> dragon
  for (const word of clean.split(/\s+/).reverse()) {
    const w = word.replace(/(?<!s)s$/, "");
    const key = ANIMALS[w] ? w : ALIASES[w];
    if (key) return { key, ...ANIMALS[key], name: titleCase(clean) };
  }
  return makeMysteryAnimal(clean);
}

// An animal we don't know yet: make up a boxy body from its name,
// so the same name always gives the same animal.
function makeMysteryAnimal(name) {
  const rand = seededRandom(hashString(name));
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const colors = [0xff8a80, 0xffd180, 0xa5d6a7, 0x81d4fa, 0xce93d8, 0xbcaaa4, 0xfff59d, 0x80cbc4];
  const extras = pick([[], [], ["spots"], ["stripes"], ["horns"], ["wings"], ["spikes"], ["mane"]]);
  const neck = rand() < 0.2 ? 0.3 + rand() * 1.0 : 0;
  return {
    key: "mystery",
    name: titleCase(name),
    emoji: "🐾",
    color: pick(colors),
    accent: pick([0x5d4037, 0xffffff, 0x37474f, 0xffca28]),
    body: [0.6 + rand() * 0.6, 0.5 + rand() * 0.5, 0.9 + rand() * 0.9],
    legs: 0.2 + rand() * 0.8,
    head: 0.45 + rand() * 0.4,
    snout: rand() * 0.4,
    neck,
    ears: pick(["point", "round", "floppy", "long", "side", "none"]),
    tail: pick(["short", "long", "fluffy", "up", "curly", "tuft"]),
    extras: neck ? [...extras, "mane"] : extras,
  };
}

// ---------- building ----------

const materialCache = {};
function boxMat(color) {
  if (!materialCache[color]) materialCache[color] = new THREE.MeshLambertMaterial({ color });
  return materialCache[color];
}

function part(w, h, d, color, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), boxMat(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function darker(color, amount = 0.7) {
  return new THREE.Color(color).multiplyScalar(amount).getHex();
}

// Cute eyes: white box with a black pupil, so they show on any color.
function addEyes(head, size, y, z, spread, big = false) {
  const e = big ? 0.2 : 0.13;
  for (const side of [-1, 1]) {
    head.add(part(e, e, 0.04, 0xffffff, side * size * spread, y, z));
    head.add(part(e * 0.55, e * 0.6, 0.04, 0x111111, side * size * spread, y - e * 0.1, z + 0.02));
  }
}

function addEars(head, s, H, earColor) {
  const top = H / 2;
  for (const side of [-1, 1]) {
    switch (s.ears) {
      case "point": head.add(part(H * 0.25, H * 0.3, H * 0.1, earColor, side * H * 0.3, top + H * 0.15, -H * 0.1)); break;
      case "long": head.add(part(H * 0.2, H * 0.9, H * 0.1, earColor, side * H * 0.22, top + H * 0.45, -H * 0.1)); break;
      case "floppy": head.add(part(H * 0.15, H * 0.55, H * 0.35, earColor, side * (H / 2 + H * 0.075), H * 0.02, -H * 0.05)); break;
      case "round": head.add(part(H * 0.3, H * 0.3, H * 0.12, earColor, side * H * 0.38, top + H * 0.1, -H * 0.1)); break;
      case "fluffy": head.add(part(H * 0.45, H * 0.45, H * 0.15, earColor, side * H * 0.55, top - H * 0.05, -H * 0.1)); break;
      case "side": head.add(part(H * 0.3, H * 0.12, H * 0.15, earColor, side * (H / 2 + H * 0.15), H * 0.15, 0)); break;
      case "big": head.add(part(0.08, H * 0.9, H * 0.8, earColor, side * (H / 2 + 0.04), 0, -H * 0.15)); break;
    }
  }
}

function addTail(g, s, x, y, z, color, accent) {
  if (s.tail === "none") return null;
  const pivot = new THREE.Group();
  pivot.position.set(x, y, z);
  const tilt = { short: 0.2, up: 0.8, long: 0.3, fluffy: 0.4, puff: 0, curly: 1.2, tuft: 0.1, ringed: 0.4, curlyLong: 1.0 }[s.tail] ?? 0.3;
  pivot.rotation.x = tilt;
  switch (s.tail) {
    case "short": pivot.add(part(0.2, 0.2, 0.2, color, 0, 0, -0.1)); break;
    case "puff": pivot.add(part(0.3, 0.3, 0.3, 0xffffff, 0, 0, -0.12)); break;
    case "curly": pivot.add(part(0.12, 0.12, 0.2, color, 0, 0, -0.1)); pivot.add(part(0.12, 0.2, 0.12, color, 0, 0.1, -0.2)); break;
    case "up": pivot.add(part(0.12, 0.12, 0.5, color, 0, 0, -0.25)); break;
    case "long": pivot.add(part(0.1, 0.1, 0.9, color, 0, 0, -0.45)); break;
    case "curlyLong": pivot.add(part(0.1, 0.1, 0.8, color, 0, 0, -0.4)); pivot.add(part(0.1, 0.35, 0.1, color, 0, 0.15, -0.8)); break;
    case "tuft": pivot.add(part(0.08, 0.08, 0.7, color, 0, 0, -0.35)); pivot.add(part(0.16, 0.16, 0.16, accent, 0, 0, -0.75)); break;
    case "fluffy": pivot.add(part(0.3, 0.3, 0.7, color, 0, 0, -0.35)); pivot.add(part(0.32, 0.32, 0.22, accent, 0, 0, -0.8)); break;
    case "ringed":
      for (let i = 0; i < 4; i++) pivot.add(part(0.28, 0.28, 0.2, i % 2 ? accent : color, 0, 0, -0.1 - i * 0.2));
      break;
  }
  g.add(pivot);
  return pivot;
}

function buildQuad(s, parts) {
  const g = new THREE.Group();
  const c = s.color;
  const accent = s.accent ?? darker(c);
  const [bw, bh, bd] = s.body;
  const L = s.legs;
  const lw = s.legW;
  const has = (x) => s.extras.includes(x);
  const legColor = has("panda") ? accent : has("wool") ? accent : c;

  // Legs swing from the hip.
  for (const [sx, sz, flip] of [[1, 1, 1], [-1, 1, -1], [1, -1, -1], [-1, -1, 1]]) {
    const pivot = new THREE.Group();
    pivot.position.set(sx * (bw / 2 - lw / 2), L, sz * (bd / 2 - lw / 2));
    pivot.add(part(lw, L, lw, legColor, 0, -L / 2, 0));
    pivot.userData.flip = flip;
    g.add(pivot);
    parts.legs.push(pivot);
  }

  const bodyY = L + bh / 2;
  g.add(part(bw, bh, bd, c, 0, bodyY, 0));

  // Neck and head.
  const H = s.head;
  let headY = L + bh * 0.85 + H / 2;
  let headZ = bd / 2 + H * 0.25;
  if (s.neck > 0) {
    g.add(part(H * 0.55, s.neck + 0.3, H * 0.55, c, 0, L + bh + s.neck / 2 - 0.1, bd / 2 - H * 0.2));
    headY = L + bh + s.neck + H / 2 - 0.1;
    headZ = bd / 2 - H * 0.05 + 0.1;
  }
  const head = new THREE.Group();
  head.position.set(0, headY, headZ);
  g.add(head);
  head.add(part(H, H, H, has("wool") ? accent : c));

  if (s.snout > 0) {
    head.add(part(H * 0.55, H * 0.4, s.snout, has("panda") ? 0xffffff : darker(c, 0.9), 0, -H * 0.2, H / 2 + s.snout / 2));
    head.add(part(H * 0.22, H * 0.15, 0.06, 0x222222, 0, -H * 0.05, H / 2 + s.snout + 0.02));
  } else if (!has("frogEyes") && !has("trunk")) {
    head.add(part(H * 0.2, H * 0.15, 0.06, 0x222222, 0, -H * 0.1, H / 2 + 0.02));
  }

  if (has("frogEyes")) {
    for (const side of [-1, 1]) head.add(part(0.25, 0.25, 0.25, c, side * H * 0.3, H / 2 + 0.08, H * 0.15));
    addEyes(head, H, H / 2 + 0.1, H * 0.15 + 0.14, 0.3);
    head.add(part(H * 0.6, 0.04, 0.04, 0x2e7d32, 0, -H * 0.15, H / 2 + 0.01));
  } else {
    if (has("panda")) for (const side of [-1, 1]) head.add(part(H * 0.28, H * 0.25, 0.03, accent, side * H * 0.25, H * 0.1, H / 2 + 0.005));
    if (has("mask")) head.add(part(H * 0.95, H * 0.22, 0.03, accent, 0, H * 0.12, H / 2 + 0.005));
    if (has("face")) head.add(part(H * 0.75, H * 0.6, 0.03, accent, 0, -H * 0.1, H / 2 + 0.005));
    addEyes(head, H, H * 0.12, H / 2 + 0.03, 0.25);
  }

  const earColor = has("panda") ? accent : s.ears === "long" ? c : c;
  addEars(head, s, H, earColor);

  if (has("mane")) {
    head.add(part(H * 0.2, H * 0.3, H * 0.8, accent, 0, H / 2 + 0.1, -H * 0.15));
    if (s.neck > 0) g.add(part(0.16, s.neck + 0.3, 0.2, accent, 0, L + bh + s.neck / 2, bd / 2 - H * 0.55));
  }
  if (has("bigMane")) head.add(part(H * 1.5, H * 1.5, H * 0.6, accent, 0, 0, -H * 0.15));
  if (has("horn")) {
    const horn = part(0.1, 0.5, 0.1, 0xffd54f, 0, H / 2 + 0.22, H * 0.2);
    horn.rotation.x = 0.3;
    head.add(horn);
  }
  if (has("horns")) for (const side of [-1, 1]) head.add(part(0.09, 0.28, 0.09, 0xfff3e0, side * H * 0.32, H / 2 + 0.13, 0));
  if (has("ossicones")) {
    for (const side of [-1, 1]) {
      head.add(part(0.07, 0.25, 0.07, c, side * H * 0.22, H / 2 + 0.12, -H * 0.1));
      head.add(part(0.12, 0.12, 0.12, accent, side * H * 0.22, H / 2 + 0.27, -H * 0.1));
    }
  }
  if (has("antlers")) {
    for (const side of [-1, 1]) {
      head.add(part(0.07, 0.5, 0.07, 0x6d4c41, side * H * 0.3, H / 2 + 0.25, 0));
      head.add(part(0.3, 0.07, 0.07, 0x6d4c41, side * (H * 0.3 + 0.12), H / 2 + 0.38, 0));
      head.add(part(0.07, 0.25, 0.07, 0x6d4c41, side * (H * 0.3 + 0.25), H / 2 + 0.5, 0));
    }
  }
  if (has("trunk")) {
    head.add(part(0.24, 0.7, 0.24, c, 0, -H * 0.35, H / 2 + 0.12));
    head.add(part(0.24, 0.24, 0.3, c, 0, -H * 0.35 - 0.3, H / 2 + 0.3));
  }
  if (has("tusks")) for (const side of [-1, 1]) head.add(part(0.08, 0.08, 0.4, 0xfffde7, side * H * 0.25, -H * 0.38, H / 2 + 0.15));
  if (has("bigNose")) head.add(part(H * 0.3, H * 0.35, 0.1, accent, 0, -H * 0.12, H / 2 + 0.05));

  // Body decorations.
  const rand = seededRandom(hashString(s.name));
  if (has("spots")) {
    for (let i = 0; i < 8; i++) {
      const side = i % 2 ? 1 : -1;
      const size = 0.12 + rand() * 0.18;
      g.add(part(0.03, size, size * 1.3, accent, side * (bw / 2 + 0.01), bodyY + (rand() - 0.5) * bh * 0.6, (rand() - 0.5) * bd * 0.75));
    }
  }
  if (has("stripes")) {
    for (let i = 0; i < 4; i++) {
      g.add(part(bw + 0.03, bh * 0.8 + 0.02, 0.08, accent, 0, bodyY + bh * 0.1 + 0.01, bd / 2 - 0.3 - i * ((bd - 0.5) / 3)));
    }
  }
  if (has("wool")) g.add(part(bw + 0.15, bh + 0.12, bd + 0.1, c, 0, bodyY + 0.02, 0));
  if (has("panda")) g.add(part(bw + 0.03, bh + 0.03, bd * 0.3, accent, 0, bodyY, bd * 0.2));
  if (has("shell")) {
    g.add(part(bw + 0.2, bh * 0.9, bd + 0.15, accent, 0, bodyY + bh * 0.4, 0));
    g.add(part(bw - 0.1, 0.2, bd - 0.25, darker(accent, 0.8), 0, bodyY + bh * 0.95, 0));
  }
  if (has("spikes")) {
    for (let i = 0; i < 4; i++) g.add(part(0.12, 0.25, 0.12, accent, 0, L + bh + 0.12, bd / 2 - 0.3 - i * ((bd - 0.6) / 3)));
  }
  if (has("wings")) {
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * bw / 2, bodyY + bh * 0.3, 0.1);
      pivot.add(part(1.2, 0.08, 0.9, accent, side * 0.6, 0, 0));
      pivot.userData.side = side;
      g.add(pivot);
      parts.wings.push(pivot);
    }
  }

  parts.tail = addTail(g, s, 0, L + bh * 0.75, -bd / 2, c, accent);
  parts.height = headY + H / 2;
  return g;
}

function buildBird(s, parts) {
  const g = new THREE.Group();
  const c = s.color;
  const accent = s.accent ?? darker(c);
  const [bw, bh, bd] = s.body;
  const L = s.legs;
  const has = (x) => s.extras.includes(x);
  const beakColor = 0xffa000;

  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * bw * 0.25, L, 0);
    pivot.add(part(0.08, L, 0.08, beakColor, 0, -L / 2, 0));
    pivot.add(part(0.2, 0.05, 0.25, beakColor, 0, -L + 0.025, 0.06));
    pivot.userData.flip = side;
    g.add(pivot);
    parts.legs.push(pivot);
  }

  const bodyY = L + bh / 2;
  g.add(part(bw, bh, bd, c, 0, bodyY, 0));
  if (has("belly")) g.add(part(bw * 0.7, bh * 0.75, 0.04, accent, 0, bodyY - bh * 0.08, bd / 2 + 0.01));

  const H = s.head;
  const head = new THREE.Group();
  head.position.set(0, L + bh + H / 2 - 0.08, bd * 0.12);
  g.add(head);
  head.add(part(H, H, H, c));
  addEyes(head, H, H * 0.1, H / 2 + 0.03, 0.27, has("bigEyes"));
  if (s.beak === "flat") head.add(part(H * 0.55, 0.1, 0.3, beakColor, 0, -H * 0.15, H / 2 + 0.15));
  else head.add(part(0.15, 0.13, 0.22, beakColor, 0, -H * 0.12, H / 2 + 0.11));
  if (has("comb")) {
    head.add(part(0.08, 0.2, 0.3, 0xe53935, 0, H / 2 + 0.1, 0));
    head.add(part(0.08, 0.15, 0.1, 0xe53935, 0, -H * 0.35, H / 2 + 0.05));
  }
  if (has("tufts")) for (const side of [-1, 1]) head.add(part(H * 0.2, H * 0.3, H * 0.1, c, side * H * 0.35, H / 2 + 0.12, -H * 0.1));

  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * bw / 2, L + bh * 0.85, 0);
    pivot.add(part(0.08, bh * 0.7, bd * 0.75, darker(c, 0.85), side * 0.04, -bh * 0.35, 0));
    pivot.userData.side = side;
    g.add(pivot);
    parts.wings.push(pivot);
  }

  const tail = part(bw * 0.5, 0.08, has("colorTail") ? 0.6 : 0.3, has("colorTail") ? accent : c, 0, L + bh * 0.25, -bd / 2 - 0.12);
  tail.rotation.x = -0.4;
  g.add(tail);
  parts.height = L + bh + H;
  return g;
}

function buildSnake(s, parts) {
  const g = new THREE.Group();
  const count = 9;
  for (let i = count - 1; i >= 0; i--) {
    const size = 0.42 - i * 0.025;
    const seg = part(size, size * 0.8, 0.34, i % 2 ? s.accent : s.color, 0, size * 0.4, -i * 0.3);
    seg.userData.index = i;
    g.add(seg);
    parts.segments.push(seg);
  }
  const head = new THREE.Group();
  head.position.set(0, 0.25, 0.35);
  head.add(part(0.5, 0.4, 0.45, s.color));
  addEyes(head, 0.5, 0.1, 0.24, 0.25);
  head.add(part(0.06, 0.03, 0.25, 0xe53935, 0, -0.1, 0.33));
  g.add(head);
  parts.segments.push(head);
  head.userData.index = -1;
  parts.height = 0.6;
  return g;
}

function buildFish(s, parts) {
  const g = new THREE.Group();
  const fish = new THREE.Group();
  fish.position.y = 0.8;
  fish.add(part(0.4, 0.6, 0.9, s.color));
  for (let i = 0; i < 2; i++) fish.add(part(0.42, 0.62, 0.1, s.accent, 0, 0, 0.15 - i * 0.35));
  const tail = new THREE.Group();
  tail.position.z = -0.45;
  tail.add(part(0.06, 0.55, 0.35, s.color, 0, 0, -0.17));
  fish.add(tail);
  for (const side of [-1, 1]) fish.add(part(0.25, 0.06, 0.2, s.color, side * 0.3, -0.1, 0.1));
  addEyes(fish, 0.6, 0.1, 0.46, 0.2);
  g.add(fish);
  // Fish carry their own little water bubble so they can go on land!
  const bubble = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.4, 1.6),
    new THREE.MeshLambertMaterial({ color: 0x81d4fa, transparent: true, opacity: 0.3 })
  );
  bubble.position.y = 0.8;
  g.add(bubble);
  parts.tail = tail;
  parts.floater = fish;
  parts.height = 1.5;
  return g;
}

const DEFAULT_SPEC = {
  type: "quad", body: [0.8, 0.7, 1.4], legs: 0.5, legW: 0.22, head: 0.7,
  snout: 0.2, ears: "point", tail: "short", neck: 0, extras: [],
};

function buildAnimal(spec) {
  const s = { ...DEFAULT_SPEC, ...spec };
  const parts = { legs: [], wings: [], segments: [], tail: null, floater: null, height: 1 };
  const builders = { quad: buildQuad, bird: buildBird, snake: buildSnake, fish: buildFish };
  const model = builders[s.type](s, parts);

  const animal = new THREE.Group();
  animal.add(model);
  animal.userData = { spec: s, model, ...parts };
  return animal;
}

// Makes legs walk, wings flap and tails wag. speed goes from 0 (idle) to 1 (walking).
function animateAnimal(animal, t, speed) {
  const p = animal.userData;
  const walk = Math.sin(t * 12);
  for (const leg of p.legs) leg.rotation.x = walk * 0.7 * speed * leg.userData.flip;
  p.model.position.y = Math.abs(walk) * 0.08 * speed;
  if (p.tail) p.tail.rotation.y = Math.sin(t * (speed > 0.1 ? 12 : 4)) * 0.4;
  for (const wing of p.wings) {
    wing.rotation.z = wing.userData.side * Math.sin(t * (speed > 0.1 ? 14 : 3)) * (0.15 + 0.4 * speed);
  }
  for (const seg of p.segments) {
    seg.position.x = Math.sin(t * 6 - seg.userData.index * 0.8) * (0.06 + 0.12 * speed);
  }
  if (p.floater) p.floater.position.y = 0.8 + Math.sin(t * 2) * 0.1;
}
