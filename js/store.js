// Everything the town store sells, and how to build each thing out of boxes.
// Furniture goes in your room (hw/hd = half its width/depth, for bumping into);
// hats go on your head.

const STORE_ITEMS = [
  { id: "petbed", kind: "furniture", emoji: "🧺", name: "Pet bed", price: 30, hw: 0.7, hd: 0.7 },
  { id: "bowl", kind: "furniture", emoji: "🥣", name: "Food bowl", price: 10, hw: 0.3, hd: 0.3 },
  { id: "rug", kind: "furniture", emoji: "🟥", name: "Rug", price: 15, hw: 0, hd: 0 },
  { id: "plant", kind: "furniture", emoji: "🪴", name: "Plant", price: 15, hw: 0.35, hd: 0.35 },
  { id: "chair", kind: "furniture", emoji: "🪑", name: "Chair", price: 20, hw: 0.4, hd: 0.4 },
  { id: "teddy", kind: "furniture", emoji: "🧸", name: "Teddy bear", price: 20, hw: 0.3, hd: 0.3 },
  { id: "lamp", kind: "furniture", emoji: "💡", name: "Lamp", price: 25, hw: 0.3, hd: 0.3 },
  { id: "table", kind: "furniture", emoji: "🍽️", name: "Table", price: 40, hw: 0.8, hd: 0.5 },
  { id: "bookshelf", kind: "furniture", emoji: "📚", name: "Bookshelf", price: 50, hw: 0.8, hd: 0.3 },
  { id: "bed", kind: "furniture", emoji: "🛏️", name: "Bed", price: 60, hw: 1.0, hd: 1.5 },
  { id: "sofa", kind: "furniture", emoji: "🛋️", name: "Sofa", price: 80, hw: 1.3, hd: 0.5 },
  { id: "tv", kind: "furniture", emoji: "📺", name: "TV", price: 100, hw: 0.8, hd: 0.3 },
  { id: "bow", kind: "hat", emoji: "🎀", name: "Bow", price: 15 },
  { id: "party", kind: "hat", emoji: "🎉", name: "Party hat", price: 25 },
  { id: "tophat", kind: "hat", emoji: "🎩", name: "Top hat", price: 50 },
  { id: "crown", kind: "hat", emoji: "👑", name: "Crown", price: 80 },
];

const itemById = (id) => STORE_ITEMS.find((item) => item.id === id);

// A box part with its bottom resting at height y (easier for stacking furniture).
function piece(group, w, h, d, color, x, y, z) {
  const mesh = makeBox(w, h, d, color);
  mesh.position.set(x, y + h / 2, z);
  group.add(mesh);
  return mesh;
}

function buildItem(id) {
  const g = new THREE.Group();
  switch (id) {
    case "petbed":
      piece(g, 1.4, 0.2, 1.4, 0x8d6e63, 0, 0, 0);
      for (const [w, d, x, z] of [[1.4, 0.2, 0, -0.6], [1.4, 0.2, 0, 0.6], [0.2, 1.4, -0.6, 0], [0.2, 1.4, 0.6, 0]]) {
        piece(g, w, 0.25, d, 0xa1887f, x, 0.2, z);
      }
      piece(g, 1.0, 0.12, 1.0, 0xf48fb1, 0, 0.2, 0);
      break;
    case "bowl":
      piece(g, 0.55, 0.15, 0.55, 0x42a5f5, 0, 0, 0);
      piece(g, 0.4, 0.06, 0.4, 0x8d6e63, 0, 0.15, 0); // food!
      break;
    case "rug":
      piece(g, 3, 0.03, 2, 0xe57373, 0, 0, 0);
      piece(g, 2.4, 0.04, 1.4, 0xffcdd2, 0, 0, 0);
      break;
    case "plant":
      piece(g, 0.5, 0.45, 0.5, 0xd84315, 0, 0, 0);
      piece(g, 0.6, 0.5, 0.6, 0x43a047, 0, 0.45, 0);
      piece(g, 0.35, 0.35, 0.35, 0x66bb6a, 0, 0.95, 0);
      break;
    case "chair":
      piece(g, 0.7, 0.12, 0.7, 0xa1887f, 0, 0.5, 0);
      piece(g, 0.7, 0.7, 0.12, 0xa1887f, 0, 0.62, -0.29);
      for (const [x, z] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]]) piece(g, 0.1, 0.5, 0.1, 0x6d4c41, x, 0, z);
      break;
    case "teddy":
      piece(g, 0.45, 0.45, 0.35, 0xa1662f, 0, 0, 0);
      piece(g, 0.38, 0.38, 0.32, 0xa1662f, 0, 0.45, 0);
      for (const side of [-1, 1]) piece(g, 0.13, 0.13, 0.1, 0xa1662f, side * 0.15, 0.8, 0);
      piece(g, 0.14, 0.1, 0.06, 0xd7ccc8, 0, 0.55, 0.17);
      break;
    case "lamp": {
      piece(g, 0.4, 0.08, 0.4, 0x5d4037, 0, 0, 0);
      piece(g, 0.08, 1.3, 0.08, 0x5d4037, 0, 0.08, 0);
      const shade = piece(g, 0.55, 0.4, 0.55, 0xfff59d, 0, 1.3, 0);
      shade.material.emissive = new THREE.Color(0x8d7a00);
      break;
    }
    case "table":
      piece(g, 1.6, 0.12, 1.0, 0x8d6e63, 0, 0.75, 0);
      for (const [x, z] of [[-0.7, -0.4], [0.7, -0.4], [-0.7, 0.4], [0.7, 0.4]]) piece(g, 0.12, 0.75, 0.12, 0x6d4c41, x, 0, z);
      break;
    case "bookshelf": {
      piece(g, 1.6, 2.2, 0.6, 0x8d6e63, 0, 0, 0);
      const books = [0xe53935, 0x1e88e5, 0xfdd835, 0x43a047, 0x8e24aa];
      for (let shelf = 0; shelf < 3; shelf++) {
        for (let b = 0; b < 5; b++) piece(g, 0.22, 0.5, 0.45, books[(b + shelf) % 5], -0.55 + b * 0.27, 0.2 + shelf * 0.7, 0.1);
      }
      break;
    }
    case "bed":
      piece(g, 2, 0.45, 3, 0x8d6e63, 0, 0, 0);
      piece(g, 1.9, 0.25, 2.9, 0xffffff, 0, 0.45, 0);
      piece(g, 1.92, 0.08, 1.9, 0x64b5f6, 0, 0.7, 0.45); // blanket
      piece(g, 1.2, 0.2, 0.5, 0xffffff, 0, 0.7, -1.1); // pillow
      piece(g, 2, 1.0, 0.15, 0x6d4c41, 0, 0, -1.5); // headboard
      break;
    case "sofa":
      piece(g, 2.6, 0.5, 1, 0x7e57c2, 0, 0, 0);
      piece(g, 2.6, 0.7, 0.25, 0x673ab7, 0, 0.5, -0.38);
      for (const side of [-1, 1]) piece(g, 0.25, 0.4, 1, 0x673ab7, side * 1.18, 0.5, 0);
      break;
    case "tv": {
      piece(g, 1.6, 0.5, 0.6, 0x5d4037, 0, 0, 0);
      piece(g, 1.5, 0.9, 0.1, 0x212121, 0, 0.5, 0);
      const screen = piece(g, 1.35, 0.75, 0.02, 0x4fc3f7, 0, 0.58, 0.06);
      screen.material.emissive = new THREE.Color(0x0d47a1);
      break;
    }
  }
  return g;
}

// Hats are built for a head that is 1 unit wide, then scaled to fit.
function buildHat(id) {
  const g = new THREE.Group();
  switch (id) {
    case "bow":
      for (const side of [-1, 1]) piece(g, 0.3, 0.3, 0.15, 0xec407a, side * 0.2, 0, 0.1);
      piece(g, 0.15, 0.15, 0.17, 0xad1457, 0, 0.07, 0.1);
      break;
    case "party":
      [[0.55, 0xffeb3b], [0.4, 0x29b6f6], [0.25, 0xef5350]].forEach(([w, color], i) => piece(g, w, 0.25, w, color, 0, i * 0.25, 0));
      piece(g, 0.12, 0.12, 0.12, 0xffffff, 0, 0.75, 0);
      break;
    case "tophat":
      piece(g, 0.9, 0.06, 0.9, 0x212121, 0, 0, 0);
      piece(g, 0.6, 0.6, 0.6, 0x212121, 0, 0.06, 0);
      piece(g, 0.62, 0.1, 0.62, 0xe53935, 0, 0.1, 0);
      break;
    case "crown":
      piece(g, 0.7, 0.2, 0.7, 0xffd54f, 0, 0, 0);
      for (const [x, z] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28], [0, 0.3]]) piece(g, 0.14, 0.2, 0.14, 0xffd54f, x, 0.2, z);
      piece(g, 0.12, 0.12, 0.05, 0xe53935, 0, 0.06, 0.36);
      break;
  }
  return g;
}
