# UI Framework Overview

This directory documents the universal vanilla JS UI framework. It provides primitives for windows, forms, lists, modals and async UX.

## Architecture
- **Window shell** – created via `spawnWindow` and controlled through `WindowController`.
- **Components** – forms, lists, selects and modals live under `src/ui/components`.
- **Styles** – baseline CSS in `src/ui/styles`.
- **Events** – components communicate through callbacks or controller events (no global bus).

## Window Guide
```js
import { spawnWindow } from "../src/ui/framework/window.js";
const win = spawnWindow({ title: "Hello" });
win.on("resize", b => console.log(b.width));
```
- `onOpen`, `onClose`, `onResize` hooks are available in `spawnWindow` options.
- `win.openModal({ title, content(modal){} })` opens a modal relative to the window.

## Form Guide
```js
createForm({
  target: el,
  fields:[{ type:"text", key:"name", required:true }],
  onSubmit: v => console.log(v)
});
```
Field types: `text`, `number`, `select`, `toggle`, `textarea`, `json`.
Validation errors appear inline and block submission. `json` fields parse to objects.

## List Guide
```js
createItemList({
  target: el,
  columns:[{ key:"name", label:"Item"}],
  actions:{ remove(it){...} }
});
```
Lists expose `setItems`, `setLoading`, and `setError` for async flows.

## Modal Guide
```js
win.openModal({ title:"Confirm", content(modal){ /* ... */ } });
```
Modals supply a `ModalController` with `close`, `setTitle`, `on/emit`.

## Async UX
- `withAsyncState(promise, { onLoading, onError, onData })`
- `showToast({ type, message })`
- `createSpinner({ inline })`

## Select Component
`createSelect({ target, options, value, onChange })` builds a simple data-bound `<select>`.

## Migration
Legacy code using ad-hoc DOM and global buses can replace them with the primitives:
1. Replace manual window DOM with `spawnWindow` to get resize and scrolling.
2. Swap custom form inputs for `createForm` schema.
3. Replace global event bus list actions with `actions` callbacks.
4. Use `openModal` instead of separate window IDs for dialogs.
