// Accent the last word of the header site title in cyan (solid, two-tone),
// echoing the pq-web hero "… <accent>word</accent>" style — done with a real
// span rather than a CSS gradient.
(function () {
  function accentTitle() {
    var el = document.querySelector(
      '.md-header__title .md-header__topic:first-child .md-ellipsis'
    );
    if (!el || el.querySelector('.pq-accent')) return;
    var text = el.textContent.trim();
    var i = text.lastIndexOf(' ');
    if (i < 0) return;
    el.textContent = text.slice(0, i + 1);
    var span = document.createElement('span');
    span.className = 'pq-accent';
    span.textContent = text.slice(i + 1);
    el.appendChild(span);
  }
  if (document.readyState !== 'loading') accentTitle();
  else document.addEventListener('DOMContentLoaded', accentTitle);
})();
