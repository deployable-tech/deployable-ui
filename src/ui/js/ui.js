(function(global) {
  function createButton(text, onClick) {
    var btn = document.createElement('button');
    btn.textContent = text;
    btn.classList.add('ui-button');
    btn.addEventListener('click', onClick);
    return btn;
  }

  function createModal(content) {
    var modal = document.createElement('div');
    modal.classList.add('ui-modal');

    var inner = document.createElement('div');
    inner.classList.add('ui-modal-content');
    inner.innerHTML = content;
    modal.appendChild(inner);

    modal.addEventListener('click', function() { modal.remove(); });
    return modal;
  }

  global.UI = { createButton: createButton, createModal: createModal };
})(window);
