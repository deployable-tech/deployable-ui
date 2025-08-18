# Lists API

Unified list component for tables and card-style lists.

## Usage

### Declarative

```js
import { renderItemList } from '../src/ui/js/components/list.js';
const el = renderItemList({
  columns: [{ key: 'name', label: 'Name' }],
  items: [{ id: 1, name: 'A' }]
});
container.appendChild(el);
```

### Imperative

```js
import { createItemList } from '../src/ui/js/components/list.js';
const list = createItemList({
  target: container,
  columns: [{ key: 'name', label: 'Name' }],
  items: [{ id: 1, name: 'A' }]
});
list.on('selection:change', e => console.log(e.detail.selection));
```

## Events

- `selection:change` — fired when selection changes; `detail.selection` contains the selected item(s).
- `row:click` — a row was clicked.
- `row:dblclick` — a row was double-clicked.
- `row:action` — an action button on a row was activated.

## Selection

Use `getSelection()` / `setSelection()` to read or change selection. Provide `keyField` to keep selection stable across updates.

## Actions

Row actions can be provided as an array of `{ id, label, onClick }` objects. Legacy `{ [name]: fn }` maps are also supported.
