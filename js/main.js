/** GM. Core navigation, motion preference, forms and accessible dialogs.
 * Plain deferred scripts; no bundler or network dependency.
 */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Private mode is supported. */ } }
  };
  let userPaused = store.get('gm-motion') === 'paused';
  let toastTimer = 0;
  const toast = document.getElementById('status-toast');
  const app = window.Portfolio = {
    storage: store,
    get motionEnabled() { return !reduced.matches && !userPaused; },
    announce(text) {
      clearTimeout(toastTimer);
      toast.textContent = text;
      toastTimer = setTimeout(() => { toast.textContent = ''; }, 6500);
    },
    interaction(kind) { document.dispatchEvent(new CustomEvent('portfolio:interaction', { detail: { kind } })); },
    openDialog(dialog, opener) {
      if (!dialog || !dialog.showModal) return false;
      dialog._opener = opener || document.activeElement;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      return true;
    }
  };
  root.classList.add('js-ready');

  const motionButton = document.getElementById('motion-button');
  function syncMotion() {
    const enabled = app.motionEnabled;
    root.classList.toggle('motion-paused', !enabled);
    motionButton.setAttribute('aria-pressed', String(enabled));
    motionButton.setAttribute('aria-label', reduced.matches ? 'Reduced motion follows your device setting' : enabled ? 'Pause decorative motion' : 'Resume decorative motion');
    motionButton.disabled = reduced.matches;
    document.getElementById('motion-label').textContent = reduced.matches ? 'Reduced motion' : enabled ? 'Motion on' : 'Motion off';
    document.getElementById('motion-icon').innerHTML = enabled
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
    document.dispatchEvent(new CustomEvent('portfolio:motion', { detail: { enabled } }));
  }
  motionButton.addEventListener('click', () => {
    userPaused = !userPaused;
    store.set('gm-motion', userPaused ? 'paused' : 'on');
    syncMotion();
  });
  reduced.addEventListener('change', syncMotion);
  syncMotion();

  // One canonical active section for the fixed corner navigation.
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const sections = navLinks.map(link => document.getElementById(link.dataset.nav));
  let scrollQueued = false;
  function updateNavigation() {
    scrollQueued = false;
    const threshold = Math.min(innerHeight * .38, 330);
    let active = '';
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= threshold && rect.bottom > threshold) active = section.id;
    }
    navLinks.forEach(link => {
      if (link.dataset.nav === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateNavigation); }
  }, { passive: true });
  window.addEventListener('resize', updateNavigation, { passive: true });
  updateNavigation();

  // Native links remain native; keyboard users get focus at their destination.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.detail !== 0 || link.hash === '#top') return;
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    });
  });

  const email = 'ghulamakhonzada@gmail.com';
  const copyButton = document.getElementById('copy-email');
  copyButton.addEventListener('click', async () => {
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(email); success = true; }
    } catch { /* Fall back for file:// previews or denied permissions. */ }
    if (!success) {
      const field = document.createElement('textarea');
      field.value = email;
      field.style.cssText = 'position:fixed;left:-10000px;top:0';
      document.body.appendChild(field);
      field.select();
      try { success = document.execCommand('copy'); } catch { success = false; }
      field.remove();
      copyButton.focus({ preventScroll: true });
    }
    app.announce(success ? 'Email address copied.' : 'Please select and copy the email address above.');
    if (success) app.interaction('copy');
  });

  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = '';
      if (dialog._opener && document.contains(dialog._opener)) dialog._opener.focus({ preventScroll: true });
    });
  });
  const inquiry = document.getElementById('inquiry-dialog');
  document.querySelectorAll('[data-open-inquiry]').forEach(button => button.addEventListener('click', () => {
    if (!app.openDialog(inquiry, button)) location.href = 'mailto:' + email;
    app.interaction('open');
  }));
  document.getElementById('inquiry-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const clean = key => String(data.get(key) || '').trim();
    const subject = `Portfolio inquiry: ${clean('focus')} - ${clean('name')}`;
    const body = `Name: ${clean('name')}\nEmail: ${clean('email')}\nFocus: ${clean('focus')}\n\n${clean('message')}`;
    document.getElementById('form-status').textContent = 'Opening a draft in your email app. Review it and press Send there. Nothing was sent or stored by this website. If no app opens, use the email link below.';
    location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  document.querySelectorAll('.capability').forEach(details => details.addEventListener('toggle', () => {
    if (details.open) app.interaction('detail');
  }));
})();
