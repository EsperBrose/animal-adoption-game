// Decorating your room: pick something you bought, slide it around the floor
// and tap to put it down. Tap something already placed to pick it back up.

function createDecorator({ interior, camera, inventory, ui }) {
  let active = false;
  let holding = null; // id of the item you're about to place
  let turns = 0; // quarter turns
  let ghost = null;
  const raycaster = new THREE.Raycaster();
  const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const pointer = new THREE.Vector2();
  const hit = new THREE.Vector3();

  function aim(event) {
    pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.ray.intersectPlane(floor, hit);
  }

  function clearGhost() {
    if (ghost) interior.group.remove(ghost);
    ghost = null;
  }

  function refresh() {
    ui.showDecorTray(inventory, holding, { onPick: hold, onTurn: turn, onDone: stop });
  }

  function start() {
    active = true;
    refresh();
  }

  function stop() {
    clearGhost();
    holding = null;
    active = false;
    ui.hideDecorTray();
  }

  function hold(id) {
    clearGhost();
    holding = holding === id ? null : id; // tap again to put it back
    turns = 0;
    if (holding) {
      ghost = interior.makeGhost(id);
      ghost.visible = false; // until your finger is over the floor
    }
    refresh();
  }

  function turn() {
    turns = (turns + 1) % 4;
    if (ghost) ghost.rotation.y = (turns * Math.PI) / 2;
  }

  function onMove(event) {
    if (!active || !ghost || !aim(event)) return;
    const spot = interior.snap(hit.x, hit.z, holding, turns);
    ghost.position.set(spot.x, 0, spot.z);
    ghost.visible = true;
  }

  // Returns true when the tap was used for decorating (so you don't walk there).
  function onTap(event) {
    if (!active) return false;
    if (holding) {
      if (!aim(event)) return true;
      const spot = interior.snap(hit.x, hit.z, holding, turns);
      interior.placeItem(holding, spot.x, spot.z, turns);
      inventory[holding] -= 1;
      if (inventory[holding] <= 0) {
        delete inventory[holding];
        clearGhost();
        holding = null;
      }
    } else {
      aim(event);
      const item = interior.itemAt(raycaster);
      if (item) {
        interior.removeItem(item);
        inventory[item.id] = (inventory[item.id] ?? 0) + 1;
      }
    }
    refresh();
    return true;
  }

  return { start, stop, turn, onMove, onTap, isActive: () => active };
}
