# deployable-ui

This repository provides a minimal JavaScript UI framework along with a Python
based demo server. It is intended as a starting point for building and testing
complex web applications without relying on Node.js.

## Documentation

Detailed documentation covering project structure, components, theming and
extension points is available under [`docs/`](docs/README.md).

## Structure

```
src/ui/
  js/  - framework JavaScript
  css/ - framework styles

demo/      - example application using the framework
tests/     - lightweight pytest suite for the demo server
codex_startup.py - helper script to run tests and launch the demo
```

## Development

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Run the test suite:

   ```bash
   pytest
   ```

3. Launch the demo server:

   ```bash
   python demo/server.py
   ```

   or use the helper script which runs tests first:

   ```bash
   python codex_startup.py
   ```

The demo server will serve `demo/index.html` and related assets. Open your
browser to `http://127.0.0.1:8000/` to view the demo.

## Usage Examples

### Text Editor Window

```js
import { createMiniWindowFromConfig } from "/static/js/window.js";

createMiniWindowFromConfig({
  window_type: "window_text_editor",
  content: "Hello world",
  onSave: ({ id, content }) => console.log(id, content)
});
```

### List View Field

```js
import { Field } from "/static/js/ui.js";

const list = Field.create({
  type: "list_view",
  items: [{ id: 1, name: "Alpha" }],
  template: { title: (it) => it.name }
});
```

### Chat Window

```js
createMiniWindowFromConfig({
  window_type: "window_chat",
  onSend: async (text) => ({ role: "assistant", content: "Echo: " + text })
});
```

### File Upload Field

```js
import { Field } from "/static/js/ui.js";

const uploader = Field.create({
  type: "file_upload",
  multiple: true,
  buttonLabel: "Upload",
  onUpload: (files) => console.log(files)
});
```

### User Menu

```js
import { createUserMenu } from "/static/js/user_menu.js";

const menu = createUserMenu({
  name: "Demo User",
  items: [
    { label: "Account Settings", onClick: () => console.log("account") },
    { label: "Logout", onClick: () => console.log("logout") }
  ]
});
document.querySelector(".app-header .right").appendChild(menu);
```

To disable the backdrop when using modal windows, set `modalFade: false` in the window config.
