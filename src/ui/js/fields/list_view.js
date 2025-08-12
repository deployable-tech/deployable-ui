import { el } from "../ui.js";

/**
 * Simple list view component that renders items and supports selection.
 * Rows are tracked in a Map keyed by a stable identifier so that selection
 * persists even when items are reordered or paged.
 */
export class ListView {
  constructor({ keyField = "id" } = {}) {
    this.keyField = keyField;
    this.container = el("div", { class: "list-view" });

    // Map of item id -> row element
    this.rowMap = new Map();
    // Set of selected item ids
    this.selected = new Set();
  }

  /**
   * Render the given items. Rebuilds the rowMap each time and re-applies any
   * existing selection based on item identifiers.
   * @param {Array<Object>} items
   */
  renderItems(items = []) {
    this.rowMap.clear();
    this.container.innerHTML = "";

    items.forEach((item) => {
      const id = item[this.keyField];
      const row = el("div", { class: "lv-row", "data-id": String(id) }, [
        String(item.label ?? id)
      ]);
      row.addEventListener("click", () => this.toggleSelection(id));
      if (this.selected.has(id)) row.classList.add("selected");
      this.container.appendChild(row);
      this.rowMap.set(id, row);
    });
  }

  /**
   * Toggle selection state for the item with the given identifier.
   * @param {*} id
   */
  toggleSelection(id) {
    const row = this.rowMap.get(id);
    if (!row) return;
    if (row.classList.contains("selected")) {
      row.classList.remove("selected");
      this.selected.delete(id);
    } else {
      row.classList.add("selected");
      this.selected.add(id);
    }
  }

  /**
   * Set selection to the provided identifiers, clearing any previous
   * selections. Uses the row map rather than array indices so the selection is
   * stable across reordering or paging.
   * @param {Array<*>} ids
   */
  setSelection(ids = []) {
    // Clear current selections
    for (const row of this.rowMap.values()) {
      row.classList.remove("selected");
    }
    this.selected.clear();

    ids.forEach((id) => {
      const row = this.rowMap.get(id);
      if (row) {
        row.classList.add("selected");
        this.selected.add(id);
      }
    });
  }
}
