import { spawnWindow } from "../../src/ui/framework/window.js";
import { createForm } from "../../src/ui/components/form.js";
import { createItemList } from "../../src/ui/components/list.js";
import { createSelect } from "../../src/ui/components/select.js";
import { showToast, withAsyncState } from "../../src/ui/components/toast.js";

export function openEntityManagerWindow(entity) {
  const win = spawnWindow({
    id: `entity_${entity?.id || "new"}`,
    title: entity ? `Entity: ${entity.name}` : "New Entity",
    resizable: true,
  });
  const content = win.getContentEl();
  const formEl = document.createElement("div");
  const listEl = document.createElement("div");
  content.append(formEl, listEl);

  const form = createForm({
    target: formEl,
    initial: entity || { enabled: true, extra: {} },
    fields: [
      { type: "text", key: "name", label: "Name", required: true },
      { type: "select", key: "provider", label: "Provider", options: ["A","B"] },
      { type: "text", key: "base_url", label: "Base URL" },
      { type: "text", key: "api_key", label: "API Key" },
      { type: "number", key: "timeout", label: "Timeout (sec)" },
      { type: "toggle", key: "enabled", label: "Enabled" },
      { type: "json", key: "extra", label: "Extra (JSON)" },
    ],
    submitLabel: "Save",
    onSubmit: async (values) => {
      await withAsyncState(new Promise(r => setTimeout(r, 300)), {
        onLoading: () => showToast({ type: "info", message: "Saving..." }),
        onError: (e) => showToast({ type: "error", message: String(e) }),
        onData: () => showToast({ type: "success", message: "Saved" })
      });
    }
  });

  const list = createItemList({
    target: listEl,
    columns: [ { key: "name", label: "Item" }, { key: "engine", label: "Engine" } ],
    actions: {
      use(item){ showToast({ type: "info", message: `Use ${item.name}` }); },
      rename(item){
        win.openModal({
          title: "Rename Item",
          content(modal){
            const wrap = document.createElement("div");
            modal.body.appendChild(wrap);
            const f = createForm({
              target: wrap,
              fields:[{ type:"text", key:"name", label:"Name", required:true }],
              initial:{ name: item.name },
              onSubmit:(vals)=>{ item.name=vals.name; list.setItems(items); modal.close(); }
            });
          }
        });
      },
      delete(item){ showToast({ type: "warn", message: `Delete ${item.name}` }); }
    },
    getRowId: m => m.id,
  });

  // Simulate async loading of items
  let items = [];
  withAsyncState(new Promise(resolve => setTimeout(()=>resolve([
    { id: 1, name: "Model 1", engine: "gpt" },
    { id: 2, name: "Model 2", engine: "bert" },
  ]), 300)), {
    onLoading: (l)=> list.setLoading(l),
    onError: (e)=> list.setError(String(e)),
    onData: (data)=> { items = data; list.setItems(data); }
  });

  return win;
}

openEntityManagerWindow();
