// The on-screen menus: the animal picker, the "change animal" button and messages.

function createUI({ onChoose }) {
  const picker = document.getElementById("picker");
  const grid = document.getElementById("animal-grid");
  const form = document.getElementById("any-animal");
  const input = document.getElementById("any-animal-input");
  const changeButton = document.getElementById("change-animal");
  const toast = document.getElementById("toast");

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

  changeButton.addEventListener("click", showPicker);

  function showPicker() {
    picker.hidden = false;
    changeButton.hidden = true;
  }

  function hidePicker() {
    picker.hidden = true;
    changeButton.hidden = false;
  }

  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
  }

  return { showPicker, hidePicker, showToast };
}
