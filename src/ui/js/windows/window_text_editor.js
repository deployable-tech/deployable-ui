import { el } from "../ui.js";

/**
 * Render a simple text editor window.
 * @param {Object} cfg configuration
 * @param {string} winId window identifier
 * @returns {HTMLElement}
 */
export function render(cfg = {}, winId) {
  const ta = el("textarea", {
    class: "textarea" + (cfg.monospace ? " monospace" : ""),
    placeholder: cfg.placeholder || "",
    ...(cfg.readonly ? { readonly: "readonly" } : {})
  });
  if (cfg.content) ta.value = cfg.content;
  if (cfg.wordWrap === false) {
    ta.style.whiteSpace = "pre";
    ta.style.overflowWrap = "normal";
    ta.style.overflowX = "auto";
  }

  const ctx = {
    winId,
    getContent: () => ta.value,
    setContent: (s) => { ta.value = s; },
    close: () => {
      const win = document.getElementById(winId);
      if (!win) return;
      const wrap = win.closest(".modal-wrap");
      if (wrap) wrap.remove();
      else win.remove();
    }
  };

  function makeButton(btn) {
    const label = btn.icon || btn.label || "";
    let cls = "btn";
    if (btn.icon && !btn.label) {
      cls = "icon-btn";
    } else if (btn.variant === "primary") {
      cls = "btn btn-primary";
    } else if (btn.variant === "danger") {
      cls = "btn btn-danger";
    }
    const b = el("button", { class: cls, title: btn.title || label }, [label]);
    b.addEventListener("click", () => btn.onClick?.(ctx));
    return b;
  }

  function buildToolbar(list, pos) {
    if (!Array.isArray(list) || list.length === 0) return null;
    const cls = ["toolbar", `tb-${pos}`];
    if (pos === "left" || pos === "right") cls.push("vertical");
    const bar = el("div", { class: cls.join(" ") });
    list.forEach((btn) => bar.appendChild(makeButton(btn)));
    return bar;
  }

  const top = cfg.toolbarTop ? [...cfg.toolbarTop] : [];
  if (cfg.onSave && !top.some((b) => b.id === "save")) {
    top.unshift({
      id: "save",
      label: cfg.saveButton?.label || "Save",
      variant: "primary",
      onClick: async () => {
        await cfg.onSave?.({ id: winId, content: ta.value });
        ctx.close();
      }
    });
  }

  const wrap = el("div", { class: "text-editor" });
  const row = el("div", { class: "editor-row" });

  const tbTop = buildToolbar(top, "top");
  const tbBottom = buildToolbar(cfg.toolbarBottom, "bottom");
  const tbLeft = buildToolbar(cfg.toolbarLeft, "left");
  const tbRight = buildToolbar(cfg.toolbarRight, "right");

  if (tbTop) wrap.appendChild(tbTop);
  if (tbLeft) row.appendChild(tbLeft);
  row.appendChild(ta);
  if (tbRight) row.appendChild(tbRight);
  wrap.appendChild(row);
  if (tbBottom) wrap.appendChild(tbBottom);

  return wrap;
}
