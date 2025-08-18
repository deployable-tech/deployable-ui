/**
 * Unified List component core with selection and row actions.
 * Provides two helper APIs:
 *  - renderItemList(cfg) → HTMLElement (declarative)
 *  - createItemList({target, ...cfg}) → CoreList controller (imperative)
 */

export class CoreList {
  constructor(cfg = {}) {
    this.cfg = {
      keyField: "id",
      items: [],
      columns: null,
      template: null,
      actions: [],
      multi: false,
      toolbar: null,
      ...cfg,
    };
    this._items = Array.isArray(this.cfg.items) ? this.cfg.items : [];
    this._filter = null;
    this._sort = null;
    this._loading = false;
    this._error = null;
    this._selected = new Set();
    this._events = new EventTarget();
    this.root = document.createElement("div");
    this.root.className = "item-list";
    this._normalizeActions();
    this._render();
  }

  // --- public API ---
  update(patch = {}) {
    Object.assign(this.cfg, patch);
    if (patch.items) this._items = Array.isArray(patch.items) ? patch.items : [];
    if (patch.actions) this._normalizeActions();
    this._render();
  }

  setItems(items) {
    this._items = Array.isArray(items) ? items : [];
    this._render();
  }

  getSelection() {
    const items = this._viewItems();
    const sel = items.filter((it, i) => this._selected.has(this._keyOf(it, i)));
    return this.cfg.multi ? sel : sel[0] ?? null;
  }

  setSelection(sel) {
    const want = new Set();
    const arr = Array.isArray(sel) ? sel : (sel == null ? [] : [sel]);
    const items = this._viewItems();
    for (const it of arr) {
      if (typeof it === "object") {
        want.add(this._keyOf(it, items.indexOf(it)));
      } else {
        want.add(String(it));
      }
    }
    this._selected = want;
    this._syncSelectionDom();
    this._emit("selection:change", { selection: this.getSelection() });
  }

  setFilter(fn) { this._filter = fn; this._render(); }
  setSort(fn) { this._sort = fn; this._render(); }
  setLoading(bool) { this._loading = !!bool; this._render(); }
  setError(msg) { this._error = msg; this._render(); }

  on(ev, fn) { this._events.addEventListener(ev, fn); }
  off(ev, fn) { this._events.removeEventListener(ev, fn); }

  // --- internal helpers ---
  _normalizeActions() {
    const acts = this.cfg.actions || [];
    if (Array.isArray(acts)) {
      this._actions = acts.slice();
    } else {
      this._actions = Object.entries(acts).map(([id, fn]) => ({ id, label: id, onClick: fn }));
    }
  }

  _keyOf(item, idx) {
    const kf = this.cfg.keyField || "id";
    return item && kf in item ? String(item[kf]) : String(idx);
  }

  _viewItems() {
    let arr = Array.isArray(this._items) ? [...this._items] : [];
    if (this._filter) arr = arr.filter(this._filter);
    if (this._sort) arr.sort(this._sort);
    return arr;
  }

  _syncSelectionDom() {
    this.root.querySelectorAll('[data-key]').forEach((row) => {
      const k = row.getAttribute('data-key');
      row.classList.toggle('is-selected', this._selected.has(k));
    });
  }

  _emit(ev, detail) {
    this._events.dispatchEvent(new CustomEvent(ev, { detail }));
  }

  _handleRowSelect(key, row, item, idx) {
    if (this.cfg.multi) {
      if (this._selected.has(key)) this._selected.delete(key);
      else this._selected.add(key);
    } else {
      this._selected.clear();
      this._selected.add(key);
    }
    this._syncSelectionDom();
    this._emit("selection:change", { selection: this.getSelection() });
  }

  _rowCommon(row, key, item, idx) {
    row.setAttribute('data-key', key);
    row.tabIndex = 0;
    row.addEventListener('click', (ev) => {
      this._handleRowSelect(key, row, item, idx);
      this._emit('row:click', { item, index: idx, event: ev });
    });
    row.addEventListener('dblclick', (ev) => {
      this._emit('row:dblclick', { item, index: idx, event: ev });
    });
    row.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        row.click();
      }
    });
    if (this._selected.has(key)) row.classList.add('is-selected');
  }

  _render() {
    this.root.innerHTML = '';
    if (this.cfg.toolbar && Array.isArray(this.cfg.toolbar)) {
      const bar = document.createElement('div');
      bar.className = 'list-toolbar';
      for (const act of this.cfg.toolbar) {
        const btn = document.createElement('button');
        btn.textContent = act.label || act.id;
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          act.onClick?.(this.getSelection(), ev);
        });
        bar.appendChild(btn);
      }
      this.root.appendChild(bar);
    }

    if (this._error) {
      const div = document.createElement('div');
      div.className = 'list-error';
      div.textContent = this._error;
      this.root.appendChild(div);
      return;
    }
    if (this._loading) {
      const div = document.createElement('div');
      div.className = 'list-loading';
      div.textContent = 'Loading...';
      this.root.appendChild(div);
      return;
    }

    const items = this._viewItems();
    if (this.cfg.columns && this.cfg.columns.length) {
      // table mode
      const table = document.createElement('table');
      const thead = document.createElement('thead');
      const trh = document.createElement('tr');
      for (const col of this.cfg.columns) {
        const th = document.createElement('th');
        th.textContent = col.label || col.key;
        trh.appendChild(th);
      }
      if (this._actions.length) {
        const th = document.createElement('th');
        trh.appendChild(th);
      }
      thead.appendChild(trh);
      table.appendChild(thead);
      const tbody = document.createElement('tbody');
      if (!items.length) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = this.cfg.columns.length + (this._actions.length ? 1 : 0);
        td.textContent = 'No items';
        tr.appendChild(td);
        tbody.appendChild(tr);
      }
      items.forEach((item, idx) => {
        const key = this._keyOf(item, idx);
        const tr = document.createElement('tr');
        for (const col of this.cfg.columns) {
          const td = document.createElement('td');
          td.textContent = item[col.key];
          tr.appendChild(td);
        }
        if (this._actions.length) {
          const td = document.createElement('td');
          td.className = 'li-actions';
          for (const act of this._actions) {
            const btn = document.createElement('button');
            btn.textContent = act.label || act.id;
            btn.addEventListener('click', (ev) => {
              ev.stopPropagation();
              act.onClick?.(item);
              this._emit('row:action', { action: act.id, item });
            });
            td.appendChild(btn);
          }
          tr.appendChild(td);
        }
        this._rowCommon(tr, key, item, idx);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      this.root.appendChild(table);
    } else if (typeof this.cfg.template === 'function') {
      // card mode
      const wrap = document.createElement('div');
      wrap.className = 'card-list';
      if (!items.length) {
        const d = document.createElement('div');
        d.textContent = 'No items';
        wrap.appendChild(d);
      }
      items.forEach((item, idx) => {
        const key = this._keyOf(item, idx);
        const row = document.createElement('div');
        row.className = 'card-row';
        const content = this.cfg.template(item, idx);
        if (content) row.appendChild(content);
        if (this._actions.length) {
          const act = document.createElement('div');
          act.className = 'li-actions';
          for (const a of this._actions) {
            const btn = document.createElement('button');
            btn.textContent = a.label || a.id;
            btn.addEventListener('click', (ev) => {
              ev.stopPropagation();
              a.onClick?.(item);
              this._emit('row:action', { action: a.id, item });
            });
            act.appendChild(btn);
          }
          row.appendChild(act);
        }
        this._rowCommon(row, key, item, idx);
        wrap.appendChild(row);
      });
      this.root.appendChild(wrap);
    } else {
      // fallback simple list
      const ul = document.createElement('ul');
      if (!items.length) {
        const li = document.createElement('li');
        li.textContent = 'No items';
        ul.appendChild(li);
      }
      items.forEach((item, idx) => {
        const key = this._keyOf(item, idx);
        const li = document.createElement('li');
        li.textContent = String(item);
        this._rowCommon(li, key, item, idx);
        ul.appendChild(li);
      });
      this.root.appendChild(ul);
    }
  }
}

// --- helper exports ---
export function renderItemList(cfg = {}) {
  const core = new CoreList(cfg);
  const el = core.root;
  el.update = (c) => core.update(c);
  el.setItems = (i) => core.setItems(i);
  el.getSelection = () => core.getSelection();
  el.setSelection = (s) => core.setSelection(s);
  el.on = (ev, fn) => core.on(ev, fn);
  el.off = (ev, fn) => core.off(ev, fn);
  return el;
}

let warned = false;
export function createItemList({ target, ...cfg }) {
  if (!warned) {
    console.warn("Deprecation: createItemList will route to the unified list core; prefer Field { type: 'item_list' }.");
    warned = true;
  }
  const core = new CoreList(cfg);
  target.appendChild(core.root);
  return core;
}

export default { CoreList, renderItemList, createItemList };
