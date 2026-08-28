// Swap a poster for the real player, once, when somebody asks for it.
// Without this the poster is a link to the original, which still works.
(function () {
  document.querySelectorAll('.embed[data-src]').forEach(function (box) {
    var cover = box.querySelector('.embed-link');
    if (!cover) return;
    cover.addEventListener('click', function (event) {
      event.preventDefault();
      var frame = document.createElement('iframe');
      frame.src = box.dataset.src;
      frame.title = box.dataset.title || cover.textContent.trim();
      frame.loading = 'lazy';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      box.textContent = '';
      box.appendChild(frame);
      box.classList.add('playing');
    });
  });
})();
