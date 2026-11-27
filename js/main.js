(function () {
  'use strict';
  var root = document.documentElement;
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && matchMedia('(pointer: fine)').matches;
  var $ = function (id) { return document.getElementById(id); };
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var IO = 'IntersectionObserver' in window;

  /* ---------- theme ---------- */
  var themeBtn = $('themeBtn');
  function syncTheme() {
    var light = root.getAttribute('data-theme') === 'light';
    themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', light ? '#f4f6fb' : '#0b1220');
    window.dispatchEvent(new Event('themechange'));
  }
  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    syncTheme();
  });
  syncTheme();

  /* ---------- mobile menu ---------- */
  var nav = $('nav'), menuBtn = $('menuBtn');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- scroll progress + timeline fill ---------- */
  var prog = $('progress'), tl = $('timeline'), ticking = false;
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
    if (tl) {
      var r = tl.getBoundingClientRect();
      var p = (innerHeight * 0.65 - r.top) / r.height;
      tl.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    }
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- active nav ---------- */
  var links = {};
  $$('a', nav).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  if (IO) {
    var spy = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting && links[e.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); links[k].removeAttribute('aria-current'); });
          links[e.target.id].classList.add('active');
          links[e.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------- reveal on scroll ---------- */
  if (IO) {
    var rev = new IntersectionObserver(function (en, o) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.rv').forEach(function (el) { rev.observe(el); });
  } else { $$('.rv').forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- count-up ---------- */
  function fmtNum(v, el) {
    var dec = +(el.getAttribute('data-dec') || 0);
    var s = dec ? v.toFixed(dec) : String(Math.round(v));
    if (el.hasAttribute('data-comma')) s = Number(s).toLocaleString('en-US');
    return s + (el.getAttribute('data-suffix') || '');
  }
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (RM) { el.textContent = fmtNum(target, el); return; }
    var t0 = performance.now(), dur = 1500;
    (function tick(now) {
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmtNum(target * e, el);
      if (k < 1) requestAnimationFrame(tick); else el.textContent = fmtNum(target, el);
    })(t0);
  }
  if (IO && !RM) {
    var cnt = new IntersectionObserver(function (en, o) {
      en.forEach(function (e) {
        if (!e.isIntersecting) return;
        o.unobserve(e.target);
        var hero = e.target.closest('.hero');
        setTimeout(function () { runCount(e.target); }, hero ? 1500 : 150);
      });
    }, { threshold: 0.4 });
    $$('[data-count]').forEach(function (el) { el.textContent = fmtNum(0, el); cnt.observe(el); });
  }

  /* ---------- typed headline ---------- */
  var typed = $('typed');
  var phrases = ['AI agents that stay in bounds', 'line-following robots', 'apps students use every day', 'models that learn from data'];
  if (typed && !RM) {
    var pi = 0, ci = 0, del = false;
    typed.textContent = '';
    (function loop() {
      var full = phrases[pi];
      ci += del ? -1 : 1;
      typed.textContent = full.slice(0, ci);
      var wait = del ? 28 : 62;
      if (!del && ci === full.length) { wait = 1700; del = true; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; wait = 350; }
      setTimeout(loop, wait);
    })();
  }

  /* ---------- AI network canvas ---------- */
  (function () {
    var cv = $('net'); if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d'), hero = cv.parentNode;
    var W = 0, H = 0, pts = [], mouse = { x: -999, y: -999 }, vis = true, raf = 0;
    var col = { a: '#4a79ff', b: '#9a7bff' };
    function colors() {
      var cs = getComputedStyle(root);
      col.a = cs.getPropertyValue('--blue').trim() || col.a;
      col.b = cs.getPropertyValue('--violet').trim() || col.b;
      if (RM) draw();
    }
    function init() {
      var r = cv.getBoundingClientRect(); if (!r.width) return;
      var dpr = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(85, Math.round(W * H / 14000)); pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .38, vy: (Math.random() - .5) * .38, r: 1 + Math.random() * 1.6 });
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (!RM) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
        ctx.globalAlpha = .75; ctx.fillStyle = i % 3 ? col.a : col.b;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 14400) { ctx.globalAlpha = (1 - Math.sqrt(d) / 120) * .38; ctx.strokeStyle = col.a; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        var mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
        if (md < 28900) { ctx.globalAlpha = (1 - Math.sqrt(md) / 170) * .7; ctx.strokeStyle = col.b; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
    }
    function frame() { raf = 0; if (!vis || document.hidden) return; draw(); raf = requestAnimationFrame(frame); }
    function kick() { if (!RM && !raf && vis && !document.hidden) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
    if (IO) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; kick(); }, { threshold: 0 }).observe(hero);
    document.addEventListener('visibilitychange', kick);
    addEventListener('themechange', colors);
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(init, 150); });
    colors(); init(); kick();
  })();

  /* ---------- portrait tilt ---------- */
  var tilt = $('tilt');
  if (tilt && FINE && !RM) {
    tilt.addEventListener('pointermove', function (e) {
      var r = tilt.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      tilt.style.setProperty('--ry', (x * 12).toFixed(2) + 'deg');
      tilt.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
    });
    tilt.addEventListener('pointerleave', function () { tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg'); });
  }

  /* ---------- card spotlight + cursor glow ---------- */
  var glow = $('glow');
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var card = e.target.closest && e.target.closest('.spot');
    if (card) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }
    if (glow && FINE && !RM) { glow.classList.add('on'); glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; }
  }, { passive: true });
  document.addEventListener('pointerleave', function () { if (glow) glow.classList.remove('on'); });

  /* ---------- project filters ---------- */
  var fbtns = $$('.filters button'), projs = $$('.proj');
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      fbtns.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
      projs.forEach(function (p) {
        var show = f === 'all' || p.getAttribute('data-cat') === f;
        p.hidden = !show;
        if (show) p.classList.add('in');
      });
    });
  });

  /* ---------- terminal ---------- */
  (function () {
    var body = $('termBody'), form = $('termForm'), input = $('termInput'), chips = $('termChips');
    if (!body) return;
    var hist = [], hi = 0, touched = false;
    function line(text, cls) { var p = document.createElement('p'); if (cls) p.className = cls; p.textContent = text; body.appendChild(p); return p; }
    function end() { body.scrollTop = body.scrollHeight; }
    function linkLine(label, text, href) {
      var p = document.createElement('p'); p.className = 'out';
      p.appendChild(document.createTextNode(label));
      var a = document.createElement('a'); a.href = href; a.textContent = text;
      if (href.indexOf('http') === 0) { a.target = '_blank'; a.rel = 'noopener'; }
      p.appendChild(a); body.appendChild(p);
    }
    var C = {
      help: function () { return ['Commands:', '  whoami     who I am', '  about      short bio', '  education  degree and results', '  skills     what I work with', '  projects   what I have built', '  awards     competitions', '  cgpa       academic result', '  contact    how to reach me', '  clear      clear the screen']; },
      whoami: function () { return ['Shaswata Barua', 'CSE student, aspiring AI engineer', 'Robotics and machine learning', 'BGC Trust University Bangladesh']; },
      about: function () { return ['I build software that moves:', 'robots that follow a line, AI agents', 'that stay in bounds, apps students', 'use daily.', 'Goal: agentic AI engineer + research.']; },
      education: function () { return ['BSc in CSE, BGC Trust University', 'CGPA 3.94 / 4.00 (63 credits)', '1st in 3rd semester merit list,', 'Spring 2026', 'HSC 2022: 4.33  SSC 2020: 5.00']; },
      skills: function () { return ['Daily     C++, C, Python', 'Familiar  HTML/CSS, JavaScript, Java', 'AI/ML     NumPy, Pandas, PyTorch,', '          Hugging Face', 'Backend   FastAPI, SQLite, Firebase', 'Hardware  Arduino, sensors, circuits']; },
      projects: function () { return ['1. AgentOps Guardian', '   control layer for AI agents', '2. BGC Bus Tracker v2', '   live campus bus map', '3. DermaSheba', '   bilingual skin-health awareness', '4. Unix-like Shell (C++, in progress)', 'Scroll to Projects for demos.']; },
      awards: function () { return ['Champion         LFR, Tech Fest 2026', 'Runner-up        NSTU Line Race 2026', '2nd best project Electronics Lab 2026', 'Galactic Problem Solver, NASA', '                  Space Apps 2026', 'Participant      World Invention', '                  Competition 2026']; },
      cgpa: function () { return ['3.94 / 4.00', 'Semesters: 3.90, 3.93, 4.00']; },
      lfr: function () { return ['Champion, CSE Tech Fest 2026.', 'Runner-up, NSTU Robot Line Race 2026.']; }
    };
    C.ls = C.help; C.award = C.awards; C.project = C.projects; C.skill = C.skills;
    function run(raw) {
      var cmd = raw.trim().toLowerCase();
      line(raw, 'cmd');
      if (!cmd) { end(); return; }
      if (cmd === 'clear') { body.textContent = ''; return; }
      if (cmd === 'contact') {
        line('Reach me at:', 'out');
        linkLine('  email    ', 'shaswatabarua190@gmail.com', 'mailto:shaswatabarua190@gmail.com');
        linkLine('  github   ', 'github.com/ShaswataBarua', 'https://github.com/ShaswataBarua');
        linkLine('  linkedin ', 'shaswata-barua', 'https://www.linkedin.com/in/shaswata-barua-b42583275/');
        end(); return;
      }
      if (C[cmd]) { C[cmd]().forEach(function (t) { line(t, 'out'); }); }
      else { line('command not found: ' + cmd.slice(0, 40) + '. Type help.', 'out'); }
      end();
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault(); touched = true;
      var v = input.value; input.value = '';
      if (v.trim()) { hist.push(v); hi = hist.length; }
      run(v);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hi = Math.max(0, hi - 1); input.value = hist[hi]; }
      else if (e.key === 'ArrowDown' && hist.length) { e.preventDefault(); hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; }
    });
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      touched = true; run(b.getAttribute('data-cmd'));
    });
    line('Welcome. Type a command and press Enter, or tap one below.', 'ok');
    // short auto-demo the first time the terminal scrolls into view
    if (IO && !RM) {
      var demo = new IntersectionObserver(function (en, o) {
        if (!en[0].isIntersecting) return; o.disconnect();
        if (touched) return;
        var word = 'whoami', i = 0;
        (function t() {
          if (touched) { input.value = ''; return; }
          if (i <= word.length) { input.value = word.slice(0, i++); setTimeout(t, 110); }
          else setTimeout(function () { if (!touched) { input.value = ''; run(word); } }, 250);
        })();
      }, { threshold: 0.6 });
      demo.observe($('term'));
    }
  })();

  /* ---------- lightbox gallery ---------- */
  var box = $('lightbox'), lbImg = $('lbImg'), lbCap = $('lbCap'), lbCount = $('lbCount');
  var shots = $$('#achGrid .shot'), cur = 0;
  function show(i) {
    cur = (i + shots.length) % shots.length;
    var b = shots[cur];
    lbImg.src = b.getAttribute('data-full');
    lbImg.alt = b.querySelector('img').alt;
    lbCap.textContent = b.getAttribute('data-cap');
    lbCount.textContent = (cur + 1) + ' of ' + shots.length;
  }
  shots.forEach(function (b, i) {
    b.addEventListener('click', function () { show(i); if (typeof box.showModal === 'function') box.showModal(); });
  });
  $$('.proj-image[data-full]').forEach(function (b) {
    b.addEventListener('click', function () {
      lbImg.src = b.getAttribute('data-full');
      lbImg.alt = b.querySelector('img').alt;
      lbCap.textContent = b.getAttribute('data-cap');
      lbCount.textContent = 'Project image';
      if (typeof box.showModal === 'function') box.showModal();
    });
  });
  $('lbPrev').addEventListener('click', function () { show(cur - 1); });
  $('lbNext').addEventListener('click', function () { show(cur + 1); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });

  /* ---------- contact form (FormSubmit). First submission sends an activation email. ---------- */
  var form = $('contactForm'), msg = $('formMsg');
  var ENDPOINT = 'https://formsubmit.co/ajax/shaswatabarua190@gmail.com';
  function say(text, cls) { msg.textContent = text; msg.className = 'form-msg ' + (cls || ''); }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, bad = false;
    ['name', 'email', 'message'].forEach(function (k) {
      var ok = f[k].value.trim() && (k !== 'email' || /^\S+@\S+\.\S+$/.test(f[k].value.trim()));
      f[k].classList.toggle('invalid', !ok);
      if (!ok) bad = true;
    });
    if (bad) { say('Fill in your name, a valid email and a message, then send again.', 'err'); return; }
    if (f._honey.value) return;
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; say('Sending…');
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: f.name.value.trim(), email: f.email.value.trim(), message: f.message.value.trim(),
        _subject: 'Portfolio message from ' + f.name.value.trim(), _template: 'table', _captcha: 'false'
      })
    }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function () { form.reset(); say('Message sent. I will reply by email.', 'ok'); })
      .catch(function () { say('The message did not send. Email shaswatabarua190@gmail.com directly.', 'err'); })
      .then(function () { btn.disabled = false; });
  });
})();
