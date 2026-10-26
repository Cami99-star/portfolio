(() => {
 const root=document.documentElement;
 if(!root.dataset.theme)root.dataset.theme='dark';
 const button=document.createElement('button');button.className='theme-toggle';button.type='button';button.setAttribute('aria-pressed',String(root.dataset.theme==='light'));
 button.innerHTML='<svg class="theme-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.7"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg><svg class="theme-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 14.2A8.8 8.8 0 0 1 9.8 3.3a8.8 8.8 0 1 0 10.9 10.9Z"/></svg>';
 function update(){const light=root.dataset.theme==='light';button.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');button.title=light?'Switch to dark mode':'Switch to light mode';button.setAttribute('aria-pressed',String(light));}
 button.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='light'?'dark':'light';try{sessionStorage.setItem('cami-theme',root.dataset.theme)}catch{}update();window.dispatchEvent(new CustomEvent('themechange',{detail:{theme:root.dataset.theme}}))});
 update();document.body.appendChild(button);
})();
