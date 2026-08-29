/* The theme switch.
 *
 * Two buttons in the brand cell, a sun and a moon. The choice is written
 * to localStorage and read back on the next page, so it holds across the
 * site without a cookie and without anything leaving the browser.
 *
 * This runs from the head, before the body is parsed, so the attribute
 * is on the document element before the first paint. Loaded any later
 * and a reader who chose dark would see a white page flash first.
 *
 * With no choice stored the page follows prefers-color-scheme, which the
 * stylesheet does on its own. Nothing here has to run for that: the
 * attribute is only ever written by a click.
 */
(function () {
  var KEY = 'ff-1-theme';
  var root = document.documentElement;

  // Private browsing and a blocked third-party-storage setting both make
  // this throw rather than return null.
  function stored() {
    try { return localStorage.getItem(KEY); } catch { return null; }
  }
  function remember(value) {
    try { localStorage.setItem(KEY, value); } catch { /* not fatal */ }
  }

  var chosen = stored();
  if (chosen === 'dark' || chosen === 'light') { root.dataset.theme = chosen; }

  // Delegated, because the buttons are not in the document yet. One
  // listener also costs the same whatever a page holds.
  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('[data-set-theme]');
    if (!button) { return; }
    var value = button.getAttribute('data-set-theme');
    if (value !== 'dark' && value !== 'light') { return; }
    root.dataset.theme = value;
    remember(value);
  });
})();
