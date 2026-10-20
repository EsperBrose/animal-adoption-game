// Flying between the main land and Sunny Island: take off down the runway,
// cruise over the sea through the clouds, then land on the other runway.
// It plays like a little movie: you're on the plane, the camera follows it.

const TAKEOFF_TIME = 4.5;
const CRUISE_TIME = 4;
const LANDING_TIME = 4;
const SKY_HEIGHT = 25;

function createFlight({ scene, camera, airport, island, ui }) {
  const plane = airport.plane;
  const body = plane.userData.body;
  const homes = {
    main: { parked: airport.parked, boardSpot: airport.boardSpot },
    island: { parked: island.parked, boardSpot: island.boardSpot },
  };
  let where = "main"; // where the plane is parked right now
  let trip = null; // { from, to, time, onDone }

  // Puffy boxy clouds out over the sea, between the two islands.
  for (let i = 0; i < 30; i++) {
    const cloud = new THREE.Group();
    for (let p = 0; p < 3; p++) {
      const puff = new THREE.Mesh(
        new THREE.BoxGeometry(3 + Math.random() * 3, 1.5 + Math.random(), 2.5 + Math.random() * 2),
        new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x9e9e9e }) // glowing white
      );
      puff.position.set(p * 2 - 2, Math.random() * 0.8, Math.random() - 0.5);
      cloud.add(puff);
    }
    // Clouds stay on the far side of the plane's path, so they never block the camera.
    cloud.position.set(100 + Math.random() * 200, SKY_HEIGHT - 10 + Math.random() * 18, -8 - Math.random() * 45);
    scene.add(cloud);
  }

  const camOffset = new THREE.Vector3();
  function follow(offsetX, offsetY, offsetZ) {
    camOffset.set(offsetX, offsetY, offsetZ);
    camera.position.copy(plane.position).add(camOffset);
    camera.lookAt(plane.position.x, plane.position.y + 1.5, plane.position.z);
  }

  function start(onDone) {
    const from = where;
    const to = where === "main" ? "island" : "main";
    trip = { from, to, time: 0, onDone, faded: [] };
    ui.setPlayLocked(true);
    ui.showToast(to === "island" ? "✈️ Buckle up! Off to Sunny Island!" : "✈️ Buckle up! Flying home!");
  }

  // A quick white flash between the parts of the trip.
  function flashAt(moment) {
    if (trip.faded.includes(moment)) return;
    trip.faded.push(moment);
    ui.setFade(true);
    setTimeout(() => ui.setFade(false), 350);
  }

  // Runs every frame during a trip. Returns true while flying.
  function update(dt) {
    if (!trip) return false;
    trip.time += dt;
    const t = trip.time;
    const from = homes[trip.from].parked;
    const to = homes[trip.to].parked;
    // Keep the camera on the open side of each runway: east at home (the
    // terminal is west), west on the island (palm trees are east).
    const side = (place) => (place === "main" ? 7 : -7);

    if (t < TAKEOFF_TIME) {
      // Speed up down the runway (toward -z), then lift off.
      plane.rotation.y = Math.PI;
      const distance = 2 * t * t;
      const climb = Math.max(0, t - 2.5);
      plane.position.set(from.x, climb * climb * 2, from.z - distance);
      body.rotation.x = climb > 0 ? -0.15 : 0;
      follow(side(trip.from), 4, 12);
      if (t > TAKEOFF_TIME - 0.35) flashAt("takeoff");
    } else if (t < TAKEOFF_TIME + CRUISE_TIME) {
      // Cruise across the sea, high above the waves.
      const c = t - TAKEOFF_TIME;
      const east = to.x > from.x ? 1 : -1;
      plane.rotation.y = east * (Math.PI / 2);
      body.rotation.x = 0;
      body.rotation.z = Math.sin(c * 1.5) * 0.08; // a gentle wobble
      plane.position.set((from.x + to.x) / 2 - east * 16 + east * c * 8, SKY_HEIGHT, 0);
      follow(0, 3, 16);
      if (c > CRUISE_TIME - 0.35) flashAt("cruise");
    } else if (t < TAKEOFF_TIME + CRUISE_TIME + LANDING_TIME) {
      // Come down at the north end of the runway and roll to a stop (toward +z).
      const l = t - TAKEOFF_TIME - CRUISE_TIME;
      body.rotation.z = 0;
      plane.rotation.y = 0;
      const rolled = 15 * l - 1.875 * l * l; // slows to a stop at the parking spot
      const descent = Math.max(0, 1 - l / 2.5);
      plane.position.set(to.x, 6 * descent, to.z - 30 + rolled);
      body.rotation.x = descent > 0 ? 0.08 : 0;
      follow(side(trip.to), 4, -12);
    } else {
      // Arrived! Park facing north again, ready for the next trip.
      plane.position.copy(to);
      plane.rotation.y = Math.PI;
      body.rotation.set(0, 0, 0);
      airport.planeCollider.x = to.x;
      airport.planeCollider.z = to.z;
      where = trip.to;
      const done = trip.onDone;
      const arrivedAt = trip.to;
      trip = null;
      ui.setPlayLocked(false);
      done(arrivedAt, homes[arrivedAt].boardSpot);
      return false;
    }
    return true;
  }

  return {
    start,
    update,
    isFlying: () => Boolean(trip),
    where: () => where,
    boardSpot: () => homes[where].boardSpot,
    planePosition: () => plane.position,
  };
}
