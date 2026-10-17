// Families live in the town houses and stroll around together.
// When your animal comes close, they stop, turn and wave.

const FAMILY_DEFS = [
  { name: "Rivera", loves: "trick", favorite: "dog" },
  { name: "Park", loves: "cuddle", favorite: "cat" },
  { name: "Okafor", loves: "play", favorite: "dragon" },
  { name: "Berg", loves: "cuddle", favorite: "bunny" },
];

const FAMILY_SPEED = 2.2;
const MEET_DISTANCE = 4;
const LEAVE_DISTANCE = 6;

// Where each follower walks, relative to the leader (x = sideways, z = behind).
const FOLLOW_SLOTS = [[-0.9, -1.1], [0.9, -1.1], [0, -2.0]];

function turnToward(object, dx, dz, amount) {
  const facing = Math.atan2(dx, dz);
  const turn = Math.atan2(Math.sin(facing - object.rotation.y), Math.cos(facing - object.rotation.y));
  object.rotation.y += turn * amount;
}

function createFamilies(scene, world) {
  const rand = seededRandom(7);

  const families = FAMILY_DEFS.map((def, i) => {
    const house = world.houses[i];
    const skin = SKIN_TONES[Math.floor(rand() * SKIN_TONES.length)];
    const looks = [randomLook(rand, false, skin), randomLook(rand, false)];
    const kids = 1 + Math.floor(rand() * 2);
    for (let k = 0; k < kids; k++) looks.push(randomLook(rand, true, rand() < 0.5 ? skin : undefined));

    const members = looks.map((look, m) => {
      const person = buildPerson(look);
      person.position.set(house.doorX + (m - 1) * 0.8, 0, house.doorZ + 0.5);
      person.userData.walk = 0;
      scene.add(person);
      return person;
    });

    return {
      ...def,
      house,
      members,
      leader: members[0],
      state: "pause",
      timer: 1 + rand() * 3,
      target: new THREE.Vector3(),
      hearts: 0,
      metFavorite: false,
    };
  });

  function canStand(x, z) {
    return !world.isBlocked(x, z, 0.6) && !inPond(x, z, 1.2);
  }

  function pickTarget(family) {
    for (let tries = 0; tries < 30; tries++) {
      // Half the time stay around town, otherwise explore the park.
      const x = (rand() - 0.5) * 60;
      const z = rand() < 0.5 ? TOWN.roadZ + (rand() - 0.5) * 6 : -14 + rand() * 40;
      if (canStand(x, z)) {
        family.target.set(x, 0, z);
        return;
      }
    }
    family.target.set(family.house.doorX, 0, family.house.doorZ + 1);
  }

  // Move a person toward (x, z) without walking through trees or houses.
  function stepToward(person, x, z, speed, dt) {
    const dx = x - person.position.x;
    const dz = z - person.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.1) return false;
    const step = Math.min(dist, speed * dt);
    const mx = (dx / dist) * step;
    const mz = (dz / dist) * step;
    const p = person.position;
    let moved = false;
    if (!world.isBlocked(p.x + mx, p.z, 0.35)) { p.x += mx; moved = true; }
    if (!world.isBlocked(p.x, p.z + mz, 0.35)) { p.z += mz; moved = true; }
    turnToward(person, dx, dz, Math.min(1, dt * 8));
    return moved;
  }

  function update(dt, t, player) {
    for (const family of families) {
      const leader = family.leader;
      const toPlayer = player
        ? Math.hypot(player.position.x - leader.position.x, player.position.z - leader.position.z)
        : Infinity;

      if (family.state !== "adopted") {
        if (toPlayer < MEET_DISTANCE && family.state !== "meet") family.state = "meet";
        else if (family.state === "meet" && toPlayer > LEAVE_DISTANCE) {
          family.state = "pause";
          family.timer = 0.5;
        }
      }

      // The leader decides where the family goes.
      let leaderMoving = false;
      if (family.state === "meet") {
        // Stand still and look at the animal.
      } else if (family.state === "adopted") {
        if (toPlayer > 2.8) {
          const away = (2.5 / toPlayer);
          const gx = player.position.x - (player.position.x - leader.position.x) * away;
          const gz = player.position.z - (player.position.z - leader.position.z) * away;
          leaderMoving = stepToward(leader, gx, gz, FAMILY_SPEED * 2.2, dt);
        }
      } else if (family.state === "pause") {
        family.timer -= dt;
        if (family.timer <= 0) {
          pickTarget(family);
          family.state = "wander";
        }
      } else if (family.state === "wander") {
        leaderMoving = stepToward(leader, family.target.x, family.target.z, FAMILY_SPEED, dt);
        const left = Math.hypot(family.target.x - leader.position.x, family.target.z - leader.position.z);
        if (left < 0.3 || !leaderMoving) {
          family.state = "pause";
          family.timer = 1 + rand() * 4;
        }
      }
      leader.userData.walk += ((leaderMoving ? 1 : 0) - leader.userData.walk) * Math.min(1, dt * 8);

      // Everyone else follows in a little group behind the leader.
      const heading = leader.rotation.y;
      const sin = Math.sin(heading);
      const cos = Math.cos(heading);
      family.members.slice(1).forEach((member, i) => {
        const [sx, sz] = FOLLOW_SLOTS[i];
        const gx = leader.position.x + sx * cos + sz * sin;
        const gz = leader.position.z - sx * sin + sz * cos;
        const far = Math.hypot(gx - member.position.x, gz - member.position.z);
        const moving = far > 0.25 && stepToward(member, gx, gz, FAMILY_SPEED * (family.state === "adopted" ? 2.6 : 1.5), dt);
        member.userData.walk += ((moving ? 1 : 0) - member.userData.walk) * Math.min(1, dt * 8);
      });

      const meeting = family.state === "meet";
      for (const member of family.members) {
        if (meeting && player && member.userData.walk < 0.5) {
          turnToward(member, player.position.x - member.position.x, player.position.z - member.position.z, Math.min(1, dt * 6));
        }
        animatePerson(member, t, member.userData.walk, meeting);
      }
    }
  }

  // The family your animal is currently visiting, if any.
  function meeting() {
    return families.find((f) => f.state === "meet") ?? null;
  }

  return { families, update, meeting };
}
