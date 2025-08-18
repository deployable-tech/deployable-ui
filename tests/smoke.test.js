import { JSDOM } from 'jsdom';
import { spawnWindow } from '../src/ui/js/framework/window.js';
import { createForm } from '../src/ui/js/components/form.js';
import { renderItemList } from '../src/ui/js/components/list.js';
import { openModal } from '../src/ui/js/components/modal.js';
import { showToast, withAsyncState } from '../src/ui/js/components/toast.js';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

aSyncTest();

async function aSyncTest(){
  const win = spawnWindow({ title: 'Test' });
  const formWrap = document.createElement('div');
  win.getContentEl().appendChild(formWrap);
  const form = createForm({
    target: formWrap,
    fields:[{ type:'text', key:'name', label:'Name', required:true }],
    onSubmit:()=>{}
  });
  // Trigger validation error
  form.form.dispatchEvent(new dom.window.Event('submit', { cancelable:true }));
  const listWrap = document.createElement('div');
  win.getContentEl().appendChild(listWrap);
  const listEl = renderItemList({ columns:[{key:'name', label:'Name'}], items:[{id:1,name:'A'},{id:2,name:'B'}], keyField:'id' });
  listWrap.appendChild(listEl);
  let sel = null;
  listEl.on('selection:change', (e)=>{ sel = e.detail.selection; });
  const firstRow = listEl.querySelector('tbody tr');
  firstRow.dispatchEvent(new dom.window.Event('click', { bubbles:true }));
  console.assert(sel && sel.name === 'A', 'selection event fired');
  const modal = win.openModal({ title:'Modal', content(){} });
  modal.close();
  await withAsyncState(Promise.resolve(), { onLoading:()=>{}, onError:()=>{}, onData:()=>{} });
  showToast({ type:'info', message:'done', timeoutMs:1 });
}
