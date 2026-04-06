(function () {
  'use strict';

  /** Dodeljuje se kada postoji `.cfo__scan-micro` u `.cfo__scan-band`. */
  var setMicroChromaticVisible = function () {};

  /** Posle kraja chromatic-a: skini efekat (mirna tamna mono boja), kratko prikaži, pa sakrij micro. */
  var settleMicroAfterChromatic = function () {};

  var MICRO_SETTLE_AFTER_CHROMATIC_MS = 240;

  var CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var CHROMATIC_ANIM = 'cfo-scan-chromatic';
  var BLOTTER_DURATION_MS = 1750;
  var REPEAT_GAP_MS = 3000;
  /**
   * Svi efekti na CONTRACT dele isti „nulti trenutak“ kao INVOICE, sa suptilnim pomakom (scramble delay, Blotter, CSS).
   * Uskladiti sa --cfo-contract-chromatic-lag u revorion-tokens.css.
   */
  var CONTRACT_SUBTLE_LAG_MS = 180;

  function prefersReducedMotion() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {
      return false;
    }
  }

  function randomChar() {
    return CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }

  function scrambleWord(el, finalText, options) {
    var delay = options.delay || 0;
    var charStagger = options.charStagger || 52;
    var cyclesPerChar = options.cyclesPerChar || 18;
    var tickMs = options.tickMs || 36;
    var onComplete = options.onComplete;
    var finished = false;

    var upper = String(finalText).toUpperCase();
    var len = upper.length;
    var start = null;

    function frame(now) {
      if (start === null) start = now + delay;
      if (now < start) {
        requestAnimationFrame(frame);
        return;
      }
      var elapsed = now - start;
      var out = '';
      var done = true;
      var i;
      var tStart;
      var tEnd;
      for (i = 0; i < len; i++) {
        tStart = i * charStagger;
        tEnd = tStart + cyclesPerChar * tickMs;
        if (elapsed < tStart) {
          out += randomChar();
          done = false;
        } else if (elapsed < tEnd) {
          out += randomChar();
          done = false;
        } else {
          out += upper.charAt(i);
        }
      }
      el.textContent = out;
      if (!done) {
        requestAnimationFrame(frame);
      } else if (onComplete && !finished) {
        finished = true;
        onComplete();
      }
    }

    requestAnimationFrame(frame);
  }

  function firstFontFamily(fam) {
    if (!fam) return 'sans-serif';
    var parts = fam.split(',');
    var f = parts[0].trim().replace(/^["']|["']$/g, '');
    return f || 'sans-serif';
  }

  function colorToHexFill(color) {
    if (!color) return '#0f0f0d';
    var m = color.match(/^#([0-9a-f]{3,8})$/i);
    if (m) {
      var h = m[1];
      if (h.length === 3) {
        return '#' + h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      }
      if (h.length === 6) return '#' + h;
    }
    m = color.match(/rgba?\(\s*([^)]+)\s*\)/);
    if (m) {
      var p = m[1].split(',').map(function (x) {
        return parseFloat(x.trim());
      });
      function hexByte(n) {
        n = Math.max(0, Math.min(255, Math.round(n)));
        return ('0' + n.toString(16)).slice(-2);
      }
      return '#' + hexByte(p[0]) + hexByte(p[1]) + hexByte(p[2]);
    }
    return '#0f0f0d';
  }

  function parseFontWeight(w) {
    var n = parseInt(w, 10);
    if (!isNaN(n)) return n;
    if (w === 'bold' || w === 'bolder') return 700;
    return 500;
  }

  function lineHeightToLeading(lineHeight, fontSize) {
    var fs = parseFloat(fontSize) || 16;
    if (!lineHeight || lineHeight === 'normal') return 1.2;
    var lh = parseFloat(lineHeight);
    if (isNaN(lh)) return 1.2;
    if (String(lineHeight).indexOf('px') !== -1) return lh / fs;
    return lh;
  }

  function buildBlotterText(wordEl) {
    var txt = (wordEl.getAttribute('data-scramble-text') || wordEl.textContent || '').trim();
    var cs = window.getComputedStyle(wordEl);
    var size = parseFloat(cs.fontSize) || 48;
    return new window.Blotter.Text(txt, {
      family: firstFontFamily(cs.fontFamily),
      size: size,
      fill: colorToHexFill(cs.color),
      weight: parseFontWeight(cs.fontWeight),
      style: cs.fontStyle || 'normal',
      leading: lineHeightToLeading(cs.lineHeight, cs.fontSize),
    });
  }

  function createMount(wordEl) {
    var parent = wordEl.parentNode;
    var mount = document.createElement('div');
    mount.className = 'cfo__scan-blotter-mount';
    mount.setAttribute('aria-hidden', 'true');
    parent.appendChild(mount);
    return mount;
  }

  /** Usklađuje mount sa stvarnim mestom reči u crop-u (flex-end vs flex-start). */
  function alignMountToWord(mount, wordEl) {
    var parent = mount.parentNode;
    if (!parent || !wordEl) return;
    var pr = parent.getBoundingClientRect();
    var wr = wordEl.getBoundingClientRect();
    mount.style.left = Math.round(wr.left - pr.left) + 'px';
    mount.style.top = Math.round(wr.top - pr.top) + 'px';
  }

  function isContractScanWord(el) {
    return (el.getAttribute('data-scramble-text') || '').toUpperCase() === 'CONTRACT';
  }

  function runCssChromaticFlash(words, onDone) {
    var done = typeof onDone === 'function' ? onDone : function () {};
    setMicroChromaticVisible(true);
    words.forEach(function (w) {
      w.classList.add('cfo__scan-word--chromatic-flash');
      if (isContractScanWord(w)) {
        w.classList.add('cfo__scan-word--chromatic-lag');
      }
    });
    var anchor = words[words.length - 1];
    var ai;
    for (ai = 0; ai < words.length; ai++) {
      if (isContractScanWord(words[ai])) {
        anchor = words[ai];
        break;
      }
    }
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      words.forEach(function (w) {
        w.classList.remove('cfo__scan-word--chromatic-flash');
        w.classList.remove('cfo__scan-word--chromatic-lag');
      });
      settleMicroAfterChromatic();
      anchor.removeEventListener('animationend', onEnd);
      anchor.removeEventListener('animationcancel', onCancel);
      done();
    }
    function onEnd(ev) {
      if (ev.animationName !== CHROMATIC_ANIM) return;
      finish();
    }
    function onCancel() {
      finish();
    }
    anchor.addEventListener('animationend', onEnd);
    anchor.addEventListener('animationcancel', onCancel);
  }

  function cleanupBlotter(blotter, wordEls, mounts) {
    try {
      blotter.stop();
      blotter.teardown();
    } catch (err) {
      /* ignore */
    }
    mounts.forEach(function (m) {
      if (m && m.parentNode) {
        m.parentNode.removeChild(m);
      }
    });
    wordEls.forEach(function (w) {
      w.classList.remove('cfo__scan-word--blotter-active');
    });
  }

  function animateBlotterUniforms(material, blotter, wordEls, mounts, startTime, onDone, opts) {
    var settleMicroOnEnd = !opts || opts.settleMicroOnEnd !== false;
    var after =
      typeof onDone === 'function'
        ? onDone
        : function () {};
    var cx = window.innerWidth * 0.5;
    var cy = window.innerHeight * 0.5;

    function frame(now) {
      var elapsed = now - startTime;
      var t = Math.min(1, elapsed / BLOTTER_DURATION_MS);
      var ang = t * Math.PI * 2 * 4;
      var mx = cx + Math.cos(ang) * (window.innerWidth * 0.35);
      var my = cy;
      var deltaX = Math.floor(cx - mx) * -0.45;
      var dx = mx - cx;
      var dist = Math.min(360, Math.floor(Math.abs(dx)));
      material.uniforms.uRotation.value = deltaX;
      material.uniforms.uOffset.value = dist * 0.00004 + 0.02;

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        material.uniforms.uRotation.value = 0;
        material.uniforms.uOffset.value = 0.001;
        requestAnimationFrame(function () {
          cleanupBlotter(blotter, wordEls, mounts);
          if (settleMicroOnEnd) settleMicroAfterChromatic();
          after();
        });
      }
    }

    requestAnimationFrame(frame);
  }

  function shouldStaggerChromatic(list) {
    var hasContract = false;
    var hasOther = false;
    var si;
    for (si = 0; si < list.length; si++) {
      if (isContractScanWord(list[si])) hasContract = true;
      else hasOther = true;
    }
    return hasContract && hasOther;
  }

  function partitionStaggerWords(list) {
    var lead = [];
    var lag = [];
    var pi;
    for (pi = 0; pi < list.length; pi++) {
      if (isContractScanWord(list[pi])) lag.push(list[pi]);
      else lead.push(list[pi]);
    }
    return { lead: lead, lag: lag };
  }

  function removeAllBlotterMountsInBand() {
    var bandEl = document.querySelector('.cfo__scan-band');
    if (!bandEl) return;
    var nodes = bandEl.querySelectorAll('.cfo__scan-blotter-mount');
    var ni;
    for (ni = 0; ni < nodes.length; ni++) {
      if (nodes[ni].parentNode) nodes[ni].parentNode.removeChild(nodes[ni]);
    }
  }

  /**
   * Jedan Blotter deli iste uniforme na sve tekstove — INVOICE i CONTRACT bi uvek bili u fazi.
   * Dve instance + kašnjenje za CONTRACT daje vidljiv stagger.
   */
  function runStaggeredBlotterChromaticFlash(list, onDone) {
    var done = typeof onDone === 'function' ? onDone : function () {};
    var parts = partitionStaggerWords(list);
    var lead = parts.lead;
    var lag = parts.lag;
    if (!lead.length || !lag.length) {
      runBlotterChromaticFlashUnified(list, done);
      return;
    }

    var handled = false;
    var fallbackTimer;
    var microShown = false;
    var groupsAnimating = 0;

    function showMicroOnce() {
      if (microShown) return;
      microShown = true;
      setMicroChromaticVisible(true);
    }

    function useCssFallbackStagger() {
      if (handled) return;
      handled = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      removeAllBlotterMountsInBand();
      list.forEach(function (w) {
        w.classList.remove('cfo__scan-word--blotter-active');
      });
      runCssChromaticFlash(list, done);
    }

    fallbackTimer = window.setTimeout(useCssFallbackStagger, 4000);

    document.fonts.ready.then(function () {
      if (handled) return;
      var remaining = 2;

      function onGroupDone() {
        if (handled) return;
        remaining -= 1;
        if (remaining === 0) {
          handled = true;
          if (fallbackTimer) window.clearTimeout(fallbackTimer);
          settleMicroAfterChromatic();
          done();
        }
      }

      function startGroup(wordEls, delayMs) {
        window.setTimeout(function () {
          if (handled) return;
          var mounts = [];
          var texts = [];
          var j;
          var material;
          var blotter;
          try {
            for (j = 0; j < wordEls.length; j++) {
              mounts.push(createMount(wordEls[j]));
              texts.push(buildBlotterText(wordEls[j]));
            }
            material = new window.Blotter.ChannelSplitMaterial();
            material.uniforms.uAnimateNoise.value = 0;
            material.uniforms.uApplyBlur.value = 1;
            material.uniforms.uRotation.value = 0.4;
            material.uniforms.uOffset.value = 0.024;
            blotter = new window.Blotter(material, {
              texts: texts,
              autostart: true,
              autoplay: true,
            });
          } catch (err) {
            useCssFallbackStagger();
            return;
          }

          blotter.on('ready', function () {
            if (handled) return;
            try {
              showMicroOnce();
              for (j = 0; j < wordEls.length; j++) {
                alignMountToWord(mounts[j], wordEls[j]);
                blotter.forText(texts[j]).appendTo(mounts[j]);
                wordEls[j].classList.add('cfo__scan-word--blotter-active');
              }
              groupsAnimating += 1;
              if (groupsAnimating === 2 && fallbackTimer) {
                window.clearTimeout(fallbackTimer);
                fallbackTimer = null;
              }
              animateBlotterUniforms(
                material,
                blotter,
                wordEls,
                mounts,
                performance.now(),
                onGroupDone,
                { settleMicroOnEnd: false }
              );
            } catch (err2) {
              try {
                blotter.stop();
                blotter.teardown();
              } catch (e2) {
                /* ignore */
              }
              mounts.forEach(function (m) {
                if (m && m.parentNode) m.parentNode.removeChild(m);
              });
              wordEls.forEach(function (w) {
                w.classList.remove('cfo__scan-word--blotter-active');
              });
              useCssFallbackStagger();
            }
          });
        }, delayMs);
      }

      startGroup(lead, 0);
      startGroup(lag, CONTRACT_SUBTLE_LAG_MS);
    });
  }

  function runBlotterChromaticFlashUnified(list, onDone) {
    var done = typeof onDone === 'function' ? onDone : function () {};

    var mounts = [];
    var texts = [];
    var i;
    var blotter;
    var material;
    var handled = false;
    var fallbackTimer;

    function removeMountsOnly() {
      mounts.forEach(function (m) {
        if (m && m.parentNode) {
          m.parentNode.removeChild(m);
        }
      });
      mounts = [];
    }

    function useCssFallback() {
      if (handled) return;
      handled = true;
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
      }
      if (blotter) {
        try {
          blotter.stop();
          blotter.teardown();
        } catch (e) {
          /* ignore */
        }
        blotter = null;
      }
      removeMountsOnly();
      list.forEach(function (w) {
        w.classList.remove('cfo__scan-word--blotter-active');
      });
      runCssChromaticFlash(list, done);
    }

    fallbackTimer = window.setTimeout(useCssFallback, 4000);

    document.fonts.ready.then(function () {
      if (handled) return;
      try {
        for (i = 0; i < list.length; i++) {
          mounts.push(createMount(list[i]));
          texts.push(buildBlotterText(list[i]));
        }

        material = new window.Blotter.ChannelSplitMaterial();
        material.uniforms.uAnimateNoise.value = 0;
        material.uniforms.uApplyBlur.value = 1;
        material.uniforms.uRotation.value = 0.4;
        material.uniforms.uOffset.value = 0.024;

        blotter = new window.Blotter(material, {
          texts: texts,
          autostart: true,
          autoplay: true,
        });
      } catch (err) {
        useCssFallback();
        return;
      }

      blotter.on('ready', function () {
        if (handled) return;
        handled = true;
        if (fallbackTimer) {
          window.clearTimeout(fallbackTimer);
        }
        try {
          setMicroChromaticVisible(true);
          for (i = 0; i < list.length; i++) {
            alignMountToWord(mounts[i], list[i]);
            blotter.forText(texts[i]).appendTo(mounts[i]);
            list[i].classList.add('cfo__scan-word--blotter-active');
          }
          animateBlotterUniforms(material, blotter, list, mounts, performance.now(), done);
        } catch (err2) {
          cleanupBlotter(blotter, list, mounts);
          blotter = null;
          runCssChromaticFlash(list, done);
        }
      });
    });
  }

  function runBlotterChromaticFlash(list, onDone) {
    var done = typeof onDone === 'function' ? onDone : function () {};

    if (!window.Blotter || !window.Blotter.ChannelSplitMaterial) {
      runCssChromaticFlash(list, done);
      return;
    }

    if (shouldStaggerChromatic(list)) {
      runStaggeredBlotterChromaticFlash(list, done);
      return;
    }

    runBlotterChromaticFlashUnified(list, done);
  }

  var band = document.querySelector('.cfo__scan-band');
  if (!band || prefersReducedMotion()) return;

  var words = band.querySelectorAll('.cfo__scan-word');
  if (!words.length) return;

  var microRoot = band.querySelector('.cfo__scan-micro');
  setMicroChromaticVisible = function (show) {
    if (!microRoot) return;
    var lines = microRoot.querySelectorAll('.cfo__scan-micro-line');
    var i;
    if (show) {
      microRoot.classList.add('cfo__scan-micro--chromatic-visible');
      for (i = 0; i < lines.length; i++) {
        lines[i].classList.add('cfo__scan-micro-line--chromatic-flash');
      }
    } else {
      microRoot.classList.remove('cfo__scan-micro--chromatic-visible');
      for (i = 0; i < lines.length; i++) {
        lines[i].classList.remove('cfo__scan-micro-line--chromatic-flash');
      }
    }
  };

  settleMicroAfterChromatic = function () {
    if (!microRoot) return;
    var lines = microRoot.querySelectorAll('.cfo__scan-micro-line');
    var i;
    for (i = 0; i < lines.length; i++) {
      lines[i].classList.remove('cfo__scan-micro-line--chromatic-flash');
    }
    window.setTimeout(function () {
      microRoot.classList.remove('cfo__scan-micro--chromatic-visible');
    }, MICRO_SETTLE_AFTER_CHROMATIC_MS);
  };

  var started = false;
  var repeatTimer = null;
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || started) return;
        started = true;
        var list = Array.prototype.slice.call(words);
        var opts = { charStagger: 52, cyclesPerChar: 18, tickMs: 36 };

        function scheduleNextCycle() {
          if (repeatTimer) {
            window.clearTimeout(repeatTimer);
          }
          repeatTimer = window.setTimeout(function () {
            repeatTimer = null;
            runScrambleThenChromatic();
          }, REPEAT_GAP_MS);
        }

        function runScrambleThenChromatic() {
          var pending = list.length;
          function onWordScrambleDone() {
            pending -= 1;
            if (pending <= 0) {
              runBlotterChromaticFlash(list, scheduleNextCycle);
            }
          }
          var ri;
          for (ri = 0; ri < list.length; ri++) {
            (function (w) {
              var txt = (w.getAttribute('data-scramble-text') || w.textContent || '').trim();
              var startDelay = isContractScanWord(w) ? CONTRACT_SUBTLE_LAG_MS : 0;
              scrambleWord(w, txt, {
                delay: startDelay,
                charStagger: opts.charStagger,
                cyclesPerChar: opts.cyclesPerChar,
                tickMs: opts.tickMs,
                onComplete: onWordScrambleDone,
              });
            })(list[ri]);
          }
        }

        runScrambleThenChromatic();
        io.disconnect();
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );

  io.observe(band);
})();
