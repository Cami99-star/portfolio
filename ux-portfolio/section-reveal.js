(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window)) return;
  const style = document.createElement('style');
  style.textContent = `
    .section-reveal-wait{opacity:0}
    .section-reveal-wait.section-reveal-visible{opacity:1;transition:opacity 760ms cubic-bezier(.22,.61,.36,1);transition-delay:var(--reveal-delay,0ms)}
    @media(prefers-reduced-motion:reduce){.section-reveal-wait{opacity:1;transition:none}}
    @media print{.section-reveal-wait{opacity:1!important;transition:none!important}}
  `;
  document.head.appendChild(style);
  const selector = '.case-hero > .eyebrow,.case-hero > h1,.case-hero > .hero-lede,.project-facts,.overview,.story-index,.case-section > .section-head,.problem-grid,.opportunity,.decision,.context-strip,.test-intro,.task-list,.result-banner,.reflection-points,.scope-note,.wide-evidence,.flow-steps,.case-footer';
  const candidates = [...document.querySelectorAll(selector)];
  // A block fades as a unit; nested elements do not multiply its opacity.
  const blocks = candidates.filter(el => !candidates.some(parent => parent !== el && parent.contains(el)));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) reveal(entry.target);
  }), { threshold: 0, rootMargin: '0px 0px -36px 0px' });
  function reveal(element) {
    element.classList.add('section-reveal-visible');
    observer.unobserve(element);
  }
  const hero = [...document.querySelectorAll('.case-hero > .eyebrow,.case-hero > h1,.case-hero > .hero-lede,.project-facts')];
  blocks.forEach(el => {
    const index = hero.indexOf(el);
    if (index >= 0) el.style.setProperty('--reveal-delay', index * 75 + 'ms');
    el.classList.add('section-reveal-wait');
    observer.observe(el);
  });
  function showTarget(hash) {
    if (!hash || hash === '#') return;
    let target;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return; }
    if (target) blocks.filter(el => el === target || el.contains(target) || target.contains(el)).forEach(reveal);
  }
  showTarget(location.hash);
  window.addEventListener('hashchange', () => showTarget(location.hash));
  document.addEventListener('focusin', event => blocks.filter(el => el.contains(event.target)).forEach(reveal));
  preference.addEventListener('change', event => {
    if (event.matches) { blocks.forEach(reveal); observer.disconnect(); }
  });
})();
