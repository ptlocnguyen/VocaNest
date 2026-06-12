(() => {
  const STORAGE_KEY = "vocanest_theme";
  const MODES = ["system", "light", "dark"];
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function getSavedMode() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return MODES.includes(saved) ? saved : "system";
  }

  function getResolvedTheme(mode) {
    return mode === "system" ? (media.matches ? "dark" : "light") : mode;
  }

  function applyTheme(mode) {
    const resolved = getResolvedTheme(mode);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themeMode = mode;
    document.documentElement.style.colorScheme = resolved;

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.content = resolved === "dark" ? "#0b1118" : "#f5f7f8";
    }

    window.dispatchEvent(new CustomEvent("vocanestthemechange", {
      detail: { mode, resolved }
    }));
  }

  function modeLabel(mode) {
    if (mode === "light") return "Sáng";
    if (mode === "dark") return "Tối";
    return "Theo hệ thống";
  }

  function nextMode(mode) {
    return MODES[(MODES.indexOf(mode) + 1) % MODES.length];
  }

  function updateButton(button, mode) {
    const icon = button.querySelector(".theme-toggle__icon");
    const next = nextMode(mode);

    icon.textContent = mode === "light" ? "☀" : mode === "dark" ? "☾" : "◐";
    button.dataset.mode = mode;
    button.setAttribute("aria-label", `Giao diện: ${modeLabel(mode)}. Chuyển sang ${modeLabel(next)}.`);
    button.title = `Giao diện: ${modeLabel(mode)}`;
  }

  function createToggle() {
    const button = document.createElement("button");
    button.className = "theme-toggle";
    button.type = "button";

    const icon = document.createElement("span");
    icon.className = "theme-toggle__icon";
    icon.setAttribute("aria-hidden", "true");
    button.appendChild(icon);

    let mode = getSavedMode();
    updateButton(button, mode);

    button.addEventListener("click", () => {
      mode = nextMode(mode);

      if (mode === "system") {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, mode);
      }

      applyTheme(mode);
      updateButton(button, mode);
    });

    const userArea = document.querySelector(".user-area");
    const header = document.querySelector(".app-header");

    if (userArea) {
      userArea.prepend(button);
    } else if (header) {
      header.appendChild(button);
    } else {
      button.classList.add("theme-toggle--floating");
      document.body.appendChild(button);
    }
  }

  applyTheme(getSavedMode());

  media.addEventListener("change", () => {
    if (getSavedMode() === "system") applyTheme("system");
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createToggle, { once: true });
  } else {
    createToggle();
  }
})();
