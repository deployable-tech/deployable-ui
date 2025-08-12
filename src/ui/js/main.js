import { initWindowDnD } from "./dnd.js";
import { initSplitter } from "./splitter.js";
import { createMiniWindowFromConfig, initWindowResize, mountModal } from "./window.js";
import { initMenu } from "./menu.js";

// Initialise basic UI helpers
initSplitter();
initWindowDnD();
initWindowResize();

function spawnWindow(cfg) {
  const node = createMiniWindowFromConfig(cfg);
  if (cfg.modal) {
    mountModal(node);
  } else {
    const col = document.getElementById(cfg.col === "right" ? "col-right" : "col-left");
    col.appendChild(node);
  }
  return node;
}

// Seed demo windows
spawnWindow({
  id: "win_left",
  window_type: "window_generic",
  title: "Left Demo",
  col: "left",
  unique: true,
  resizable: true,
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
  resizable: true,
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
      resizable: true,
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
      resizable: true,
      Elements: [{ type: "text", text: `Dynamic right window ${counter}.` }]
    });
  }
  if (action === "spawn-dockable-modal") {
    counter++;
    spawnWindow({
      id: `dockable_${counter}`,
      window_type: "window_generic",
      title: `Dockable Modal ${counter}`,
      modal: true,
      dockable: true,
      resizable: true,
      Elements: [{ type: "text", text: "This modal can dock or undock." }]
    });
  }
  if (action === "spawn-simple-modal") {
    counter++;
    spawnWindow({
      id: `modal_${counter}`,
      window_type: "window_generic",
      title: `Simple Modal ${counter}`,
      modal: true,
      Elements: [{ type: "text", text: "This modal cannot dock." }]
    });
  }
  if (action === "spawn-showcase") {
    counter++;
    const idx = counter;
    spawnWindow({
      id: `showcase_${idx}`,
      window_type: "window_generic",
      title: `UI Showcase ${idx}`,
      col: "left",
      resizable: true,
      Elements: [
        {
          type: "item_list",
          id: `list_basic_${idx}`,
          label: "Items",
          items: [
            { label: "Item A" },
            { label: "Item B" },
            { label: "Item C" }
          ],
          item_template: { elements: [{ type: "text", bind: "label" }] }
        },
        { type: "text_field", name: "title", label: "Title", placeholder: "Enter title" },
        { type: "text_area", name: "description", label: "Description" },
        {
          type: "select",
          name: "choice",
          label: "Choice",
          options: [
            { value: "one", label: "One" },
            { value: "two", label: "Two" },
            { value: "three", label: "Three" }
          ]
        },
        {
          type: "multi_select",
          name: "tags",
          label: "Tags",
          options: [
            { value: "red", label: "Red" },
            { value: "green", label: "Green" },
            { value: "blue", label: "Blue" }
          ]
        },
        { type: "submit_button", text: "Save" },
        {
          type: "item_list",
          id: `list_custom_${idx}`,
          label: "Files",
          items: [
            { name: "Report.pdf" },
            { name: "Chart.png" }
          ],
          item_template: {
            elements: [
              { type: "text", bind: "name" },
              { type: "button", label: "Open", action: "open" },
              { type: "button", label: "Remove", action: "remove", variant: "danger" }
            ]
          }
        }
      ]
    });
  }
});
