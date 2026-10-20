// Your needs once you have a home: food, sleep and fun. They slowly go down;
// eat, sleep and play with things in your house to fill them up again.

const NEEDS = [
  { key: "food", emoji: "🍖", label: "Food", low: "🍖 Your tummy is rumbling! Eat from your food bowl at home." },
  { key: "sleep", emoji: "💤", label: "Sleep", low: "💤 You're getting sleepy! Have a nap in a bed at home." },
  { key: "fun", emoji: "🎈", label: "Fun", low: "🎈 You're a bit bored! Play with a toy or watch TV at home." },
];
const NEED_DRAIN = 100 / 360; // per second: a full bar lasts about 6 minutes

// What each piece of furniture lets you do at home.
const HOME_ACTIVITIES = {
  bowl: { need: "food", amount: 60, label: "🥣 Eat", line: "Yum yum! 😋" },
  bed: { need: "sleep", amount: 100, label: "💤 Sleep", line: "Zzz… what a cozy bed!" },
  petbed: { need: "sleep", amount: 100, label: "💤 Nap", line: "Zzz… perfect pet bed!" },
  sofa: { need: "sleep", amount: 40, label: "🛋️ Relax", line: "Ahh, so comfy!" },
  teddy: { need: "fun", amount: 40, label: "🧸 Play", line: "Teddy is the best!" },
  tv: { need: "fun", amount: 30, label: "📺 Watch TV", line: "📺 Cartoons! Hehe!" },
};

function createNeeds() {
  const values = { food: 100, sleep: 100, fun: 100 };
  const warned = {};

  // onLow(need) is called once when a need gets low (and again after it's been filled).
  function update(dt, onLow) {
    for (const need of NEEDS) {
      values[need.key] = Math.max(0, values[need.key] - NEED_DRAIN * dt);
      if (values[need.key] < 20 && !warned[need.key]) {
        warned[need.key] = true;
        onLow(need);
      }
      if (values[need.key] > 40) warned[need.key] = false;
    }
  }

  function fill(key, amount) {
    values[key] = Math.min(100, values[key] + amount);
  }

  return { values, update, fill };
}
