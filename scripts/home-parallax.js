/**
 * Parallax scrolling — elementi se pomeraju različitim brzinama
 * u odnosu na skrol. Brzina: data-parallax-speed (0 = statičan, 1 = normalan skrol).
 * Vrednosti < 1 = sporije od skrola (zaostaje), > 1 = brže (prednjači).
 * Efekat je suptilan: razlike od 0.02–0.06 daju fin osećaj dubine.
 */
(function () {
  'use strict';

  if (!document.body.classList.contains('page-home')) return;
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  } catch (e) { return; }

  var items = [];

  function register(el, speed) {
    if (!el) return;
    el.style.willChange = 'transform';
    items.push({ el: el, speed: speed, y: 0 });
  }

  /* ── Hero strip ── */
  var heroHeadline = document.querySelector('.hero__strip-headline');
  var heroBody     = document.querySelector('.hero__strip-body');
  var heroInteg    = document.querySelector('.hero__strip-integrations');

  register(heroHeadline, -0.045);
  register(heroBody,     -0.025);
  register(heroInteg,     0.03);

  /* ── #problem ── */
  var prob = document.getElementById('problem');
  if (prob) {
    var label = prob.querySelector('.sec__label');
    var h2    = prob.querySelector('.sec__header > h2.type-h1');
    var fig   = prob.querySelector('.problem__header-figure');
    var intro = prob.querySelector('.sec__header-intro');

    register(label,  -0.015);
    register(h2,     -0.04);
    register(fig,     0.05);
    register(intro,  -0.02);

    var grid = prob.querySelectorAll('.problem__item');
    for (var g = 0; g < grid.length; g++) {
      var dir = (g % 2 === 0) ? -1 : 1;
      register(grid[g], dir * 0.018 * (1 + g * 0.15));
    }
  }

  if (!items.length) return;

  var vh = window.innerHeight || 1;
  window.addEventListener('resize', function () {
    vh = window.innerHeight || 1;
  }, { passive: true });

  var ticking = false;

  function update() {
    ticking = false;
    var scrollY = window.pageYOffset;
    var i, item, rect, center, offset;
    for (i = 0; i < items.length; i++) {
      item = items[i];
      rect = item.el.getBoundingClientRect();
      center = rect.top + rect.height * 0.5;
      offset = (center - vh * 0.5) * item.speed;
      offset = Math.round(offset * 10) / 10;
      if (offset !== item.y) {
        item.y = offset;
        item.el.style.transform = 'translate3d(0,' + offset + 'px,0)';
      }
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();
