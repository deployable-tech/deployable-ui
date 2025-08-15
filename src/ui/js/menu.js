// menu.js — ARIA-safe dropdown menu (drop-in replacement)
export function initMenu(onAction, triggerId = "menu-trigger", dropdownId = "menu-dropdown") {
  const trigger = document.getElementById(triggerId);
  const dropdown = document.getElementById(dropdownId);
  if (!trigger || !dropdown) return;
  const openMenus = window.__openMenus || (window.__openMenus = new Set());

  function setInert(el, value) {
    try {
      el.inert = !!value; // modern browsers
    } catch {
      el.style.pointerEvents = value ? "none" : "";
    }
  }

  function focusFirstItem() {
    const first =
      dropdown.querySelector('[role="menuitem"]') ||
      dropdown.querySelector(".menu-item") ||
      dropdown.querySelector("button, a, [tabindex]:not([tabindex='-1'])");
    if (first && typeof first.focus === "function") first.focus();
  }

  function open() {
    openMenus.forEach((fn) => fn());
    openMenus.clear();
    setInert(dropdown, false);
    dropdown.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    dropdown.setAttribute("aria-hidden", "false");
    const rect = dropdown.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      dropdown.style.left = "auto";
      dropdown.style.right = "0";
    } else {
      dropdown.style.left = "";
      dropdown.style.right = "";
    }
    // Optional: send focus into the menu for keyboard users
    focusFirstItem();
    openMenus.add(close);
  }

  function close() {
    // If focus is inside the menu, move it out BEFORE hiding
    if (dropdown.contains(document.activeElement)) {
      if (typeof trigger.focus === "function") {
        trigger.focus();
      } else if (document.activeElement?.blur) {
        document.activeElement.blur();
      }
    }

    dropdown.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
    dropdown.setAttribute("aria-hidden", "true");
    dropdown.style.left = "";
    dropdown.style.right = "";
    setInert(dropdown, true);
    openMenus.delete(close);
  }

  // Init state: hidden & inert
  setInert(dropdown, !dropdown.classList.contains("open"));
  if (!dropdown.classList.contains("open")) {
    dropdown.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");
  }

  // Toggle on trigger click
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (dropdown.classList.contains("open")) close();
    else open();
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!dropdown.classList.contains("open")) return;
    if (!dropdown.contains(e.target) && e.target !== trigger) close();
  });

  // Keyboard: open with Enter/Space/ArrowDown; close with Escape
  trigger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      if (!dropdown.classList.contains("open")) open();
      else focusFirstItem();
    }
    if (e.key === "Escape" && dropdown.classList.contains("open")) {
      e.preventDefault();
      close();
    }
  });

  dropdown.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  });

  // Delegate item activation
  dropdown.addEventListener("click", (e) => {
    const item = e.target.closest(".menu-item, [role='menuitem']");
    if (!item) return;
    const action = item.getAttribute("data-action");
    close();
    if (action && onAction) onAction(action);
  });
}
