/* Narrowing by tag, in the page.
 *
 * Every tag is a real link to its own page, and that is what a browser
 * without this file follows. With it, tags become a selection: pick one
 * and the pieces narrow, pick another and they narrow again. A tag that
 * appears in none of what is left drops away, which is what makes the
 * next click obvious.
 *
 * The selection lives in the URL, so a narrowed view can be sent to
 * someone.
 */
(function () {
  var facets = document.getElementById('facets');
  var rows = document.getElementById('tagged');
  if (!facets || !rows) return;

  var buttons = [].slice.call(facets.querySelectorAll('[data-tag]'));
  var pieces = [].slice.call(rows.querySelectorAll('.row')).map(function (el) {
    return { el: el, tags: (el.dataset.tags || '').split(' ').filter(Boolean) };
  });
  var clear = document.getElementById('facetclear');
  var nothing = document.getElementById('nomatch');
  var picked = [];

  function readUrl() {
    var q = new URLSearchParams(location.search).get('t');
    picked = q ? q.split(',').filter(Boolean) : [];
  }

  function writeUrl() {
    var url = location.pathname + (picked.length ? '?t=' + picked.join(',') : '');
    history.replaceState(null, '', url);
  }

  function matches(piece) {
    return picked.every(function (tag) { return piece.tags.indexOf(tag) !== -1; });
  }

  function draw() {
    var left = pieces.filter(matches);
    pieces.forEach(function (p) { p.el.hidden = picked.length ? !matches(p) : false; });

    buttons.forEach(function (b) {
      var tag = b.dataset.tag;
      var on = picked.indexOf(tag) !== -1;
      // how many would survive if this tag were added to the selection
      var reach = on ? left.length : left.filter(function (p) {
        return p.tags.indexOf(tag) !== -1;
      }).length;
      b.classList.toggle('on', on);
      var row = b.closest('section');
      if (row) row.hidden = !on && picked.length > 0 && reach === 0;
    });

    if (clear) clear.hidden = picked.length === 0;
    if (nothing) nothing.hidden = left.length !== 0;
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function (event) {
      event.preventDefault();          // the href is the no-script path
      var tag = b.dataset.tag;
      var at = picked.indexOf(tag);
      if (at === -1) picked.push(tag); else picked.splice(at, 1);
      writeUrl();
      draw();
    });
  });

  if (clear) {
    clear.addEventListener('click', function () {
      picked = [];
      writeUrl();
      draw();
    });
  }

  readUrl();
  draw();
})();
