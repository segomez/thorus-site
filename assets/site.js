// Thorus site behaviour: video placeholders and demo-mode lead forms.
(function () {
  function draw(c) {
    var r = c.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    c.width = Math.max(1, r.width * d); c.height = Math.max(1, r.height * d);
    var x = c.getContext('2d'); x.scale(d, d); var w = r.width, h = r.height;
    var g = x.createRadialGradient(w * .72, h * .35, 10, w * .72, h * .35, w * .7);
    g.addColorStop(0, 'rgba(79,189,185,0.28)'); g.addColorStop(1, 'rgba(79,189,185,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(234,242,244,0.07)'; x.lineWidth = 1;
    for (var i = 0; i < 14; i++) { x.beginPath(); for (var s = 0; s <= w; s += 8) { var y = h * (0.15 + i * 0.06) + Math.sin(s / 90 + i * .7) * 10 + Math.cos(s / 37 + i) * 4; s ? x.lineTo(s, y) : x.moveTo(s, y); } x.stroke(); }
  }
  function all() { document.querySelectorAll('.video canvas').forEach(draw); }
  all(); window.addEventListener('resize', all);
  document.querySelectorAll('form[data-mag]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if (f.action.indexOf('REPLACE_') !== -1) { e.preventDefault(); var ok = f.parentElement.querySelector('.ok'); if (ok) ok.hidden = false; }
    });
  });
})();
