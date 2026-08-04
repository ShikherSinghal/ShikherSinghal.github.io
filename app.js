import { animate, stagger } from 'https://esm.sh/framer-motion@11.11.17';
import * as THREE from 'https://esm.sh/three@0.170.0';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const portfolioSite = document.querySelector('#portfolio-site');
const advocateSite = document.querySelector('#advocate-site');
const viewButtons = [...document.querySelectorAll('[data-view-target]')];
const descriptionMeta = document.querySelector('meta[name="description"]');
const themeMeta = document.querySelector('meta[name="theme-color"]');

const viewDetails = {
  portfolio: {
    title: 'Shikher Singhal — Senior Frontend Engineer',
    description: 'Shikher Singhal — senior frontend engineer building fast, scalable, human-centered web products.',
    theme: '#090a0d',
  },
  advocate: {
    title: 'Advocate Shubhendu Shekhar — Prayagraj High Court',
    description: 'Advocate Shubhendu Shekhar — 9+ years of legal practice at Prayagraj High Court. Office at Subhash Chowk, Prayagraj.',
    theme: '#07131f',
  },
};

const readStoredView = () => {
  try { return localStorage.getItem('preferred-site-view'); } catch { return null; }
};

const requestedView = new URLSearchParams(window.location.search).get('view');
let activeView = requestedView === 'advocate' || requestedView === 'portfolio'
  ? requestedView
  : readStoredView() === 'advocate' ? 'advocate' : 'portfolio';

let portfolioOrbReady = false;
let lawSceneReady = false;
let portfolioHeroAnimated = false;
let lawHeroAnimated = false;

function syncViewUrl(view, clearHash = true) {
  const url = new URL(window.location.href);
  if (view === 'portfolio') url.searchParams.delete('view');
  else url.searchParams.set('view', 'advocate');
  if (clearHash) url.hash = '';
  history.replaceState({ view }, '', `${url.pathname}${url.search}`);
}

function animateHero(view) {
  if (reducedMotion) return;
  if (view === 'portfolio' && !portfolioHeroAnimated) {
    portfolioHeroAnimated = true;
    animate('.hero-animate', { opacity: [0, 1], y: [28, 0] }, { duration: 0.8, delay: stagger(0.1), ease: [0.22, 1, 0.36, 1] });
  }
  if (view === 'advocate' && !lawHeroAnimated) {
    lawHeroAnimated = true;
    animate('.law-hero-animate', { opacity: [0, 1], y: [30, 0] }, { duration: 0.85, delay: stagger(0.09), ease: [0.22, 1, 0.36, 1] });
  }
}

function applyView(view, { persist = true, updateUrl = true, scroll = true } = {}) {
  activeView = view === 'advocate' ? 'advocate' : 'portfolio';
  const isAdvocate = activeView === 'advocate';

  portfolioSite.hidden = isAdvocate;
  advocateSite.hidden = !isAdvocate;
  root.dataset.view = activeView;

  viewButtons.forEach((button) => {
    const selected = button.dataset.viewTarget === activeView;
    button.setAttribute('aria-pressed', String(selected));
  });

  const details = viewDetails[activeView];
  document.title = details.title;
  if (descriptionMeta) descriptionMeta.content = details.description;
  if (themeMeta) themeMeta.content = details.theme;

  if (persist) {
    try { localStorage.setItem('preferred-site-view', activeView); } catch { /* storage may be unavailable */ }
  }
  if (updateUrl) syncViewUrl(activeView, scroll);

  closePortfolioMenu();
  closeLawMenu();

  requestAnimationFrame(() => {
    if (activeView === 'portfolio') initPortfolioOrb();
    else initLawScene();
    animateHero(activeView);
    updateLawChrome();
    if (scroll) window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });
}

viewButtons.forEach((button) => button.addEventListener('click', () => {
  applyView(button.dataset.viewTarget);
}));

window.addEventListener('popstate', () => {
  const view = new URLSearchParams(window.location.search).get('view') === 'advocate' ? 'advocate' : 'portfolio';
  applyView(view, { persist: false, updateUrl: false });
});

const themeToggle = document.querySelector('[data-theme-toggle]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const portfolioNav = portfolioSite.querySelector('.nav');

root.dataset.theme = (() => {
  try { return localStorage.getItem('portfolio-theme') || 'dark'; } catch { return 'dark'; }
})();

function updateThemeIcon() {
  if (themeToggle) themeToggle.textContent = root.dataset.theme === 'dark' ? '☀' : '☾';
}

function closePortfolioMenu() {
  portfolioNav?.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (menuToggle) menuToggle.textContent = '☰';
}

updateThemeIcon();
themeToggle?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('portfolio-theme', root.dataset.theme); } catch { /* storage may be unavailable */ }
  updateThemeIcon();
});

menuToggle?.addEventListener('click', () => {
  const open = portfolioNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.textContent = open ? '×' : '☰';
});
portfolioNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closePortfolioMenu));

const year = new Date().getFullYear();
document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = year; });
document.querySelectorAll('[data-law-year]').forEach((element) => { element.textContent = year; });

const lawTopbar = document.querySelector('.law-topbar');
const lawProgress = document.querySelector('.law-progress span');
const lawMenuToggle = document.querySelector('[data-law-menu-toggle]');
const lawMobileNav = document.querySelector('[data-law-mobile-nav]');

function closeLawMenu() {
  if (lawMobileNav) lawMobileNav.hidden = true;
  lawMenuToggle?.setAttribute('aria-expanded', 'false');
  if (lawMenuToggle) lawMenuToggle.textContent = '☰';
}

lawMenuToggle?.addEventListener('click', () => {
  const open = lawMobileNav.hidden;
  lawMobileNav.hidden = !open;
  lawMenuToggle.setAttribute('aria-expanded', String(open));
  lawMenuToggle.textContent = open ? '×' : '☰';
});
lawMobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeLawMenu));

function updateLawChrome() {
  const isAdvocate = activeView === 'advocate';
  lawTopbar?.classList.toggle('is-scrolled', isAdvocate && window.scrollY > 28);
  if (!lawProgress) return;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = isAdvocate ? Math.min(window.scrollY / maxScroll, 1) : 0;
  lawProgress.style.transform = `scaleX(${progress})`;
}
window.addEventListener('scroll', updateLawChrome, { passive: true });
window.addEventListener('resize', updateLawChrome, { passive: true });

if (!reducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animate(entry.target, { opacity: [0, 1], y: [24, 0] }, { duration: 0.7, ease: [0.22, 1, 0.36, 1] });
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -35px' });

  document.querySelectorAll('.reveal, .law-reveal').forEach((element) => {
    element.style.opacity = '0';
    revealObserver.observe(element);
  });
}

for (const card of document.querySelectorAll('.law-card')) {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
  });
}

const lawForm = document.querySelector('[data-law-form]');
lawForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(lawForm);
  const message = [
    'Hello Advocate Shubhendu Shekhar,',
    '',
    `Name: ${data.get('name') || ''}`,
    `Phone: ${data.get('phone') || ''}`,
    `Email: ${data.get('email') || 'Not provided'}`,
    '',
    `Matter: ${data.get('message') || ''}`,
  ].join('\n');
  window.open(`https://wa.me/919721194711?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});

function initPortfolioOrb() {
  if (portfolioOrbReady) return;
  const mount = document.querySelector('.three-orb');
  if (!mount || !window.WebGLRenderingContext) return;
  portfolioOrbReady = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.z = 4.7;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  mount.appendChild(renderer.domElement);

  const geometry = new THREE.IcosahedronGeometry(1.45, 5);
  const material = new THREE.MeshStandardMaterial({ color: 0x8ff0bb, roughness: 0.18, metalness: 0.05, flatShading: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.set(0.45, -0.6, 0.25);
  scene.add(mesh);
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 3, 4);
  scene.add(key);
  const fill = new THREE.PointLight(0x9bf7c6, 2);
  fill.position.set(-4, -2, 2);
  scene.add(fill);

  const resize = () => {
    const width = Math.max(mount.clientWidth, 1);
    const height = Math.max(mount.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(mount);

  const render = () => {
    if (activeView === 'portfolio') {
      if (!reducedMotion) {
        mesh.rotation.y += 0.0025;
        mesh.rotation.x += 0.0007;
        mesh.position.y = Math.sin(performance.now() * 0.0008) * 0.08;
      }
      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
  };
  render();
}

function initLawScene() {
  if (lawSceneReady) return;
  const mount = document.querySelector('#law-scene');
  if (!mount || !window.WebGLRenderingContext) return;
  lawSceneReady = true;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x07131f, 5.5, 12);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.2, 6.5);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  const key = new THREE.DirectionalLight(0xf3cc84, 2.25);
  key.position.set(3, 4, 5);
  scene.add(key);
  const fill = new THREE.PointLight(0x5d92aa, 1.7);
  fill.position.set(-3, 0, 2);
  scene.add(fill);

  const gold = new THREE.MeshStandardMaterial({ color: 0xd5aa62, metalness: 0.82, roughness: 0.22 });
  const goldSoft = new THREE.MeshStandardMaterial({ color: 0xb98c45, metalness: 0.72, roughness: 0.28, side: THREE.DoubleSide });
  const stone = new THREE.MeshStandardMaterial({ color: 0x8d7654, roughness: 0.62, metalness: 0.12 });
  const stoneCap = new THREE.MeshStandardMaterial({ color: 0xc7a46b, roughness: 0.48 });
  const balance = new THREE.Group();

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.8, 32), gold);
  pole.position.y = -0.65;
  balance.add(pole);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 3.45, 32), gold);
  beam.position.y = 0.72;
  beam.rotation.z = Math.PI / 2;
  balance.add(beam);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.78, 0.2, 48), goldSoft);
  base.position.y = -2.1;
  balance.add(base);
  const baseStep = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.55, 0.25, 48), goldSoft);
  baseStep.position.y = -1.9;
  balance.add(baseStep);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), gold);
  finial.position.y = 0.98;
  balance.add(finial);

  for (const x of [-1.45, 1.45]) {
    const panGroup = new THREE.Group();
    panGroup.position.set(x, 0.18, 0);
    const pan = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.22, 48, 1, true), goldSoft);
    pan.position.y = -1.18;
    pan.rotation.z = Math.PI;
    panGroup.add(pan);

    for (const offset of [-0.38, 0.38]) {
      const points = [new THREE.Vector3(offset, 0.42, 0), new THREE.Vector3(offset * 0.9, -1.07, 0)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xb48c50 }));
      panGroup.add(line);
    }
    balance.add(panGroup);
  }
  scene.add(balance);

  const addColumn = (x) => {
    const column = new THREE.Group();
    column.position.set(x, -1.4, -1.5);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 3.8, 24), stone);
    column.add(shaft);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.7), stoneCap);
    top.position.y = 2;
    column.add(top);
    const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.2, 0.76), stoneCap);
    bottom.position.y = -2;
    column.add(bottom);
    scene.add(column);
  };
  addColumn(-3.1);
  addColumn(3.1);

  const particleCount = 70;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let index = 0; index < particleCount; index += 1) {
    particlePositions[index * 3] = (Math.random() - 0.5) * 8;
    particlePositions[index * 3 + 1] = (Math.random() - 0.5) * 5;
    particlePositions[index * 3 + 2] = (Math.random() - 0.5) * 5;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color: 0xe0bb75, size: 0.025, transparent: true, opacity: 0.48 }));
  scene.add(particles);

  let pointerX = 0;
  mount.addEventListener('pointermove', (event) => {
    const rect = mount.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
  }, { passive: true });
  mount.addEventListener('pointerleave', () => { pointerX = 0; }, { passive: true });

  const resize = () => {
    const width = Math.max(mount.clientWidth, 1);
    const height = Math.max(mount.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(mount);

  const clock = new THREE.Clock();
  const render = () => {
    if (activeView === 'advocate') {
      const elapsed = clock.getElapsedTime();
      if (!reducedMotion) {
        balance.rotation.y += (pointerX * 0.18 - balance.rotation.y) * 0.035;
        balance.rotation.z = Math.sin(elapsed * 0.55) * 0.018;
        balance.position.y = Math.sin(elapsed * 0.72) * 0.08;
        particles.rotation.y += 0.0007;
      }
      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
  };
  render();
}

applyView(activeView, { persist: false, updateUrl: requestedView == null && activeView === 'advocate', scroll: false });

if (window.location.hash) {
  requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView());
}

// Advocate information notice. Acceptance lasts for the current browser session.
const noticeStyle = document.createElement('style');
noticeStyle.textContent = `
  body.law-notice-open { overflow: hidden; }
  .law-notice { position: fixed; z-index: 1600; inset: 0; display: grid; place-items: center; padding: 22px; color: #fffdf8; background: rgba(3, 11, 17, .88); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
  .law-notice[hidden] { display: none; }
  .law-notice__card { width: min(620px, 100%); padding: clamp(28px, 5vw, 48px); background: linear-gradient(145deg, #10283a, #07131f); border: 1px solid rgba(235, 210, 159, .28); border-radius: 20px; box-shadow: 0 30px 100px rgba(0, 0, 0, .5); }
  .law-notice__kicker { display: block; margin-bottom: 16px; color: #c8a464; font: 700 10px/1.3 'DM Sans', sans-serif; letter-spacing: .18em; text-transform: uppercase; }
  .law-notice h2 { margin: 0 0 18px; color: #ebd29f; font: 500 clamp(32px, 6vw, 48px)/1.08 'Playfair Display', serif; }
  .law-notice p { margin: 0 0 14px; color: rgba(255, 255, 255, .68); font: 400 14px/1.75 'DM Sans', sans-serif; }
  .law-notice__actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
  .law-notice__actions button { min-height: 48px; padding: 0 20px; border-radius: 9px; border: 1px solid #c8a464; font: 700 13px/1 'DM Sans', sans-serif; cursor: pointer; }
  .law-notice__accept { color: #101923; background: #c8a464; }
  .law-notice__return { color: #fffdf8; background: transparent; border-color: rgba(255, 255, 255, .25) !important; }
  .law-notice__actions button:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
  @media (max-width: 520px) { .law-notice__actions { flex-direction: column; } .law-notice__actions button { width: 100%; } }
`;
document.head.appendChild(noticeStyle);

const lawNotice = document.createElement('div');
lawNotice.className = 'law-notice';
lawNotice.hidden = true;
lawNotice.setAttribute('role', 'dialog');
lawNotice.setAttribute('aria-modal', 'true');
lawNotice.setAttribute('aria-labelledby', 'law-notice-title');
lawNotice.innerHTML = `
  <div class="law-notice__card">
    <span class="law-notice__kicker">Professional information notice</span>
    <h2 id="law-notice-title">Please read before continuing.</h2>
    <p>This website is provided solely for general information about Advocate Shubhendu Shekhar. It is not an advertisement, solicitation or invitation for legal work. By continuing, you confirm that you are seeking this information of your own accord.</p>
    <p>The material on this website is not legal advice. Viewing the website, submitting an enquiry or contacting the advocate does not by itself create an advocate–client relationship.</p>
    <div class="law-notice__actions">
      <button class="law-notice__accept" type="button">I acknowledge</button>
      <button class="law-notice__return" type="button">Return to portfolio</button>
    </div>
  </div>
`;
document.body.appendChild(lawNotice);

const noticeAccepted = () => {
  try { return sessionStorage.getItem('law-information-notice') === 'accepted'; } catch { return false; }
};

const syncLawNotice = () => {
  const shouldShow = activeView === 'advocate' && !noticeAccepted();
  lawNotice.hidden = !shouldShow;
  document.body.classList.toggle('law-notice-open', shouldShow);
  if (shouldShow) requestAnimationFrame(() => lawNotice.querySelector('.law-notice__accept')?.focus());
};

lawNotice.querySelector('.law-notice__accept')?.addEventListener('click', () => {
  try { sessionStorage.setItem('law-information-notice', 'accepted'); } catch { /* storage may be unavailable */ }
  syncLawNotice();
});

lawNotice.querySelector('.law-notice__return')?.addEventListener('click', () => {
  applyView('portfolio');
  syncLawNotice();
});

viewButtons.forEach((button) => button.addEventListener('click', () => requestAnimationFrame(syncLawNotice)));
window.addEventListener('popstate', () => requestAnimationFrame(syncLawNotice));
syncLawNotice();
