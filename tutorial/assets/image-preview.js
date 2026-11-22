(() => {
  const dialog = document.querySelector('#image-preview');
  if (!dialog || typeof dialog.showModal !== 'function') return;

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
