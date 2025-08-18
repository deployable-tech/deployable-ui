// components.js — registry for interactive components + event bus

const registry = new Map(); // key: `${winId}:${elementId}` -> api

export function registerComponent(winId, elementId, api) {
  registry.set(`${winId}:${elementId}`, api);
}

export function getComponent(winId, elementId) {
  return registry.get(`${winId}:${elementId}`);
}

export function deregisterComponent(winId, elementId) {
  if (elementId) {
    registry.delete(`${winId}:${elementId}`);
  } else {
    for (const key of Array.from(registry.keys())) {
      if (key.startsWith(`${winId}:`)) {
        registry.delete(key);
      }
    }
  }
}

export const bus = new EventTarget();

// Re-export list helpers from unified list core
export { createItemList, renderItemList } from "./components/list.js";
