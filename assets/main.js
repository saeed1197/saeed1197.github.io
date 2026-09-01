/* =========================================================
   Saeed Damra — DFIR Portfolio
   ========================================================= */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Mobile navigation ---------- */
  var menu    = $('#nav-menu');
  var toggle  = $('#nav-toggle');
  var close   = $('#nav-close');
  var overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  function openMenu()  { menu.classList.add('is-open');    overlay.classList.add('is-open');    document.body.style.overflow = 'hidden'; }
  function closeMenu() { menu.classList.remove('is-open'); overlay.classList.remove('is-open'); document.body.style.overflow = ''; }

  if (toggle)  toggle.addEventListener('click', openMenu);
  if (close)   close.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  $$('.nav__link').forEach(function (l) { l.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Theme ---------- */
  var root = document.documentElement;
  var themeBtn = $('#theme-button');
  var stored = null;
  try { stored = localStorage.getItem('sd-theme'); } catch (e) {}

  // Dark is the intended default; light is opt-in and remembered per browser.
  if (stored === 'light' || stored === 'dark') root.setAttribute('data-theme', stored);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('sd-theme', next); } catch (e) {}
    });
  }

  /* ---------- Header state, progress bar, scroll-to-top ---------- */
  var header    = $('#header');
  var progress  = $('#scroll-progress');
  var scrollTop = $('#scroll-top');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 24);
    scrollTop.classList.toggle('is-visible', y > 520);

    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  var sections = $$('main section[id]');
  var navLinks = $$('.nav__link');

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;
      navLinks.forEach(function (l) {
        l.classList.toggle('is-active', l.getAttribute('href') === '#' + id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(function (s) { spy.observe(s); });

  /* ---------- Reveal on scroll ---------- */
  var revealables = $$('.reveal');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        setTimeout(function () { el.classList.add('is-in'); }, Math.min(i, 6) * 70);
        obs.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Typing line ---------- */
  var typed = $('#typed');
  var phrases = [
    'Every byte tells a story — I read it.',
    'Acquire. Analyse. Reconstruct. Report.',
    'Memory forensics, host artefacts, threat hunting.',
    'Turning alerts into answers.'
  ];

  if (typed && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var pi = 0, ci = 0, deleting = false;

    (function tick() {
      var word = phrases[pi];
      typed.textContent = word.slice(0, ci);

      var delay = deleting ? 28 : 55;

      if (!deleting && ci === word.length) {
        deleting = true;
        delay = 2200;
      } else if (deleting && ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        delay = 320;
      } else {
        ci += deleting ? -1 : 1;
      }

      setTimeout(tick, delay);
    })();
  } else if (typed) {
    typed.textContent = phrases[0];
  }

  /* ---------- Contact form ---------- */
  var form   = $('#contact-form');
  var status = $('#form-status');

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.classList.remove('is-ok', 'is-err');
    if (kind) status.classList.add(kind);
  }

  if (form) {
    $$('input, textarea', form).forEach(function (el) {
      el.addEventListener('input', function () { el.classList.remove('is-invalid'); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name    = $('#f-name').value.trim();
      var email   = $('#f-email').value.trim();
      var subject = $('#f-subject').value.trim();
      var message = $('#f-message').value.trim();

      var bad = false;
      [['#f-name', name], ['#f-email', email], ['#f-message', message]].forEach(function (pair) {
        var el = $(pair[0]);
        if (!pair[1]) { el.classList.add('is-invalid'); bad = true; }
      });

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        $('#f-email').classList.add('is-invalid');
        bad = true;
        setStatus('That email address does not look right.', 'is-err');
        return;
      }

      if (bad) { setStatus('Please fill in name, email and message.', 'is-err'); return; }

      var endpoint = (form.dataset.endpoint || '').trim();
      var btn = $('.form__submit', form);
      var label = $('.form__submit-label', form);

      /* No endpoint configured — fall back to a pre-filled mail client. */
      if (!endpoint) {
        var body =
          'Name: ' + name + '\n' +
          'Email: ' + email + '\n\n' +
          message;
        var href = 'mailto:saeeddamra@hotmail.com' +
          '?subject=' + encodeURIComponent(subject || ('Portfolio message from ' + name)) +
          '&body=' + encodeURIComponent(body);
        window.location.href = href;
        setStatus('Opening your mail client…', 'is-ok');
        return;
      }

      btn.disabled = true;
      label.textContent = 'Sending…';
      setStatus('');

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, subject: subject, message: message })
      })
        .then(function (res) {
          if (!res.ok) throw new Error('bad status');
          form.reset();
          setStatus('Message sent. I\'ll get back to you shortly.', 'is-ok');
        })
        .catch(function () {
          setStatus('Something went wrong — email me directly at saeeddamra@hotmail.com', 'is-err');
        })
        .finally(function () {
          btn.disabled = false;
          label.textContent = 'Send message';
        });
    });
  }

  /* ---------- Year ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
