import { animate, stagger } from 'https://esm.sh/framer-motion@11.11.17';
import * as THREE from 'https://esm.sh/three@0.170.0';

const root = document.documentElement;
const themeToggle = document.querySelector('[data-theme-toggle]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('.nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

root.dataset.theme = localStorage.getItem('portfolio-theme') || 'dark';
const updateThemeIcon = () => {
  if (themeToggle) themeToggle.textContent = root.dataset.theme === 'dark' ? '☀' : '☾';
};
updateThemeIcon();

themeToggle?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('portfolio-theme', root.dataset.theme);
  updateThemeIcon();
});

menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.textContent = open ? '×' : '☰';
});

document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (menuToggle) menuToggle.textContent = '☰';
}));

document.querySelector('[data-year]').textContent = new Date().getFullYear();

if (!reducedMotion) {
  animate('.hero-animate', { opacity: [0, 1], y: [28, 0] }, { duration: .8, delay: stagger(.1), ease: [0.22, 1, 0.36, 1] });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animate(entry.target, { opacity: [0, 1], y: [24, 0] }, { duration: .7, ease: [0.22, 1, 0.36, 1] });
      observer.unobserve(entry.target);
    });
  }, { threshold: .14 });
  document.querySelectorAll('.reveal').forEach((element) => {
    element.style.opacity = '0';
    observer.observe(element);
  });
}

const mount = document.querySelector('.three-orb');
if (mount && window.WebGLRenderingContext) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
  camera.position.z = 4.7;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  mount.appendChild(renderer.domElement);

  const geometry = new THREE.IcosahedronGeometry(1.45, 5);
  const material = new THREE.MeshStandardMaterial({ color: 0x8ff0bb, roughness: .18, metalness: .05, flatShading: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.set(.45, -.6, .25);
  scene.add(mesh);
  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 3, 4);
  scene.add(key);
  const fill = new THREE.PointLight(0x9bf7c6, 2);
  fill.position.set(-4, -2, 2);
  scene.add(fill);

  const resize = () => {
    const width = mount.clientWidth;
    const height = Math.max(mount.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(mount);

  const render = () => {
    if (!reducedMotion) {
      mesh.rotation.y += .0025;
      mesh.rotation.x += .0007;
      mesh.position.y = Math.sin(performance.now() * .0008) * .08;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };
  render();
}
