import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Github, Linkedin, Mail, Menu, Moon, Sun, X } from 'lucide-react';

const expertise = [
  ['01', 'Frontend architecture', 'Scalable React and TypeScript foundations, reusable systems, and pragmatic state management.'],
  ['02', 'Product engineering', 'Turning ambiguous product requirements into reliable, accessible, and maintainable interfaces.'],
  ['03', 'Performance & quality', 'Profiling, rendering strategy, resilient API states, testing, and careful delivery practices.'],
  ['04', 'Technical leadership', 'Mentoring engineers, improving reviews, and aligning frontend decisions with business outcomes.'],
];

const experience = [
  ['May 2026 — Present', 'WEX International', 'Senior Software Engineer', 'Building product experiences and frontend systems for a global financial technology platform.'],
  ['Apr 2023 — May 2026', 'GreyOrange', 'Senior Software Engineer', 'Worked on complex enterprise interfaces for warehouse and robotics operations, with a focus on frontend scale and usability.'],
  ['Sep 2022 — Mar 2023', 'CleverTap', 'Software Developer', 'Contributed to customer-engagement product experiences and data-heavy web interfaces.'],
  ['Jun 2019 — Sep 2021', 'GreyOrange', 'Full-stack Developer', 'Built React applications and supporting services for operational software used in high-throughput environments.'],
];

const stack = ['React', 'TypeScript', 'JavaScript', 'Redux', 'Zustand', 'Node.js', 'C#', 'Tailwind CSS', 'WebSockets', 'Docker', 'Webpack', 'Design Systems'];

function ThreeOrb() {
  const mountRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

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
      const width = mount.clientWidth;
      const height = Math.max(mount.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    let frame;
    const render = () => {
      if (!reduced) {
        mesh.rotation.y += 0.0025;
        mesh.rotation.x += 0.0007;
        mesh.position.y = Math.sin(performance.now() * 0.0008) * 0.08;
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [reduced]);

  return <div className="three-orb" ref={mountRef} />;
}

function Reveal({ children, className = '', delay = 0 }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const reduced = useReducedMotion();
  const [dark, setDark] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const year = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  return (
    <div className="site-shell">
      <header className="header">
        <a className="brand" href="#top" aria-label="Shikher Singhal home"><span>SS</span><b>Shikher Singhal</b></a>
        <nav className={menuOpen ? 'nav open' : 'nav'} aria-label="Primary navigation">
          {['About', 'Expertise', 'Experience', 'Contact'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{item}</a>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={() => setDark((value) => !value)} aria-label="Toggle colour theme">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a className="compact-cta" href="mailto:singhalshikher1996@gmail.com">Let's talk <ArrowUpRight size={16} /></a>
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            {menuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero section-pad">
          <div className="hero-copy">
            <motion.p className="eyebrow" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }}>SENIOR FRONTEND ENGINEER · INDIA</motion.p>
            <motion.h1 initial={reduced ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              I build interfaces for <em>complex products.</em>
            </motion.h1>
            <motion.p className="hero-intro" initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              Seven years across enterprise platforms, real-time dashboards, and product engineering—currently at WEX International.
            </motion.p>
            <motion.div className="hero-links" initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
              <a className="primary-cta" href="#experience">Explore my work <ArrowUpRight size={18} /></a>
              <a className="text-link" href="https://github.com/ShikherSinghal" target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a>
            </motion.div>
          </div>
          <motion.div className="orb-wrap" initial={reduced ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.12 }} aria-hidden="true">
            <ThreeOrb />
            <span className="orb-note">Architecture · Craft · Impact</span>
          </motion.div>
          <div className="hero-meta"><span>Scroll to explore</span><span>Available for meaningful product challenges</span></div>
        </section>

        <section id="about" className="section-pad bordered">
          <Reveal className="section-label">ABOUT</Reveal>
          <Reveal className="about-grid">
            <h2>Engineering clarity into products that have a lot going on.</h2>
            <div className="about-copy">
              <p>I work at the intersection of frontend architecture, product thinking, and interaction design. My focus is making complicated workflows feel understandable—without sacrificing performance or maintainability.</p>
              <p>I enjoy shaping systems as much as individual screens: component APIs, state boundaries, data flows, delivery standards, and the collaboration habits around them.</p>
            </div>
          </Reveal>
          <Reveal className="metric-row">
            <div><strong>7+</strong><span>Years building software</span></div>
            <div><strong>4</strong><span>Product organisations</span></div>
            <div><strong>∞</strong><span>Curiosity for better systems</span></div>
          </Reveal>
        </section>

        <section id="expertise" className="section-pad">
          <Reveal className="section-heading"><span className="section-label">EXPERTISE</span><h2>What I bring to the table.</h2></Reveal>
          <div className="expertise-grid">
            {expertise.map(([number, title, text], index) => (
              <Reveal key={number} delay={index * 0.06} className="expertise-card"><span>{number}</span><h3>{title}</h3><p>{text}</p></Reveal>
            ))}
          </div>
          <Reveal className="stack-cloud">{stack.map((item) => <span key={item}>{item}</span>)}</Reveal>
        </section>

        <section id="experience" className="experience section-pad bordered">
          <Reveal className="section-heading"><span className="section-label">EXPERIENCE</span><h2>A career shaped around ambitious interfaces.</h2></Reveal>
          <div className="timeline">
            {experience.map(([period, company, role, detail], index) => (
              <Reveal key={`${company}-${period}`} delay={index * 0.05} className="timeline-row">
                <div className="timeline-period">{period}</div>
                <div className="timeline-main"><span>{company}</span><h3>{role}</h3><p>{detail}</p></div>
                <div className="timeline-index">0{index + 1}</div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="contact" className="contact section-pad">
          <Reveal>
            <span className="section-label">CONTACT</span>
            <h2>Have a difficult frontend problem?</h2>
            <p>That is usually the interesting kind. Let’s discuss the product, the constraints, and what a strong solution could look like.</p>
            <a className="email-link" href="mailto:singhalshikher1996@gmail.com">singhalshikher1996@gmail.com <ArrowUpRight size={26} /></a>
          </Reveal>
          <Reveal className="social-row">
            <a href="https://github.com/ShikherSinghal" target="_blank" rel="noreferrer"><Github size={19} /> GitHub</a>
            <a href="https://www.linkedin.com/in/shikher-singhal-250489117" target="_blank" rel="noreferrer"><Linkedin size={19} /> LinkedIn</a>
            <a href="mailto:singhalshikher1996@gmail.com"><Mail size={19} /> Email</a>
          </Reveal>
        </section>
      </main>

      <footer><span>© {year} Shikher Singhal</span><span>Designed for clarity. Built with React, Motion & Three.js.</span></footer>
    </div>
  );
}
