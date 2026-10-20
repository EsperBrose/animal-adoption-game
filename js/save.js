// Saving your game in this browser, so your animal, coins, family and
// furniture are still there next time. (Storage can be blocked, for example
// in private windows; then the game simply starts fresh each time.)

const SAVE_KEY = "animal-adoption-game:save:v1";

function loadSave() {
  try {
    const text = localStorage.getItem(SAVE_KEY);
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function writeSave(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Storage is full or blocked: keep playing without saving.
  }
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Nothing to clear.
  }
}
