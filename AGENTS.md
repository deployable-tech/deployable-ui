# AGENT.md — UI Framework

This file documents the UI framework as a set of **front-end agents**: window management, components registry, layout/docking, utilities, and styling. It shows how to add new windows/components and where code should live.

## Layers (Framework)

- **Core (window system / framework):** `demo/js/framework.js`, `src/ui/js/framework.js`, `src/ui/js/ui.js`, `src/ui/js/window.js`
- **Components (widgets library):** `src/ui/js/components.js`
- **Utilities (DOM/store/helpers):** `src/ui/js/dom.js`
- **Menu system:** `src/ui/js/menu.js`, `src/ui/js/user_menu.js`
- **Drag & Drop:** `src/ui/js/dnd.js`
- **Splitter/Layout:** `src/ui/js/splitter.js`
- **Theme/CSS:** `src/ui/css/theme.css`
- **All CSS:** `src/ui/css/style.css`, `src/ui/css/theme.css`, `src/ui/css/ui.css`

## Notable Exports (auto-detected)

- `demo/js/framework.js` → `initFramework`, `spawnWindow`
- `src/ui/js/components.js` → `bus`, `createItemList`, `deregisterComponent`, `getComponent`, `registerComponent`
- `src/ui/js/dnd.js` → `calcDragPosition`, `findDraggableWin`, `handleDragMove`, `handleDragStart`, `handleDrop`, `initWindowDnD`
- `src/ui/js/dom.js` → `qs`
- `src/ui/js/fields/color_picker.js` → `renderColorPicker`
- `src/ui/js/fields/file_upload.js` → `renderFileUpload`
- `src/ui/js/fields/list_view.js` → `renderListView`
- `src/ui/js/framework.js` → `initFramework`, `spawnWindow`
- `src/ui/js/menu.js` → `initMenu`
- `src/ui/js/splitter.js` → `initSplitter`
- `src/ui/js/theme.js` → `applyThemeSettings`, `generatePalette`, `getVar`, `setVar`
- `src/ui/js/ui.js` → `Field`, `el`, `fieldRow`
- `src/ui/js/user_menu.js` → `createUserMenu`
- `src/ui/js/window.js` → `createMiniWindowFromConfig`, `dockWindow`, `initWindowResize`, `mountModal`, `registerWindowType`, `undockWindow`
- `src/ui/js/windows/window_chat.js` → `render`
- `src/ui/js/windows/window_generic.js` → `render`
- `src/ui/js/windows/window_text_editor.js` → `render`
- `src/ui/js/windows/window_theme_editor.js` → `render`

### Text Diagram

```mermaid
flowchart LR
  subgraph Framework
    WM[Window Manager / framework.js]
    REG[Components Registry / components.js]
    DND[Drag&Drop / dnd.js]
    SPL[Splitter / splitter.js]
    DOM[DOM helpers / dom.js]
    THEME[CSS tokens / theme.css]
    MENU[Menu system / menu.js]
  end

  subgraph App (uses Framework)
    WIN1[windows/chat.js]
    WIN2[windows/search.js]
    WIN3[windows/segments.js]
    SDK[app sdk.js]
  end

  WIN1--uses-->WM
  WIN2--uses-->WM
  WIN3--uses-->WM

  WM--creates-->REG
  WM--uses-->DND
  WM--uses-->SPL
  WM--uses-->DOM
  WM--styles-->THEME
  WM--menus-->MENU

  SDK--not part of-->Framework
```

## Contracts

### Window Contract

- Defined by calling a **window factory** (e.g., `spawnWindow({...})`) exposed by the framework.
- Window schema typically includes: `id`, `window_type`, `title`, `unique`, `resizable`, `col` (dock location), and an `Elements` array.
- Optional callbacks: `onOpen(ctx)`, `onAction(actionId, ctx)`, `onClose(ctx)`.
- **Context API** (typical): `ctx.getValue(id)`, `ctx.setValue(id, v)`, `ctx.setText(id, s)`, `ctx.find(id)`, `ctx.close()`.

### Component Contract

- Components are registered in a **components registry** and referenced by `Elements: [{ type: "...", id: "...", ... }]`.
- Common fields: `id`, `type`, `label`, `label_position`, `bind`, `class`, `action`.
- A component implements some subset of: `create(root, def, ctx)`, `setValue(root, v)`, `getValue(root)`, `setText(root, s)`, `enable(root, bool)`.

## Add a New Window (App-side)

Put application windows in your app repo (not in the framework). Example:
```js
// app/static/js/windows/mywindow.js
import { spawnWindow } from "PATH/TO/framework.js"; // adjust import path per your setup
import { sdk } from "../sdk.js";

export function createMyWindow() {
  spawnWindow({
    id: "win_my",
    window_type: "window_generic",
    title: "My Tool",
    col: "right",
    unique: true,
    resizable: true,
    Elements: [
      { type: "input", id: "q", label: "Query" },
      { type: "button", label: "Run", action: "run" },
      { type: "pre", id: "out" }
    ],
    onAction: async (action, ctx) => {
      if (action !== "run") return;
      const q = ctx.getValue("q");
      const res = await sdk.mytool.run({ q });
      ctx.setText("out", JSON.stringify(res, null, 2));
    }
  });
}
```

## Add a New Component (Framework-side)

Add component modules under the framework (e.g., a `components/` folder or `components.js`). Register them with the registry so windows can reference by `type`.
```js
// framework/components/my_toggle.js
import { registerComponent } from "../framework.js"; // or components.js

registerComponent("toggle", {
  create(root, def, ctx) {
    const el = document.createElement("button");
    el.className = "ui-toggle";
    el.textContent = def.label ?? "Toggle";
    el.addEventListener("click", () => ctx.onAction?.(def.action || def.id, ctx));
    root.appendChild(el);
    return el;
  },
  setValue(root, v) {
    root.dataset.state = v ? "on" : "off";
  },
  getValue(root) {
    return root.dataset.state === "on";
  }
});
```

## Code Placement & Conventions

- **Framework core:** keep window manager, registry, and layout primitives in core files (e.g., `framework.js`, `window.js`, `ui.js`).
- **Components:** group generic widgets together; avoid app-specific logic.
- **CSS tokens:** put base variables in `ui/css/theme.css`; component-specific styles next to the component.
- **No network in framework:** the framework is UI-only; apps provide their own SDK/fetch wrappers.
- **Events:** emit UI events upward via callbacks; don’t hardwire global singletons except for the window manager.

## Styling

- Base font stack and tokens live in `ui/css/theme.css`. Keep tokens generic (spacing, radius, shadows).
- Components should expose minimal class hooks (`.li-title`, `.li-meta`, `.li-subtle`, etc.) and avoid inline styles.
- When adding components, include a small CSS block in the framework CSS or a dedicated CSS file loaded by the app.
## Extending & Versioning

- Add components with **backwards compatibility**: don’t break existing `type` names.
- Document new props in a `docs/` or `demo/` example page.
- Prefer semantic versioning for breaking changes; maintain a CHANGELOG.

## Testing Checklist

- Window lifecycle: open → interact → resize → dock/undock → close.
- Component API: `create`, `setValue`, `getValue`, `setText`, `enable` behave consistently.
- Keyboard focus and tab order work across components.
- DnD: drag handles don’t conflict with text selection; drop targets are discoverable.
- Splitter: preserves min sizes; no layout thrash on resize.
- CSS: dark/light modes (if applicable) and high-DPI look correct.
- Performance: no long-running layout/reflow loops; use requestAnimationFrame sparingly.

---

### Auto-Detected Summary

- Root: `/mnt/data/ui-framework/deployable-ui-main`
- JS files: 19  |  CSS files: 3
- Component-related exports detected in:
  - `src/ui/js/components.js` → `bus`, `createItemList`, `deregisterComponent`, `getComponent`, `registerComponent`
  - `src/ui/js/window.js` → `createMiniWindowFromConfig`, `dockWindow`, `initWindowResize`, `mountModal`, `registerWindowType`, `undockWindow`