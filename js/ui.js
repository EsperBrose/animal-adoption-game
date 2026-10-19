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

const AGES = [
  { value: true, label: "🍼 Baby" },
  { value: false, label: "🐾 Adult" },
];

const hexToCss = (hex) => "#" + hex.toString(16).padStart(6, "0");

function createUI({
  onChoose, onColor, onAge, onDone, onHop,
  onToggleForm, onEditHuman, onHumanChange, onHumanDone, onHumanCancel,
  onAction, onDoor, onDecorate,
}) {
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
    formToggle.hidden = true;
    editHuman.hidden = true;
  }

  function hidePicker() {
    picker.hidden = true;
    changeButton.hidden = false;
    playControls.hidden = false;
    formToggle.hidden = false;
  }

  // Step 2: name and color. The animal's own color is offered first.
  function showStyleStep(spec, currentName) {
    picker.hidden = false;
    stepAnimal.hidden = true;
    stepStyle.hidden = false;
    styleTitle.textContent = `${spec.emoji} Your ${spec.name}`;
    nameInput.value = currentName || NAME_IDEAS[Math.floor(Math.random() * NAME_IDEAS.length)];
    choiceRow(document.getElementById("age-choices"), AGES, Boolean(spec.baby), onAge, textButton);

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

  // ---------- human mode ----------

  const humanPanel = document.getElementById("human-panel");
  const formToggle = document.getElementById("form-toggle");
  const editHuman = document.getElementById("edit-human");
  formToggle.addEventListener("click", onToggleForm);
  editHuman.addEventListener("click", onEditHuman);
  document.getElementById("human-done").addEventListener("click", () => {
    hideHumanPanel();
    onHumanDone();
  });
  document.getElementById("human-cancel").addEventListener("click", () => {
    hideHumanPanel();
    onHumanCancel();
  });

  // Fill a row with buttons; clicking one marks it selected and calls pick(value).
  function choiceRow(container, items, selected, pick, makeButton) {
    container.innerHTML = "";
    for (const item of items) {
      const button = makeButton(item);
      button.type = "button";
      if (item.value === selected) button.classList.add("selected");
      button.addEventListener("click", () => {
        container.querySelectorAll("button").forEach((b) => b.classList.remove("selected"));
        button.classList.add("selected");
        pick(item.value);
      });
      container.appendChild(button);
    }
  }

  const colorItems = (colors) => colors.map((c) => ({ value: c }));
  function swatchButton(item) {
    const button = document.createElement("button");
    button.className = "swatch";
    button.style.background = hexToCss(item.value);
    return button;
  }
  function textButton(item) {
    const button = document.createElement("button");
    button.className = "choice";
    button.textContent = item.label;
    return button;
  }

  // Show the setup panel for a look; every change calls onHumanChange with the new look.
  function showHumanPanel(look) {
    const current = { ...look };
    const change = (key) => (value) => {
      current[key] = value;
      if (key === "gender") {
        current.hairStyle = HUMAN_DEFAULT_HAIR[value];
        fillHairStyles();
      }
      onHumanChange({ ...current });
    };
    const fillHairStyles = () =>
      choiceRow(document.getElementById("hairstyle-choices"), HAIR_STYLES, current.hairStyle, change("hairStyle"), textButton);

    choiceRow(document.getElementById("gender-choices"), GENDERS, current.gender, change("gender"), textButton);
    choiceRow(document.getElementById("skin-swatches"), colorItems(SKIN_TONES), current.skin, change("skin"), swatchButton);
    fillHairStyles();
    choiceRow(document.getElementById("hair-swatches"), colorItems(HAIR_COLORS), current.hair, change("hair"), swatchButton);
    choiceRow(document.getElementById("shirt-swatches"), colorItems(SHIRT_COLORS), current.shirt, change("shirt"), swatchButton);
    choiceRow(document.getElementById("pants-swatches"), colorItems(PANTS_COLORS), current.pants, change("pants"), swatchButton);

    picker.hidden = true;
    humanPanel.hidden = false;
    changeButton.hidden = true;
    playControls.hidden = true;
    formToggle.hidden = true;
    editHuman.hidden = true;
  }

  function hideHumanPanel() {
    humanPanel.hidden = true;
    changeButton.hidden = false;
    playControls.hidden = false;
    formToggle.hidden = false;
  }

  // The toggle shows what you'll turn INTO when you press it.
  function setForm(isHuman) {
    formToggle.textContent = isHuman ? "🐾 Animal" : "🧍 Human";
    editHuman.hidden = !isHuman;
  }

  // ---------- family card (heart meter) ----------

  const familyCard = document.getElementById("family-card");
  const familyActions = document.getElementById("family-actions");
  const hint = playControls.querySelector(".hint");

  function showFamilyCard(family, isHuman) {
    document.getElementById("family-title").textContent = `🏠 The ${family.name} family`;
    document.getElementById("family-hint").textContent = isHuman
      ? "👋 They say hi! Turn into an animal so they can adopt you."
      : `They love ${ACTIONS[family.loves].word} the most!`;
    familyActions.innerHTML = "";
    if (!isHuman) {
      Object.entries(ACTIONS).forEach(([action, info], i) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "big-button action-button";
        button.textContent = info.label;
        button.title = `Key ${i + 1}`;
        button.addEventListener("click", () => onAction(action));
        familyActions.appendChild(button);
      });
    }
    setHearts(family.hearts);
    familyCard.hidden = false;
    hint.hidden = true;
  }

  // Hearts are full: the family asks to adopt you.
  function showAdoptCard(family, onYes, onNo) {
    document.getElementById("family-title").textContent = `💖 The ${family.name} family wants to adopt you!`;
    document.getElementById("family-hint").textContent = "Will you be part of their family?";
    familyActions.innerHTML = "";
    for (const [label, handler, className] of [
      ["🏠 Yes, take me home!", onYes, "big-button"],
      ["Not yet", onNo, "plain-button"],
    ]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.textContent = label;
      button.addEventListener("click", handler);
      familyActions.appendChild(button);
    }
    setHearts(family.hearts);
    familyCard.hidden = false;
    hint.hidden = true;
  }

  // Another family, when you already have one.
  function showTakenCard(family) {
    document.getElementById("family-title").textContent = `🏠 The ${family.name} family`;
    document.getElementById("family-hint").textContent = "👋 You already have a family! 💕";
    familyActions.innerHTML = "";
    setHearts(family.hearts);
    familyCard.hidden = false;
    hint.hidden = true;
  }

  // While a family carries you home, the controls go away.
  const cornerStack = document.querySelector(".corner-stack");
  function setPlayLocked(locked) {
    cornerStack.hidden = locked;
    playControls.hidden = locked;
  }

  const banner = document.getElementById("banner");
  document.getElementById("banner-ok").addEventListener("click", () => (banner.hidden = true));
  function showBanner(title, text) {
    document.getElementById("banner-title").textContent = title;
    document.getElementById("banner-text").textContent = text;
    banner.hidden = false;
  }

  function hideFamilyCard() {
    familyCard.hidden = true;
    hint.hidden = false;
  }

  function setHearts(hearts) {
    document.getElementById("hearts-fill").style.width = `${(hearts / MAX_HEARTS) * 100}%`;
    document.getElementById("hearts-text").textContent =
      hearts >= MAX_HEARTS ? "💖 Full of love!" : `❤️ ${hearts} / ${MAX_HEARTS}`;
  }

  function setActionsEnabled(enabled) {
    familyActions.querySelectorAll("button").forEach((b) => (b.disabled = !enabled));
  }

  const coinBadge = document.getElementById("coin-badge");
  const coinCount = document.getElementById("coin-count");
  function setCoins(total, gained = 0) {
    coinCount.textContent = total;
    if (gained > 0) {
      coinBadge.classList.remove("bump");
      void coinBadge.offsetWidth; // restart the bump animation
      coinBadge.classList.add("bump");
    }
  }

  const doorButton = document.getElementById("door-button");
  doorButton.addEventListener("click", onDoor);
  function setDoorButton(label) {
    doorButton.hidden = !label;
    if (label) doorButton.textContent = label;
  }

  // ---------- the store ----------

  const storePanel = document.getElementById("store-panel");
  document.getElementById("store-close").addEventListener("click", closeStore);
  let storeHandlers = null;

  // shop = { coins, inventory: {id: count}, hats: Set, wearing }
  function renderStore(shop) {
    document.getElementById("store-coins").textContent = shop.coins;
    const grid = document.getElementById("store-grid");
    grid.innerHTML = "";
    for (const item of STORE_ITEMS) {
      const card = document.createElement("div");
      card.className = "store-card";
      const owned = item.kind === "hat" ? (shop.hats.has(item.id) ? 1 : 0) : shop.inventory[item.id] ?? 0;
      card.innerHTML = `<span class="emoji">${item.emoji}</span><b>${item.name}</b>` +
        `<span class="owned">${owned ? (item.kind === "hat" ? "Yours!" : `You have ${owned}`) : "&nbsp;"}</span>`;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "big-button buy-button";
      if (item.kind === "hat" && owned) {
        const wearing = shop.wearing === item.id;
        button.textContent = wearing ? "Take off" : "Wear";
        button.addEventListener("click", () => storeHandlers.onWear(wearing ? null : item.id));
      } else {
        button.textContent = `🪙 ${item.price}`;
        button.disabled = shop.coins < item.price;
        button.addEventListener("click", () => storeHandlers.onBuy(item.id));
      }
      card.appendChild(button);
      grid.appendChild(card);
    }
  }

  function openStore(shop, handlers) {
    storeHandlers = handlers;
    renderStore(shop);
    storePanel.hidden = false;
    playControls.hidden = true;
  }

  function closeStore() {
    storePanel.hidden = true;
    playControls.hidden = false;
  }

  // ---------- decorating ----------

  const decorTray = document.getElementById("decor-tray");
  const decorateButton = document.getElementById("decorate-button");
  decorateButton.addEventListener("click", onDecorate);
  let decorHandlers = null;
  document.getElementById("decor-turn").addEventListener("click", () => decorHandlers?.onTurn());
  document.getElementById("decor-done").addEventListener("click", () => decorHandlers?.onDone());

  // Shown inside your house only.
  const setDecorateButton = (visible) => (decorateButton.hidden = !visible || !decorTray.hidden);

  function showDecorTray(inventory, holding, handlers) {
    decorHandlers = handlers;
    const ids = Object.keys(inventory).filter((id) => inventory[id] > 0);
    document.getElementById("decor-hint").textContent = holding
      ? "Tap the floor to put it down. ↻ turns it."
      : ids.length
        ? "Pick something to place, or tap furniture in the room to pick it up."
        : "Nothing to place yet. Buy furniture at the 🛒 store! (Tap furniture in the room to pick it up.)";
    const items = document.getElementById("decor-items");
    items.innerHTML = "";
    for (const id of ids) {
      const item = itemById(id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice" + (id === holding ? " selected" : "");
      button.textContent = `${item.emoji} ${item.name} ×${inventory[id]}`;
      button.addEventListener("click", () => handlers.onPick(id));
      items.appendChild(button);
    }
    decorTray.hidden = false;
    decorateButton.hidden = true;
    hint.hidden = true;
  }

  function hideDecorTray() {
    decorTray.hidden = true;
    hint.hidden = false;
  }

  const isPickerOpen = () => !picker.hidden || !humanPanel.hidden || !storePanel.hidden;

  return {
    showPicker, hidePicker, isPickerOpen, showStyleStep, setNameTag, nameTag, makeLabel, showToast,
    showHumanPanel, setForm,
    showFamilyCard, hideFamilyCard, setHearts, setActionsEnabled,
    showAdoptCard, showTakenCard, setPlayLocked, showBanner,
    setDoorButton, setCoins, openStore, renderStore, closeStore,
    setDecorateButton, showDecorTray, hideDecorTray,
  };
}
