// Shiny boxy coins scattered around the land. Walk into one to pick it up;
// a new one appears somewhere else a little later. You spend coins at the store.

const COIN_VALUE = 5;
const COIN_COUNT = 45;
const COIN_RESPAWN = 40; // seconds

function createCoins(scene, world) {
  const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.12);
  const material = new THREE.MeshLambertMaterial({ color: 0xffd54f, emissive: 0x6d4c00 });
  const coins = [];

  // Put a coin somewhere you can reach: not in the pond, a tree or a house.
  function spawn(coin) {
    const edge = world.half - 3;
    for (let tries = 0; tries < 50; tries++) {
      const x = (Math.random() - 0.5) * 2 * edge;
      const z = (Math.random() - 0.5) * 2 * edge;
      if (inPond(x, z, 1) || world.isBlocked(x, z, 0.8)) continue;
      coin.position.set(x, 0.6, z);
      coin.visible = true;
      return;
    }
  }

  for (let i = 0; i < COIN_COUNT; i++) {
    const coin = new THREE.Mesh(geometry, material);
    coin.castShadow = true;
    coin.userData = { phase: i, respawnAt: 0 };
    spawn(coin);
    scene.add(coin);
    coins.push(coin);
  }

  // Spin the coins, and collect any the player touches.
  function update(dt, t, player, onCollect) {
    for (const coin of coins) {
      if (!coin.visible) {
        if (t > coin.userData.respawnAt) spawn(coin);
        continue;
      }
      coin.rotation.y += dt * 3;
      coin.position.y = 0.6 + Math.sin(t * 3 + coin.userData.phase) * 0.1;
      if (!player) continue;
      const reach = (player.userData.radius ?? 0.5) + 0.6;
      if (Math.hypot(coin.position.x - player.position.x, coin.position.z - player.position.z) < reach) {
        coin.visible = false;
        coin.userData.respawnAt = t + COIN_RESPAWN;
        onCollect(COIN_VALUE, coin.position);
      }
    }
  }

  return { update };
}
