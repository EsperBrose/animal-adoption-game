// Boxy people for the town families. People face +z, like the animals.

const SKIN_TONES = [0xffdbac, 0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0x5c3a1e];
const HAIR_COLORS = [0x2b1b0e, 0x5d4037, 0xa1662f, 0xf2d16b, 0x212121, 0xb0bec5, 0xd84315];
const SHIRT_COLORS = [0xef5350, 0x42a5f5, 0x66bb6a, 0xffca28, 0xab47bc, 0xff7043, 0x26c6da, 0xec407a];
const PANTS_COLORS = [0x37474f, 0x3f51b5, 0x5d4037, 0x455a64, 0x6d4c41];

// Choices for the player's own human.
const GENDERS = [
  { value: "girl", label: "👧 Girl" },
  { value: "boy", label: "👦 Boy" },
  { value: "other", label: "🧒 Other" },
];
const HAIR_STYLES = [
  { value: "short", label: "Short" },
  { value: "long", label: "Long" },
  { value: "bun", label: "Bun" },
  { value: "pigtails", label: "Pigtails" },
  { value: "spiky", label: "Spiky" },
  { value: "cap", label: "Cap" },
];
const HUMAN_DEFAULT_HAIR = { girl: "long", boy: "short", other: "bun" };
const DEFAULT_HUMAN = {
  gender: "girl", skin: SKIN_TONES[1], hair: HAIR_COLORS[1], hairStyle: "long",
  shirt: SHIRT_COLORS[7], pants: PANTS_COLORS[1],
};

function randomLook(rand, kid, skin) {
  const pick = (list) => list[Math.floor(rand() * list.length)];
  return {
    kid,
    skin: skin ?? pick(SKIN_TONES),
    hair: pick(HAIR_COLORS),
    shirt: pick(SHIRT_COLORS),
    pants: pick(PANTS_COLORS),
    hairStyle: pick(["short", "long", "bun", "short", "long", "cap"]),
  };
}

function buildPerson(look) {
  const person = new THREE.Group();
  const model = new THREE.Group();
  model.scale.setScalar(look.kid ? 0.7 : 1);
  person.add(model);
  const legs = [];
  const arms = [];

  for (const side of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.17, 0.8, 0);
    leg.add(part(0.26, 0.8, 0.28, look.pants, 0, -0.4, 0));
    leg.add(part(0.28, 0.12, 0.36, 0x3e2723, 0, -0.76, 0.04));
    model.add(leg);
    legs.push(leg);

    const arm = new THREE.Group();
    arm.position.set(side * 0.45, 1.55, 0);
    arm.add(part(0.2, 0.7, 0.24, look.shirt, 0, -0.3, 0));
    arm.add(part(0.18, 0.16, 0.2, look.skin, 0, -0.72, 0));
    arm.userData.side = side;
    model.add(arm);
    arms.push(arm);
  }

  model.add(part(0.7, 0.8, 0.4, look.shirt, 0, 1.2, 0));

  const head = new THREE.Group();
  head.position.y = 1.95;
  model.add(head);
  head.add(part(0.6, 0.6, 0.6, look.skin));
  for (const side of [-1, 1]) {
    head.add(part(0.08, 0.1, 0.04, 0x212121, side * 0.13, 0.04, 0.31));
    head.add(part(0.1, 0.06, 0.03, 0xf48fb1, side * 0.2, -0.08, 0.305));
  }
  head.add(part(0.2, 0.04, 0.03, 0x6d4c41, 0, -0.14, 0.31));

  const hair = look.hair;
  switch (look.hairStyle) {
    case "short":
      head.add(part(0.64, 0.18, 0.64, hair, 0, 0.3, 0));
      head.add(part(0.64, 0.4, 0.12, hair, 0, 0.1, -0.27));
      break;
    case "long":
      head.add(part(0.64, 0.18, 0.64, hair, 0, 0.3, 0));
      head.add(part(0.66, 0.85, 0.14, hair, 0, -0.1, -0.28));
      for (const side of [-1, 1]) head.add(part(0.1, 0.5, 0.5, hair, side * 0.32, 0.05, -0.05));
      break;
    case "bun":
      head.add(part(0.64, 0.18, 0.64, hair, 0, 0.3, 0));
      head.add(part(0.28, 0.28, 0.28, hair, 0, 0.48, -0.18));
      break;
    case "pigtails":
      head.add(part(0.64, 0.18, 0.64, hair, 0, 0.3, 0));
      head.add(part(0.64, 0.4, 0.12, hair, 0, 0.1, -0.27));
      for (const side of [-1, 1]) head.add(part(0.2, 0.45, 0.2, hair, side * 0.42, 0.0, -0.1));
      break;
    case "spiky":
      head.add(part(0.64, 0.14, 0.64, hair, 0, 0.3, 0));
      for (let s = 0; s < 3; s++) head.add(part(0.16, 0.22, 0.16, hair, (s - 1) * 0.2, 0.46, (s % 2) * 0.1 - 0.05));
      break;
    case "cap":
      head.add(part(0.66, 0.2, 0.66, look.shirt, 0, 0.32, 0));
      head.add(part(0.5, 0.06, 0.3, look.shirt, 0, 0.24, 0.42));
      break;
  }

  person.userData = { model, legs, arms, head, headSize: 0.6, phase: Math.random() * 6, height: (look.kid ? 0.7 : 1) * 2.3 };
  return person;
}

// speed goes from 0 (standing) to 1 (walking). waving raises one arm;
// carrying holds both arms out in front, to hold an animal.
function animatePerson(person, t, speed, waving = false, carrying = false) {
  const p = person.userData;
  const swing = Math.sin(t * 8 + p.phase) * 0.6 * speed;
  p.legs[0].rotation.x = swing;
  p.legs[1].rotation.x = -swing;
  p.arms[0].rotation.x = carrying ? -1.3 : -swing;
  p.arms[1].rotation.x = carrying ? -1.3 : waving ? 0 : swing;
  p.arms[1].rotation.z = waving ? 2.6 + Math.sin(t * 10 + p.phase) * 0.3 : 0;
  p.model.position.y = Math.abs(Math.sin(t * 8 + p.phase)) * 0.05 * speed;
}
