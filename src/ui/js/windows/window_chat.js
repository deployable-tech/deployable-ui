import { el } from "../ui.js";

/**
 * Render a chat/LLM window.
 * @param {Object} cfg configuration
 * @param {string} winId window identifier
 * @returns {HTMLElement}
 */
export function render(cfg = {}, winId) {
  let messages = Array.isArray(cfg.messages) ? [...cfg.messages] : [];
  const wrap = el("div", { class: "chat-window" });

  function makeToolbar(list) {
    if (!Array.isArray(list) || list.length === 0) return null;
    const bar = el("div", { class: "toolbar" });
    list.forEach((btn) => {
      const label = btn.icon || btn.label || "";
      const b = el("button", { class: "icon-btn", title: btn.title || label }, [label]);
      b.addEventListener("click", () => {
        if (btn.onClick) btn.onClick(ctx);
        else if (btn.id && cfg.onAction) cfg.onAction(btn.id, ctx);
      });
      bar.appendChild(b);
    });
    return bar;
  }

  const log = el("div", { class: "chat" });
  const input = el("textarea", { class: "input", rows: 1, placeholder: cfg.placeholder || "" });
  input.style.resize = "none";
  const sendBtn = el("button", { class: "btn", type: "button" }, [cfg.sendLabel || "Send"]);
  const composer = el("div", { class: "chat-input" }, [input, sendBtn]);

  const ctx = {
    winId,
    append: appendMessage,
    getMessages: () => messages.slice(),
    clear: () => {
      messages = [];
      log.innerHTML = "";
    }
  };

  function prune() {
    if (cfg.maxMessages && messages.length > cfg.maxMessages) {
      messages = messages.slice(-cfg.maxMessages);
      while (log.children.length > messages.length) log.removeChild(log.firstChild);
    }
  }

  function appendMessage(msg) {
    const node = el("div", { class: `chat-msg is-${msg.role}` });
    const content = msg.content;
    if (content instanceof HTMLElement) node.appendChild(content); else node.append(content);
    if (msg.meta) node.appendChild(el("div", { class: "chat-meta" }, [msg.meta]));
    log.appendChild(node);
    if (cfg.autoScroll !== false) log.scrollTop = log.scrollHeight;
    prune();
  }

  messages.forEach(appendMessage);
  if (messages.length === 0 && cfg.emptyText) {
    log.appendChild(el("div", { class: "chat-meta" }, [cfg.emptyText]));
  }

  let sending = false;
  async function doSend() {
    if (sending) return;
    const text = input.value.trim();
    if (!text) return;
    sending = true;
    input.disabled = true;
    sendBtn.disabled = true;
    appendMessage({ role: "user", content: text });
    input.value = "";
    try {
      const res = await cfg.onSend?.(text, ctx);
      if (res) appendMessage(res);
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      sending = false;
    }
  }

  sendBtn.addEventListener("click", doSend);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  });

  const tb = makeToolbar(cfg.toolbarTop);
  if (tb) wrap.appendChild(tb);
  wrap.appendChild(log);
  wrap.appendChild(composer);

  return wrap;
}
