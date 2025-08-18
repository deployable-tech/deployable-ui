import { renderItemList } from "../components/list.js";

// Thin adapter so field registry can render item lists
export function renderListView(cfg) {
  return renderItemList(cfg);
}

export default { renderListView };
