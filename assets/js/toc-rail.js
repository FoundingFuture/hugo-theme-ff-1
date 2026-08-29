/* Which part of the piece you are reading, marked in the contents beside
 * it.
 *
 * A rectangle sits behind the current entry and slides to the next as
 * the reading moves. It is drawn here rather than in the markup: a page
 * whose script never runs has a list of working links and nothing that
 * points at the wrong one.
 *
 * The heading in force is the last one that has passed the top of the
 * screen, not the first one visible. Reading is downward, and the
 * heading you are under is the one above you.
 */
(function () {
  var rail = document.querySelector('.toc-rail');
  if (!rail) { return; }

  var list = rail.querySelector('ul');
  var links = [].slice.call(rail.querySelectorAll('a[href^="#"]'));
  if (!list || links.length === 0) { return; }

  var headings = links.map(function (link) {
    var id = decodeURIComponent(link.getAttribute('href').slice(1));
    return document.getElementById(id);
  });

  var marker = document.createElement('span');
  marker.className = 'toc-rail-marker';
  marker.setAttribute('aria-hidden', 'true');
  list.appendChild(marker);

  var current = -1;

  function place(index) {
    if (index === current) { return; }
    current = index;
    for (var i = 0; i < links.length; i++) {
      links[i].classList.toggle('on', i === index);
    }
    if (index < 0) { marker.style.opacity = '0'; return; }
    var item = links[index].parentNode;
    marker.style.opacity = '1';
    marker.style.height = item.offsetHeight + 'px';
    marker.style.transform = 'translateY(' + item.offsetTop + 'px)';
  }

  // The band across the top is sticky, so a heading is "reached" when it
  // clears the band rather than when it clears the window.
  function band() {
    var strip = document.querySelector('.strip');
    return strip ? strip.getBoundingClientRect().bottom : 0;
  }

  function measure() {
    var line = band() + 4;
    var found = -1;
    for (var i = 0; i < headings.length; i++) {
      if (headings[i] && headings[i].getBoundingClientRect().top <= line) { found = i; }
    }
    // Above the first heading nothing is marked, which is honest: the
    // reader is in the opening words and under no heading at all.
    place(found);
  }

  var waiting = false;
  function onScroll() {
    if (waiting) { return; }
    waiting = true;
    requestAnimationFrame(function () { waiting = false; measure(); });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  measure();
})();
