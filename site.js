/* ═══════════════════════════════════════════════ wewaked — shared shell
 * Renders the nav, wires Auth0, and exposes a tiny store helper. Every page
 * includes this; nothing here is page-specific.
 */
(function(){
  const AUTH0_DOMAIN    = 'dev-efi5czbtjnr634yb.us.auth0.com';
  const AUTH0_CLIENT_ID = 'QqcwVFTUfFIDvOkXKLmwAkFFUBu20LOZ';
  const ADMIN_EMAIL     = 'darapu777@gmail.com';

  const PAGES = [
    { href:'/',            label:'Home'    },
    { href:'/case.html',   label:'Case'    },
    { href:'/fantasy.html',label:'Fantasy' },
    { href:'/tools.html',  label:'Tools'   },
  ];

  const esc = s => String(s == null ? '' : s)
    .replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  /* ── nav ------------------------------------------------------------- */
  function here(){
    let p = location.pathname.replace(/index\.html$/, '');
    if(p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p === '' ? '/' : p;
  }
  function mountNav(){
    const host = document.querySelector('[data-nav]');
    if(!host) return;
    const cur = here();
    host.className = 'nav';
    host.innerHTML = `
      <div class="nav-in">
        <a class="brand" href="/">Wewaked</a>
        <nav class="nav-links" aria-label="Sections">
          ${PAGES.map(p => {
            const active = p.href === '/' ? cur === '/' : cur === p.href.replace(/\.html$/, '.html');
            return `<a href="${p.href}"${active ? ' aria-current="page"' : ''}>${p.label}</a>`;
          }).join('')}
        </nav>
        <div class="nav-right">
          <span class="user-chip" id="ww-user" hidden></span>
          <button class="pill" id="ww-login" type="button" hidden>Sign in</button>
          <button class="pill ghost" id="ww-logout" type="button" hidden>Sign out</button>
        </div>
      </div>`;
  }

  /* ── auth ------------------------------------------------------------ */
  const listeners = [];
  let currentUser = null;

  async function initAuth(){
    const login  = document.getElementById('ww-login');
    const logout = document.getElementById('ww-logout');
    const chip   = document.getElementById('ww-user');
    if(!login) return;
    login.hidden = false;                       // safe default if the SDK never loads
    try{
      if(typeof auth0 === 'undefined') return;
      const client = await auth0.createAuth0Client({
        domain: AUTH0_DOMAIN,
        clientId: AUTH0_CLIENT_ID,
        authorizationParams:{ redirect_uri: location.origin + location.pathname },
        cacheLocation:'localstorage',
      });
      window.wwAuthClient = client;

      if(location.search.includes('error=')){
        const q = new URLSearchParams(location.search);
        console.warn('Auth error:', q.get('error_description') || q.get('error'));
        history.replaceState({}, '', location.pathname);
      }
      if(location.search.includes('code=') && location.search.includes('state=')){
        await client.handleRedirectCallback();
        history.replaceState({}, '', location.pathname);
      }

      const isAuth = await client.isAuthenticated();
      login.hidden = isAuth; logout.hidden = !isAuth;
      if(isAuth){
        const u = await client.getUser();
        currentUser = u;
        chip.textContent = u.email || u.name || 'Signed in';
        chip.hidden = false;
        if(u.email === ADMIN_EMAIL) document.querySelectorAll('[data-admin]').forEach(el => el.hidden = false);
      }
      login.addEventListener('click', () => client.loginWithRedirect());
      logout.addEventListener('click', () => client.logout({ logoutParams:{ returnTo: location.origin } }));
      listeners.forEach(fn => { try{ fn(currentUser); }catch(e){ console.error(e); } });
    }catch(err){
      console.error('Auth0 failed to initialize:', err);
    }
  }

  /* ── local store ------------------------------------------------------
   * Everything the site remembers lives in this browser. There is no server
   * behind these pages, so nothing here syncs between devices.            */
  const store = {
    get(key, fallback){
      try{
        const raw = localStorage.getItem('ww:' + key);
        return raw == null ? fallback : JSON.parse(raw);
      }catch(e){ return fallback; }
    },
    set(key, value){
      try{ localStorage.setItem('ww:' + key, JSON.stringify(value)); return true; }
      catch(e){ console.warn('Could not save — storage may be full or blocked.', e); return false; }
    },
    del(key){ try{ localStorage.removeItem('ww:' + key); }catch(e){} },
  };

  window.WW = {
    esc, store, ADMIN_EMAIL,
    onUser(fn){ listeners.push(fn); if(currentUser) fn(currentUser); },
    get user(){ return currentUser; },
    /* debounce for anything that writes on every keystroke */
    debounce(fn, ms){
      let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
    },
    /* stable id */
    uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); },
    toast(msg){
      let el = document.getElementById('ww-toast');
      if(!el){
        el = document.createElement('div');
        el.id = 'ww-toast';
        el.style.cssText =
          'position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(12px);z-index:400;' +
          'background:rgba(28,28,30,.94);border:1px solid rgba(255,255,255,.17);border-radius:12px;' +
          'padding:10px 16px;font:500 13px/1.4 ' + getComputedStyle(document.body).fontFamily + ';' +
          'color:#f5f5f7;box-shadow:0 20px 50px -12px rgba(0,0,0,.8);opacity:0;' +
          'transition:opacity .22s ease,transform .22s ease;pointer-events:none;backdrop-filter:blur(20px)';
        document.body.appendChild(el);
      }
      el.textContent = msg;
      requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateX(-50%) translateY(0)'; });
      clearTimeout(el._t);
      el._t = setTimeout(() => {
        el.style.opacity = '0'; el.style.transform = 'translateX(-50%) translateY(12px)';
      }, 2200);
    },
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => { mountNav(); initAuth(); });
  }else{
    mountNav(); initAuth();
  }
})();
