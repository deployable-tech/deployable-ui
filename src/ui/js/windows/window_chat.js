import { el } from "../ui.js";

export function render(config = {}, winId) {
  const log = el("div", { class: "chat-log" });

  const textarea = el("textarea", {
    class: "input",
    rows: 1,
    placeholder: config.placeholder || ""
  });

  const sendBtn = el(
    "button",
    { type: "submit", class: "btn" },
    [config.sendLabel || "Send"]
  );

  const form = el("form", { class: "chat-input" }, [textarea, sendBtn]);

  const maxHeight = config.maxInputHeight || Infinity;
  const baseline = textarea.style.height || "auto";
  const resize = () => {
    // Reset to baseline height before measuring to handle deletions
    textarea.style.height = baseline;
    let h = textarea.scrollHeight;
    if (maxHeight !== Infinity) h = Math.min(h, maxHeight);
    textarea.style.height = `${h}px`;
  };

  textarea.addEventListener("input", resize);

  // Initialize height based on any pre-filled value
  setTimeout(resize, 0);

  const container = el("div", { class: "chat-window" }, [log, form]);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = textarea.value.trim();
    if (!msg) return;
    log.appendChild(el("div", {}, [msg]));
    textarea.value = "";
    resize();
  });

  return container;
}
