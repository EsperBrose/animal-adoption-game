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

// ---------- the heart meter ----------

const ACTIONS = {
  trick: { label: "🎪 Trick", word: "tricks" },
  cuddle: { label: "🤗 Cuddle", word: "cuddles" },
  play: { label: "🎾 Play", word: "playing" },
};
const MAX_HEARTS = 100;
const LOVED_GAIN = 25;
const OTHER_GAIN = 12;
const FAVORITE_BONUS = 15;
const BABY_BONUS = 5;

const LOVED_LINES = {
  trick: ["WOW! Best trick ever!", "Do it again!", "You're so clever!"],
  cuddle: ["Awww, so soft!", "We love cuddles!", "Best cuddles ever!"],
  play: ["Fetch! Again!", "You're so fast!", "Playtime is the best!"],
};
const OTHER_LINES = ["That's nice!", "Cute!", "Hehe!", "Good job!"];

const pickLine = (lines) => lines[Math.floor(Math.random() * lines.length)];

// The animal did something for a family. Fills their hearts and returns what
// they say back.
function reactToAction(family, action, spec) {
  let gain = action === family.loves ? LOVED_GAIN : OTHER_GAIN;
  let line = action === family.loves ? pickLine(LOVED_LINES[action]) : pickLine(OTHER_LINES);
  if (spec.baby) {
    gain += BABY_BONUS;
    if (Math.random() < 0.3) line = "Aww, a baby! 🍼";
  }
  if (!family.metFavorite && spec.key === family.favorite) {
    family.metFavorite = true;
    gain += FAVORITE_BONUS;
    line = `A ${spec.name.toLowerCase()}! That's our favorite!`;
  }
  family.hearts = Math.min(MAX_HEARTS, family.hearts + gain);
  if (family.hearts >= MAX_HEARTS) line = "We love you so much! 💖";
  return { gain, line };
}

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
  // With force, walk straight through anything in the way (used when
  // carrying you home, so the family never gets stuck behind a tree).
  function stepToward(person, x, z, speed, dt, force = false) {
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
    if (!moved && force) {
      p.x += mx;
      p.z += mz;
      moved = true;
    }
    turnToward(person, dx, dz, Math.min(1, dt * 8));
    return moved;
  }

  function update(dt, t, player) {
    for (const family of families) {
      const leader = family.leader;
      // Distance to the edge of the player, so big animals can meet people too.
      const toPlayer = player
        ? Math.hypot(player.position.x - leader.position.x, player.position.z - leader.position.z) -
          ((player.userData.radius ?? 0.5) - 0.5)
        : Infinity;
      family.distance = toPlayer;

      if (family.state !== "adopted" && family.state !== "home") {
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
      } else if (family.state === "home") {
        // Walking you home to the front door.
        const door = family.house;
        leaderMoving = stepToward(leader, door.doorX, door.doorZ + 0.6, FAMILY_SPEED * 1.4, dt, true);
        if (Math.hypot(door.doorX - leader.position.x, door.doorZ + 0.6 - leader.position.z) < 0.3) {
          family.state = "adopted";
          family.carrying = false;
          family.arrived = true; // main.js celebrates and clears this
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
        const hurry = family.state === "adopted" || family.state === "home" ? 2.6 : 1.5;
        const moving = far > 0.25 && stepToward(member, gx, gz, FAMILY_SPEED * hurry, dt, family.state === "home");
        member.userData.walk += ((moving ? 1 : 0) - member.userData.walk) * Math.min(1, dt * 8);
      });

      const meeting = family.state === "meet";
      for (const member of family.members) {
        if (meeting && player && member.userData.walk < 0.5) {
          turnToward(member, player.position.x - member.position.x, player.position.z - member.position.z, Math.min(1, dt * 6));
        }
        const carrying = family.carrying && member === leader;
        animatePerson(member, t, member.userData.walk, meeting && !carrying, carrying);
      }
    }
  }

  // The family your animal is currently visiting, if any (the closest one,
  // when two families are standing nearby).
  function meeting() {
    const near = families.filter((f) => f.state === "meet");
    near.sort((a, b) => a.distance - b.distance);
    return near[0] ?? null;
  }

  // The family says yes! They carry you home (or walk with you if you're too big).
  function takeHome(family, carry) {
    family.state = "home";
    family.carrying = carry;
  }

  const adoptedFamily = () => families.find((f) => f.state === "adopted" || f.state === "home") ?? null;

  return { families, update, meeting, takeHome, adoptedFamily };
}
