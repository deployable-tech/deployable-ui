import { initWindowDnD } from "./dnd.js";
import { initSplitter } from "./splitter.js";
import { createMiniWindowFromConfig, initWindowResize } from "./window.js";
import { initMenu } from "./menu.js";

// Initialise basic UI helpers
initSplitter();
initWindowDnD();
initWindowResize();

function spawnWindow(cfg) {
  const node = createMiniWindowFromConfig(cfg);
  const col = document.getElementById(cfg.col === "right" ? "col-right" : "col-left");
  col.appendChild(node);
  return node;
}

// Seed demo windows
spawnWindow({
  id: "win_left",
  window_type: "window_generic",
  title: "Left Demo",
  col: "left",
  unique: true,
  Elements: [
    { type: "text", text: "This is a generic left window." }
  ]
});

spawnWindow({
  id: "win_right",
  window_type: "window_generic",
  title: "Right Demo",
  col: "right",
  unique: true,
  Elements: [
    { type: "text", text: "This is a generic right window." }
  ]
});

// Simple menu actions to spawn additional windows
let counter = 0;
initMenu((action) => {
  if (action === "spawn-left") {
    counter++;
    spawnWindow({
      id: `left_${counter}`,
      window_type: "window_generic",
      title: `Left Window ${counter}`,
      col: "left",
      Elements: [{ type: "text", text: `Dynamic left window ${counter}.` }]
    });
  }
  if (action === "spawn-right") {
    counter++;
    spawnWindow({
      id: `right_${counter}`,
      window_type: "window_generic",
      title: `Right Window ${counter}`,
      col: "right",
      Elements: [{ type: "text", text: `Dynamic right window ${counter}.` }]
    });
  }
});
