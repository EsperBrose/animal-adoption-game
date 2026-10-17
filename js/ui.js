// The on-screen menus: the animal picker, the name & color step,
// the "change animal" button, the floating name tag and messages.

const COLOR_CHOICES = [
  0xffffff, 0x222222, 0x8b5a2b, 0xc68642, 0xff7f27, 0xf4c542, 0xffb6c1,
  0xe53935, 0x8bc34a, 0x26a69a, 0x42a5f5, 0x7e57c2, 0xce93d8, 0x9e9e9e,
];

const NAME_IDEAS = [
  "Biscuit", "Pepper", "Sunny", "Pickles", "Mochi", "Ziggy", "Clover", "Noodle",
  "Waffles", "Luna", "Bean", "Sprinkles", "Peanut", "Comet", "Maple", "Bubbles",
];

const hexToCss = (hex) => "#" + hex.toString(16).padStart(6, "0");

function createUI({ onChoose, onColor, onDone, onHop }) {
  const picker = document.getElementById("picker");
  const stepAnimal = document.getElementById("step-animal");
  const stepStyle = document.getElementById("step-style");
  const grid = document.getElementById("animal-grid");
  const form = document.getElementById("any-animal");
  const input = document.getElementById("any-animal-input");
  const styleTitle = document.getElementById("style-title");
  const nameInput = document.getElementById("name-input");
  const swatches = document.getElementById("swatches");
  const styleForm = stepStyle;
  const backButton = document.getElementById("back-button");
  const changeButton = document.getElementById("change-animal");
  const nameTag = document.getElementById("name-tag");
  const toast = document.getElementById("toast");
  const playControls = document.getElementById("play-controls");
  const hopButton = document.getElementById("hop-button");

  hopButton.addEventListener("click", onHop);

  for (const [key, animal] of Object.entries(ANIMALS)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "animal-button";
    button.innerHTML = `<span class="emoji">${animal.emoji}</span><span>${animal.name}</span>`;
    button.addEventListener("click", () => onChoose(key));
    grid.appendChild(button);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (input.value.trim()) onChoose(input.value);
    input.value = "";
  });

  styleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    onDone(nameInput.value.trim());
  });

  backButton.addEventListener("click", showPicker);
  changeButton.addEventListener("click", showPicker);

  function showPicker() {
    picker.hidden = false;
    stepAnimal.hidden = false;
    stepStyle.hidden = true;
    changeButton.hidden = true;
    playControls.hidden = true;
  }

  function hidePicker() {
    picker.hidden = true;
    changeButton.hidden = false;
    playControls.hidden = false;
  }

  // Step 2: name and color. The animal's own color is offered first.
  function showStyleStep(spec, currentName) {
    picker.hidden = false;
    stepAnimal.hidden = true;
    stepStyle.hidden = false;
    styleTitle.textContent = `${spec.emoji} Your ${spec.name}`;
    nameInput.value = currentName || NAME_IDEAS[Math.floor(Math.random() * NAME_IDEAS.length)];

    swatches.innerHTML = "";
    const choices = [spec.color, ...COLOR_CHOICES.filter((c) => c !== spec.color)];
    choices.forEach((color, i) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "swatch" + (i === 0 ? " selected" : "");
      swatch.style.background = hexToCss(color);
      swatch.title = i === 0 ? "Original color" : "";
      swatch.addEventListener("click", () => {
        swatches.querySelectorAll(".swatch").forEach((s) => s.classList.remove("selected"));
        swatch.classList.add("selected");
        onColor(color);
      });
      swatches.appendChild(swatch);
    });
  }

  function setNameTag(name) {
    nameTag.textContent = name;
    nameTag.hidden = !name;
  }

  // A floating label that main.js keeps above something in the 3D world.
  function makeLabel(text, className) {
    const label = document.createElement("div");
    label.className = className;
    label.textContent = text;
    label.hidden = true;
    document.body.appendChild(label);
    return label;
  }

  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
  }

  const isPickerOpen = () => !picker.hidden;

  return { showPicker, hidePicker, isPickerOpen, showStyleStep, setNameTag, nameTag, makeLabel, showToast };
}
