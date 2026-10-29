// Thorus site behaviour: video placeholders and demo-mode lead forms.
(function () {
  function draw(c) {
    var r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    c.width = Math.max(1, r.width * d); c.height = Math.max(1, r.height * d);
    var x = c.getContext('2d'); x.scale(d, d); var w = r.width, h = r.height, gx, gy;
    x.fillStyle = 'rgba(236,238,230,0.06)';
    for (gx = 0; gx < w; gx += 18) x.fillRect(gx, 0, 1, h);
    for (gy = 0; gy < h; gy += 18) x.fillRect(0, gy, w, 1);
    x.fillStyle = 'rgba(200,50,28,0.6)'; x.fillRect(w * .14, 0, 1.5, h);
    x.fillStyle = 'rgba(242,221,61,0.85)'; x.fillRect(w * .2, h * .22, w * .5, h * .035);
    x.fillStyle = 'rgba(236,238,230,0.5)'; x.fillRect(w * .2, h * .3, w * .62, h * .012); x.fillRect(w * .2, h * .33, w * .48, h * .012);
  }
  function all() { document.querySelectorAll('.video canvas').forEach(draw); }
  all(); window.addEventListener('resize', all);
  document.querySelectorAll('form[data-mag]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if (f.action.indexOf('REPLACE_') !== -1) { e.preventDefault(); var ok = f.parentElement.querySelector('.ok'); if (ok) ok.hidden = false; }
    });
  });
})();
