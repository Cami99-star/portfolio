(() => {
  const finePointer = matchMedia('(any-pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const style = document.createElement('style');
  style.textContent = `
    :root{--glass-cursor-rgb:112,255,248}
    html[data-theme="light"]{--glass-cursor-rgb:255,77,134}
    html.glass-cursor-active,html.glass-cursor-active *{cursor:none!important}
    .glass-cursor{position:fixed;left:0;top:0;width:0;height:0;pointer-events:none!important;z-index:2147483647;visibility:hidden}
    .glass-cursor.is-visible{visibility:visible}.glass-cursor.is-menu-hidden{visibility:hidden}
    .glass-cursor-orb{position:absolute;left:-13px;top:-13px;width:26px;height:26px;border-radius:50%;box-sizing:border-box;pointer-events:none!important;
      background:radial-gradient(circle at 29% 23%,#ffffffb0 0%,rgba(var(--glass-cursor-rgb),.25) 17%,rgba(var(--glass-cursor-rgb),.07) 48%,rgba(var(--glass-cursor-rgb),.22) 78%,rgba(var(--glass-cursor-rgb),.44) 100%);
      border:1px solid rgba(var(--glass-cursor-rgb),.65);box-shadow:inset 0 1px 2px #ffffffcc,inset 0 -2px 4px rgba(var(--glass-cursor-rgb),.33),0 0 9px rgba(var(--glass-cursor-rgb),.14);
      backdrop-filter:blur(1px) saturate(1.35);-webkit-backdrop-filter:blur(1px) saturate(1.35);
      transform:scale(1);transition:transform 230ms cubic-bezier(.2,1.35,.3,1)}
    .glass-cursor-orb::before{content:'';position:absolute;left:5px;top:3px;width:10px;height:4px;border-radius:50%;background:linear-gradient(110deg,#ffffffcc,#ffffff00);transform:rotate(-30deg);filter:blur(.3px)}
    .glass-cursor.is-interactive .glass-cursor-orb{transform:scale(1.5)}
    .glass-cursor-video{display:none;position:absolute;left:-17px;top:-17px;width:34px;height:34px;color:rgb(var(--glass-cursor-rgb));filter:drop-shadow(0 1px 3px #000b);overflow:visible}
    .glass-cursor.is-video .glass-cursor-orb{display:none}
    .glass-cursor.is-video .glass-cursor-video{display:block}
    .glass-cursor-video .video-pause,.glass-cursor.is-video-playing .video-play{display:none}
    .glass-cursor.is-video-playing .video-pause{display:block}
    @media(prefers-reduced-motion:reduce){.glass-cursor-orb{transition:none}}
    @media(forced-colors:active){html.glass-cursor-active,html.glass-cursor-active *{cursor:auto!important}.glass-cursor{display:none}}
  `;
  document.head.appendChild(style);
  const cursor = document.createElement('div');
  cursor.className = 'glass-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span class="glass-cursor-orb"></span><svg class="glass-cursor-video" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path class="video-play" d="M10 6a1.5 1.5 0 0 1 2.3-1.3l16 10a1.5 1.5 0 0 1 0 2.6l-16 10A1.5 1.5 0 0 1 10 26Z"/><g class="video-pause"><rect x="7" y="5" width="6" height="22" rx="1.5"/><rect x="19" y="5" width="6" height="22" rx="1.5"/></g></svg>';
  document.body.appendChild(cursor);
  let x = 0, y = 0, visible = false;
  const selector = 'a[href],button,input:not([type="hidden"]),select,textarea,summary,[role="button"],[role="link"],[role="tab"],[role="checkbox"],[onclick]';
  function interactive(target) {
    if (!(target instanceof Element)) return false;
    const control = target.closest(selector);
    if (target.closest('[inert],[disabled],[aria-disabled="true"]')) return false;
    return Boolean(control) || getComputedStyle(target).cursor === 'pointer';
  }
  function videoAt(target, pointerY = y) {
    const video = target instanceof Element ? target.closest('video') : null;
    if (!video) return null;
    // Leave the native controls and timeline to the browser.
    const rect = video.getBoundingClientRect();
    if (video.controls && pointerY >= rect.bottom - 54) return null;
    return video;
  }
  function update(target) {
    // Native dialogs live in the top layer; keep the glass visible above their content.
    const dialog = target instanceof Element ? target.closest('dialog[open]') : null;
    const parent = dialog || document.body;
    if (cursor.parentElement !== parent) parent.appendChild(cursor);
    cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
    const video = videoAt(target);
    cursor.classList.toggle('is-video', Boolean(video));
    cursor.classList.toggle('is-video-playing', Boolean(video && !video.paused && !video.ended));
    cursor.classList.toggle('is-interactive', !video && interactive(target));
    cursor.classList.toggle('is-menu-hidden', Boolean(target instanceof Element && target.closest('.bubble-nav') && !target.closest('.nav-contact-panel')));
  }
  function hide() {
    visible = false;
    cursor.classList.remove('is-visible', 'is-interactive', 'is-video', 'is-video-playing');
    document.documentElement.classList.remove('glass-cursor-active');
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches) { hide(); return; }
    x = event.clientX; y = event.clientY;
    update(event.target);
    visible = true;
    cursor.classList.add('is-visible');
    document.documentElement.classList.add('glass-cursor-active');
  }, { passive: true });
  document.addEventListener('pointerover', event => { if (visible) update(event.target); }, { passive: true });
  document.addEventListener('scroll', () => { if (visible) update(document.elementFromPoint(x, y)); }, { passive: true, capture: true });
  document.addEventListener('click', event => {
    if (!visible || !finePointer.matches || event.button !== 0 || event.detail === 0) return;
    const video = videoAt(event.target, event.clientY);
    if (!video) return;
    event.preventDefault();
    if (video.paused || video.ended) video.play().catch(() => update(video));
    else video.pause();
    update(video);
  });
  ['play', 'pause', 'ended', 'emptied'].forEach(type => document.addEventListener(type, event => {
    if (visible && event.target instanceof HTMLVideoElement) update(document.elementFromPoint(x, y));
  }, true));
  document.documentElement.addEventListener('pointerleave', hide);
  document.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') hide(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  document.addEventListener('close', () => { if (visible) update(document.elementFromPoint(x, y)); }, true);
  window.addEventListener('blur', hide);
  finePointer.addEventListener('change', hide);
})();
