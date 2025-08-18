import { el, Field, fieldRow } from "../ui.js";

export function render(config, winId) {
  const form = el("form", { class: "form", autocomplete: "off" });
  (config.Elements || []).forEach((e, idx) => {
    const baseId = e.id || (e.name ? e.name.toLowerCase().replace(/\s+/g, "_") : `field_${idx+1}`);
    const id = `${baseId}`;
    const label = e.label || e.name || baseId;
    const opts = {
      showLabel: e.showLabel !== false,
      labelPosition: e.labelPosition || e.label_position || "left",
    };

    if (e.type === "item_list") {
      const listEl = Field.create({ type: 'item_list', ...e, id });
      // expose element reference for later update() calls
      e._el = listEl;
      form.appendChild(fieldRow(id, label, listEl, opts));
      return;
    }

    const input = Field.create({ ...e, id });
    form.appendChild(fieldRow(id, label, input, opts));
  });
  form.addEventListener("submit", (e) => e.preventDefault());
  return form;
}
