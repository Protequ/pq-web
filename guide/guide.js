(function () {
  var body = document.body, input = document.getElementById('q'), box = document.getElementById('results');
  var index = null, sel = -1;

  try { localStorage.setItem('pq-guide-lang', body.dataset.lang); } catch (e) { /* storage may be blocked */ }

  // Keep the language switch on the same page (stored so the guide root reopens in that language).
  var sw = document.querySelector('[data-lang-switch]');
  if (sw) sw.addEventListener('click', function () {
    try { localStorage.setItem('pq-guide-lang', sw.dataset.langSwitch); } catch (e) { /* ignore */ }
  });

  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function load() {
    if (index) return Promise.resolve(index);
    return fetch(body.dataset.search).then(function (r) { return r.json(); }).then(function (d) {
      index = d.map(function (p) { return { p: p, t: norm(p.t), s: norm(p.s || ''), x: norm(p.x) }; });
      return index;
    });
  }

  function score(e, words) {
    var total = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i], hit = 0;
      if (e.t.indexOf(w) >= 0) hit += 10;
      if (e.s.indexOf(w) >= 0) hit += 4;
      if (e.x.indexOf(w) >= 0) hit += 1;
      if (!hit) return 0;
      total += hit;
    }
    return total;
  }

  function render(list) {
    box.replaceChildren();
    sel = -1;
    if (!list.length) {
      var n = document.createElement('div'); n.className = 'none'; n.textContent = body.dataset.none; box.appendChild(n);
    }
    list.forEach(function (e) {
      var a = document.createElement('a'), b = document.createElement('b'), s = document.createElement('span');
      a.href = e.p.u; b.textContent = e.p.t; s.textContent = e.p.s || '';
      a.appendChild(b); a.appendChild(s); box.appendChild(a);
    });
    box.hidden = false;
  }

  input.addEventListener('input', function () {
    var q = norm(input.value).trim();
    if (!q) { box.hidden = true; return; }
    var words = q.split(/\s+/);
    load().then(function (idx) {
      var hits = idx.map(function (e) { return { e: e, sc: score(e, words) }; })
        .filter(function (h) { return h.sc > 0; })
        .sort(function (a, b) { return b.sc - a.sc; })
        .slice(0, 12).map(function (h) { return h.e; });
      render(hits);
    });
  });

  input.addEventListener('keydown', function (ev) {
    var links = box.querySelectorAll('a');
    if (ev.key === 'Escape') { box.hidden = true; input.blur(); return; }
    if (!links.length || box.hidden) return;
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      sel = (sel + (ev.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach(function (l, i) { l.classList.toggle('sel', i === sel); });
    } else if (ev.key === 'Enter') {
      location.href = links[Math.max(sel, 0)].href;
    }
  });

  document.addEventListener('click', function (ev) {
    if (!box.contains(ev.target) && ev.target !== input) box.hidden = true;
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === '/' && document.activeElement !== input) { ev.preventDefault(); input.focus(); }
  });
})();
