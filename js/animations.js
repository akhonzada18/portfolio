/** A small, consistent motion system. Every element is readable without JS.
 * Uses native Web Animations + IntersectionObserver, with complete pause support.
 */
(() => {
  'use strict';
  const app = window.Portfolio;
  const active = new Set();
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const easing = 'cubic-bezier(.22,1,.36,1)';
  function animate(element, frames, options) {
    if (!app.motionEnabled || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, { ...options, easing });
    active.add(animation);
    animation.finished.then(() => active.delete(animation)).catch(() => active.delete(animation));
  }
  // There is no preload gate. Text and links are immediately available.
  document.querySelectorAll('.title-line > span').forEach((element, index) => animate(element,
    [{ transform: 'translateY(105%) rotate(2deg)', opacity: .2 }, { transform: 'translateY(0) rotate(0deg)', opacity: 1 }],
    { duration: 1000, delay: 100 + index * 130, fill: 'backwards' }));
  animate(document.querySelector('.specialization'), [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 750, delay: 470, fill: 'backwards' });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        animate(entry.target, [{ opacity: .1, transform: 'translateY(32px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 800 });
      });
    }, { rootMargin: '0px 0px -25px 0px', threshold: .08 });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  }

  const title = document.getElementById('hero-title-wrap');
  let lensFrame = 0;
  const lens = { x: 0, y: 0, active: false };
  function moveLens() {
    lensFrame = 0;
    title.style.setProperty('--lens-x', lens.x + 'px');
    title.style.setProperty('--lens-y', lens.y + 'px');
    title.style.setProperty('--lens-r', lens.active && app.motionEnabled && fine.matches ? Math.min(130, title.clientWidth * .13) + 'px' : '0px');
  }
  title.addEventListener('pointermove', event => {
    if (!app.motionEnabled || !fine.matches) return;
    const r = title.getBoundingClientRect();
    lens.x = event.clientX - r.left; lens.y = event.clientY - r.top; lens.active = true;
    if (!lensFrame) lensFrame = requestAnimationFrame(moveLens);
  });
  title.addEventListener('pointerleave', () => { lens.active = false; moveLens(); });

  // A supplementary ring: the native pointer is kept for usability.
  const dot = document.getElementById('pointer-dot');
  let pointerFrame = 0, px = -100, py = -100;
  function paintPointer() {
    pointerFrame = 0;
    dot.style.left = px + 'px'; dot.style.top = py + 'px';
  }
  document.addEventListener('pointermove', event => {
    if (!app.motionEnabled || !fine.matches || innerWidth <= 760) return;
    px = event.clientX; py = event.clientY;
    dot.style.opacity = event.target.closest('dialog') ? '0' : '.65';
    dot.classList.toggle('over-link', Boolean(event.target.closest('a, button, summary')));
    if (!pointerFrame) pointerFrame = requestAnimationFrame(paintPointer);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { dot.style.opacity = '0'; });
  document.querySelectorAll('[data-magnetic]').forEach(element => {
    element.addEventListener('pointermove', event => {
      if (!app.motionEnabled || !fine.matches) return;
      const r = element.getBoundingClientRect();
      const x = (event.clientX - r.left - r.width / 2) * .12;
      const y = (event.clientY - r.top - r.height / 2) * .12;
      element.style.transform = `translate(${x}px,${y}px)`;
    });
    element.addEventListener('pointerleave', () => { element.style.transform = ''; });
  });
  document.addEventListener('portfolio:motion', event => {
    if (event.detail.enabled) return;
    active.forEach(animation => { animation.cancel(); }); active.clear();
    lens.active = false; moveLens(); dot.style.opacity = '0';
    document.querySelectorAll('[data-magnetic]').forEach(element => { element.style.transform = ''; });
  });
  document.addEventListener('visibilitychange', () => {
    active.forEach(animation => {
      if (document.hidden) animation.pause();
      else if (app.motionEnabled) animation.play();
      else animation.cancel();
    });
  });
})();
