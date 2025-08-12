import { el } from "../ui.js";

/**
 * Render a list_view field.
 * @param {Object} cfg configuration
 * @returns {HTMLElement}
 */
export function renderListView(cfg) {
  let config = { ...cfg };
  const container = el("div", { class: "list-view", id: cfg.id });
  let selection = [];

  function toNode(res, cls) {
    if (res == null) return null;
    const node = typeof res === "string" ? el("div", { class: cls }, [res]) : res;
    if (node.classList) node.classList.add(cls);
    return node;
  }

  function makeAction(def, item, index) {
    const btn = el(
      "button",
      { class: def.variant === "danger" ? "btn btn-danger" : def.variant === "primary" ? "btn btn-primary" : "btn", title: def.title || def.label || "" },
      [def.icon || def.label || ""]
    );
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      def.onClick?.(item, index, ev);
    });
    return btn;
  }

  function renderItems() {
    container.innerHTML = "";
    let items = Array.isArray(config.items) ? [...config.items] : [];
    if (config.filter) items = items.filter(config.filter);
    if (config.sort) items.sort(config.sort);
    if (config.pageSize) {
      const page = config.page || 1;
      const start = (page - 1) * config.pageSize;
      items = items.slice(start, start + config.pageSize);
    }
    if (items.length === 0) {
      container.appendChild(el("div", { class: "lv-row" }, [config.emptyText || "No items"]));
      return;
    }
    items.forEach((item, idx) => {
      const row = el("div", { class: "lv-row" });
      const tpl = config.template || {};

      if (tpl.avatar) {
        const av = toNode(tpl.avatar(item), "lv-avatar");
        if (av) row.appendChild(av);
      }
      const main = el("div", { class: "lv-main" });
      if (tpl.title) {
        const t = toNode(tpl.title(item), "lv-title");
        if (t) main.appendChild(t);
      }
      if (tpl.subtitle) {
        const s = toNode(tpl.subtitle(item), "lv-subtitle");
        if (s) main.appendChild(s);
      }
      if (tpl.badges && tpl.badges.length) {
        const bWrap = el("div", { class: "lv-badges" });
        tpl.badges.forEach((fn) => {
          const b = fn(item);
          bWrap.appendChild(typeof b === "string" ? el("span", {}, [b]) : b);
        });
        main.appendChild(bWrap);
      }
      row.appendChild(main);
      if (tpl.meta) {
        const m = toNode(tpl.meta(item), "lv-meta");
        if (m) row.appendChild(m);
      }
      if (tpl.extra) {
        const ex = tpl.extra(item);
        if (ex) row.appendChild(ex);
      }
      if (tpl.actions && tpl.actions.length) {
        const act = el("div", { class: "lv-actions" });
        tpl.actions.forEach((a) => act.appendChild(makeAction(a, item, idx)));
        row.appendChild(act);
      }

      if (config.selectable) {
        const isSel = config.selected ? config.selected(item) : false;
        if (isSel) {
          selection.push(item);
          row.classList.add("is-selected");
        }
        row.addEventListener("click", (ev) => {
          if (config.onRowClick) config.onRowClick(item, idx, ev);
          toggleSelection(item, row);
        });
      } else if (config.onRowClick) {
        row.addEventListener("click", (ev) => config.onRowClick(item, idx, ev));
      }

      container.appendChild(row);
    });
  }

  function toggleSelection(item, row) {
    const idx = selection.indexOf(item);
    if (config.multi) {
      if (idx >= 0) {
        selection.splice(idx, 1);
        row.classList.remove("is-selected");
      } else {
        selection.push(item);
        row.classList.add("is-selected");
      }
    } else {
      selection = [item];
      container.querySelectorAll(".lv-row.is-selected").forEach((el) => el.classList.remove("is-selected"));
      row.classList.add("is-selected");
    }
    config.onSelectChange?.(config.multi ? selection.slice() : selection[0]);
  }

  function getSelection() {
    return config.multi ? selection.slice() : selection[0];
  }

  function setSelection(items) {
    selection = [];
    container.querySelectorAll(".lv-row").forEach((el) => el.classList.remove("is-selected"));
    const arr = Array.isArray(items) ? items : [items];
    const all = Array.isArray(config.items) ? [...config.items] : [];
    arr.forEach((it) => {
      const idx = typeof it === "object" ? all.indexOf(it) : all.findIndex((i) => i[config.keyField || "id"] === it);
      if (idx >= 0) {
        const row = container.children[idx];
        row.classList.add("is-selected");
        selection.push(all[idx]);
      }
    });
    config.onSelectChange?.(config.multi ? selection.slice() : selection[0]);
  }

  container.getSelection = getSelection;
  container.setSelection = setSelection;
  container.update = (c) => {
    config = { ...config, ...c };
    renderItems();
  };

  renderItems();
  return container;
}
