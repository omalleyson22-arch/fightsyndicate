// Fight Syndicate — homepage behaviour. No dependencies.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Missing-image fallback: flag the wrapper so CSS can show a labelled placeholder ---
  document.querySelectorAll('.media > img').forEach((img) => {
    const miss = () => img.parentElement.classList.add('is-missing');
    if (img.complete && !img.naturalWidth) miss();
    img.addEventListener('error', miss);
  });

  // --- Header: solid after scroll, mobile menu ---
  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMenu(false); menuBtn.focus(); } });
  matchMedia('(min-width: 1021px)').addEventListener('change', () => setMenu(false));

  // --- Hero: scroll + pointer driven depth (CSS reads --sc / --px / --py) ---
  const hero = document.querySelector('.hero');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      header.classList.toggle('is-solid', y > 40);
      if (!reduce) hero.style.setProperty('--sc', Math.min(1, y / (hero.offsetHeight * 0.9)).toFixed(3));
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!reduce && matchMedia('(hover: hover)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      hero.style.setProperty('--px', cx.toFixed(3));
      hero.style.setProperty('--py', cy.toFixed(3));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    hero.addEventListener('pointermove', (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    });
  }

  // --- Scroll reveal ---
  const items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  }

  // --- Program tabs (hover/focus previews on desktop, click anywhere, arrow keys) ---
  const tabsRoot = document.querySelector('[data-tabs]');
  if (tabsRoot) {
    const tabs = [...tabsRoot.querySelectorAll('[role=tab]')];
    const panels = [...tabsRoot.querySelectorAll('[role=tabpanel]')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p) => {
        const on = p.id === tab.getAttribute('aria-controls');
        p.hidden = false; // keep rendered so the cross-fade can run
        p.classList.toggle('is-active', on);
        p.setAttribute('aria-hidden', String(!on));
      });
      if (focus) tab.focus();
    };
    panels.forEach((p) => { p.hidden = false; p.setAttribute('aria-hidden', String(!p.classList.contains('is-active'))); });
    const canHover = matchMedia('(hover: hover) and (min-width: 901px)').matches;
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      if (canHover) t.addEventListener('mouseenter', () => select(t));
      t.addEventListener('keydown', (e) => {
        const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
      });
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
