/* Search the page the reader already has.
 *
 * Every piece is a row in the markup, carrying what it is called, the
 * topic it sits in, its tags and enough of its words to match on. So
 * nothing is fetched: opening the page costs one request and searching
 * costs none, and the index cannot fall out of step with the page
 * because it is the page.
 *
 * A term is worth more in a title than in the body, so a piece about
 * the word outranks a piece that merely mentions it. Tags count as
 * titles, because a tag is a deliberate label rather than incidental
 * prose. Every term has to appear somewhere, so several words narrow
 * rather than widen.
 */
(function () {
  var form = document.querySelector('.search-form');
  var list = document.querySelector('.search-results');
  var count = document.querySelector('.search-count');
  if (!form || !list) return;

  var input = form.querySelector('input[type="search"]');
  var rows = [].slice.call(list.querySelectorAll('.search-result')).map(function (el) {
    var link = el.querySelector('a');
    return {
      el: el,
      title: (link ? link.textContent : '').toLowerCase(),
      section: (el.dataset.s || '').toLowerCase(),
      tags: (el.dataset.g || '').toLowerCase(),
      description: (el.dataset.d || '').toLowerCase(),
      body: (el.dataset.b || '').toLowerCase()
    };
  });

  var say = count ? count.dataset : {};
  function pieces(n) {
    var line = n === 1 ? say.one : say.many;
    return line ? line.replace(/\d+/, n) : String(n);
  }

  function score(row, terms) {
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var q = terms[i], one = 0;
      if (row.title.indexOf(q) === 0) one += 12;       // starts the title
      else if (row.title.indexOf(q) > -1) one += 8;
      if (row.tags.indexOf(q) > -1) one += 6;
      if (row.section.indexOf(q) > -1) one += 3;
      if (row.description.indexOf(q) > -1) one += 2;
      if (row.body.indexOf(q) > -1) one += 1;
      if (!one) return 0;                              // every term must appear
      total += one;
    }
    return total;
  }

  function apply(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      rows.forEach(function (row) { row.el.hidden = false; });
      list.append.apply(list, rows.map(function (row) { return row.el; }));
      if (count) count.textContent = pieces(rows.length);
      return;
    }
    var found = [];
    rows.forEach(function (row) {
      var n = score(row, terms);
      row.el.hidden = n === 0;
      if (n) found.push([n, row.el]);
    });
    found.sort(function (a, b) { return b[0] - a[0]; });
    // Reordering the nodes themselves keeps the ranking visible to a
    // reader moving through the list with the keyboard.
    found.forEach(function (pair) { list.appendChild(pair[1]); });
    if (count) {
      count.textContent = found.length ? pieces(found.length) : (say.none || '');
    }
  }

  // The form submits without the script, so it must not submit with it.
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    apply(input.value);
  });
  input.addEventListener('input', function () { apply(input.value); });

  // A query in the URL, so a search can be sent to someone.
  var initial = new URLSearchParams(window.location.search).get('q');
  if (initial) { input.value = initial; apply(initial); }
})();
