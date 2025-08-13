import { initWindowDnD } from "/static/js/dnd.js";
import { initSplitter } from "/static/js/splitter.js";
import { createMiniWindowFromConfig, initWindowResize, mountModal } from "/static/js/window.js";

export function initFramework() {
  initSplitter();
  initWindowDnD();
  initWindowResize();
}

export function spawnWindow(cfg) {
  const node = createMiniWindowFromConfig(cfg);
  if (cfg.modal) {
    mountModal(node, { fade: cfg.modalFade !== false });
  } else {
    const col = document.getElementById(cfg.col === "right" ? "col-right" : "col-left");
    col.appendChild(node);
  }
  return node;
}
