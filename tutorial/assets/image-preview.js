(() => {
  if (!document.querySelector('a[data-image-preview]')) return;
  const dialog = document.createElement('dialog');
  if (typeof dialog.showModal !== 'function') return;
  dialog.id = 'image-preview';
  dialog.className = 'image-preview';
  dialog.setAttribute('aria-labelledby', 'image-preview-title');
  dialog.innerHTML = `
    <div class="image-preview-header">
      <h2 id="image-preview-title">Image preview</h2>
      <form method="dialog"><button class="image-preview-close" autofocus>Close</button></form>
    </div>
    <img alt="" hidden referrerpolicy="no-referrer">
    <p class="image-preview-status" role="status" hidden></p>
    <p id="image-preview-note" hidden></p>
    <div class="image-preview-footer">
      <a class="image-preview-original" target="_blank" rel="noopener noreferrer">Open full-size image</a>
      <a class="image-preview-credit" target="_blank" rel="noopener noreferrer" hidden></a>
    </div>`;
  document.body.append(dialog);

  const title = dialog.querySelector('#image-preview-title');
  const image = dialog.querySelector('img');
  const note = dialog.querySelector('#image-preview-note');
  const status = dialog.querySelector('.image-preview-status');
  const original = dialog.querySelector('.image-preview-original');
  const credit = dialog.querySelector('.image-preview-credit');

  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-image-preview]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    title.textContent = link.dataset.imagePreview;
    image.alt = link.querySelector('img')?.alt || link.dataset.previewAlt || title.textContent;
    note.textContent = link.dataset.previewNote || '';
    note.hidden = !note.textContent;
    original.href = link.href;

    const source = document.getElementById(link.dataset.previewSource);
    credit.hidden = !source;
    if (source) {
      credit.href = source.href;
      credit.textContent = source.textContent;
    }

    image.hidden = true;
    status.hidden = false;
    status.textContent = 'Loading image…';
    link.focus({ preventScroll: true });
    dialog.showModal();
    const url = link.href;
    image.src = url;
    image.decode().then(() => {
      if (image.src !== url) return;
      image.hidden = false;
      status.hidden = true;
    }, () => {
      if (image.src !== url) return;
      status.textContent = 'The image could not load. Open the image or source link below.';
    });
  });

  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX >= bounds.right ||
        event.clientY < bounds.top || event.clientY >= bounds.bottom) dialog.close();
  });
})();
