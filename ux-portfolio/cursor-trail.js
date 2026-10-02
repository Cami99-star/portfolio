(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(any-pointer: fine)');
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  Object.assign(layer.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '10000', overflow: 'hidden' });
  document.body.appendChild(layer);
  const butterflies = [];
  let lastTime = -Infinity;
  let lastX, lastY;
  const drawing = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" width="10" height="10" fill="none" stroke="#30312d" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M31 22C25 12 11 1 5 4C0 7 11 21 13 26C17 31 26 30 32 26C39 30 49 29 52 24C55 17 63 7 59 3C55 0 39 12 33 22M14 29C13 39 19 48 25 44C30 41 31 34 32 28M50 29C52 37 45 48 39 44C34 41 33 34 32 28M30 13L32 28L33 39M29 17L26 10M34 17L37 9"/></svg>';
  function clear() {
    butterflies.splice(0).forEach(item => item.remove());
    lastX = lastY = undefined;
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || motion.matches || !pointer.matches) return;
    const now = performance.now();
    if (now - lastTime < 20 || (event.clientX === lastX && event.clientY === lastY)) return;
    lastTime = now;
    const angle = lastX === undefined ? 0 : Math.atan2(event.clientY - lastY, event.clientX - lastX) * 180 / Math.PI + 90;
    lastX = event.clientX;
    lastY = event.clientY;
    const butterfly = document.createElement('span');
    butterfly.innerHTML = drawing;
    Object.assign(butterfly.style, { position: 'absolute', left: `${event.clientX}px`, top: `${event.clientY}px`, width: '10px', height: '10px', pointerEvents: 'none' });
    layer.appendChild(butterfly);
    butterflies.push(butterfly);
    if (butterflies.length > 15) butterflies.shift().remove();
    const animation = butterfly.animate([
      { opacity: 1, transform: `translate(-50%, -50%) rotate(${angle}deg) scale(1)` },
      { opacity: 0, transform: `translate(-50%, -50%) rotate(${angle}deg) scale(${2 / 10})` }
    ], { duration: 600, easing: 'ease-out', fill: 'forwards' });
    animation.onfinish = () => {
      butterfly.remove();
      const index = butterflies.indexOf(butterfly);
      if (index !== -1) butterflies.splice(index, 1);
    };
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', clear);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  motion.addEventListener('change', clear);
})();
