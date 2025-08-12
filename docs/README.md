# Deployable UI Documentation

Deployable UI is a lightweight JavaScript user interface toolkit packaged with a small Python demo server. The library is designed to be dropped into any project without a build step or Node.js tooling. Everything ships as plain ES modules and standard CSS.

This document provides an overview of the library's structure, available components, and guidance on extending the framework.

## Project Layout

```
src/ui/      - JavaScript and CSS assets for the UI toolkit
demo/        - Example application served by a FastAPI demo server
test/        - Simple code testing (not really critical)
```


## Core Utilities

### Element Factory
The `el` function is a tiny helper that creates DOM nodes. It accepts a tag name, an attributes object, and an array of children. Event handlers are attached by prefixing attribute names with `on`.

### Field Registry
`Field.create` produces form fields and view widgets from a declarative configuration. Built‑in renderers include text inputs, number inputs, select menus, text areas, list views and file uploads. Custom renderers can be registered by adding functions to `Field.renderers`.

Each field renderer receives a configuration object and must return an `HTMLElement`. When used inside a window, fields can be declared through the `Elements` array of the window configuration.

## Window System

`createMiniWindowFromConfig` builds movable mini windows. Windows can be modal, docked inside columns, resizable, and include action buttons. New window types are registered with `registerWindowType` and provide a renderer that receives the configuration and window id.

Utility helpers `mountModal`, `undockWindow`, and `dockWindow` manage transitions between modal and docked states, while `initWindowResize` enables persistent vertical resizing.

Drag‑and‑drop and window controls are handled by `initWindowDnD`, which supports reordering, docking, minimizing and closing windows.

### Window Configuration

Common options for `createMiniWindowFromConfig`:

| Option | Description |
| ------ | ----------- |
| `id` | Explicit window id. Generated automatically when omitted. |
| `title` | Titlebar text. Defaults to `"Untitled"`. |
| `window_type` | Renderer name from the registry. `window_generic` by default. |
| `modal` | If `true` the window is rendered in a modal wrapper. |
| `modalFade` | Set to `false` to disable the backdrop when using modal windows. |
| `dockable` | Adds a toggle button to move a window between modal and docked modes. |
| `resizable` | Adds a resize handle and persists height to `localStorage`. |
| `Elements` | Array of field definitions consumed by the generic window renderer. |

Custom renderers receive the configuration object and are free to interpret any additional keys.

## Components

The library exposes higher level widgets in `components.js`.

### ListView
`ListView` renders data collections with filtering, sorting, paging and selection. Rows are built from a template describing text blocks, badges, meta information, actions and extra content. A convenience wrapper `renderListView` returns the element and exposes `update`, `getSelection`, and `setSelection` methods.

Key configuration properties:

- `items`: array of objects to display.
- `keyField`: property used as a stable key; defaults to `"id"`.
- `filter` and `sort`: functions for limiting and ordering items.
- `page`/`pageSize`: enable paging.
- `selectable` and `multi`: turn on single or multi‑selection.
- `onSelectChange`: callback invoked with the current selection.
- `template`: object describing how to render each row (avatar, title, subtitle, badges, meta, extra, actions).

### File Upload
`renderFileUpload` creates a self‑contained file picker with "Select" and "Upload" buttons and an optional `onUpload` callback.

Selected files are kept in memory until cleared. The returned element exposes `getFiles()` and `clear()` helpers for programmatic access.

### User Menu
`createUserMenu` builds a dropdown menu suitable for account controls in an application header.

## Styling and Themes

CSS lives under `src/ui/css`. Theme variables can be read and written with `getVar` and `setVar` from `theme.js`. Calling `applyThemeSettings` with an object, JSON string, or nothing will apply stored settings from `localStorage`.

Applications can define their own themes by writing CSS variables such as `--accent`, `--bg`, or `--text`. Persist user choices by saving a JSON object to `localStorage` under the `theme` key and invoking `applyThemeSettings()` on startup.

## Extending the Library

- **Custom Windows:** Register a new type with `registerWindowType(name, renderer)`.
- **Custom Fields:** Add functions to `Field.renderers` that accept a configuration object and return a DOM node.
- **Event Bus:** `components.js` exports a global `bus` (`EventTarget`) for cross‑component communication. Events like `ui:list-select` and `ui:list-action` are emitted by built‑in components.

## Demo Server

The FastAPI server under `demo/server.py` serves the example application and exposes a `/health` endpoint for monitoring. It mounts the library assets at `/static` and demo scripts at `/js`.

## Testing

A lightweight `pytest` suite in `tests/` exercises the demo server and verifies the demo HTML is present. Run `pytest` after making changes to ensure the project remains healthy.

