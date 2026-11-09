import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const ReliefScene = lazy(() => import('./components/ReliefScene').then(module => ({ default: module.ReliefScene })));
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { site } from './content/site';
import { SelectedWorks } from './components/SelectedWorks';

export default function App() {
  const [aiMode, setAiMode] = useState(() => location.hash !== '#works');
  const changeMode = (ai: boolean) => {
    setAiMode(ai);
    history.replaceState(null, '', ai ? '#ai' : '#works');
  };
  useEffect(() => {
    const hashChange = () => { if (['#home', '#works', '#ai'].includes(location.hash)) setAiMode(location.hash !== '#works'); };
    window.addEventListener('hashchange', hashChange);
    return () => window.removeEventListener('hashchange', hashChange);
  }, []);
  const [menu, setMenu] = useState(false);
  const [motion, setMotion] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
  useSmoothScroll(motion && !menu);
  const root = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setMotion(!media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!motion) return;
    const context = gsap.context(() => {
      gsap.from('.headline-inner', { yPercent: 110, rotate: 2, duration: 1.3, stagger: .12, ease: 'power3.out' });
      gsap.from('.hero-detail', { opacity: 0, y: 15, duration: 1, delay: .65, stagger: .1 });
      gsap.to('.hero-opening', { autoAlpha: 0, ease: 'none', scrollTrigger: {
        trigger: '.hero', start: 'top top', end: 'top -65%', scrub: .4,
      } });
      gsap.to('.hero-content', { y: -65, opacity: 0, ease: 'none', scrollTrigger: {
        trigger: '.hero', start: 'top top', end: 'top -65%', scrub: .4,
      } });
    }, root);
    return () => context.revert();
  }, [motion]);
  useEffect(() => {
    if (!menu) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const animation = motion ? gsap.context(() => {
      gsap.from('.navigation', { opacity: 0, duration: .35 });
      gsap.from('.navigation > *', { y: 20, opacity: 0, stagger: .055, duration: .55, ease: 'power2.out' });
    }, root) : null;
    const panel = document.getElementById('navigation')!;
    const controls = Array.from(panel.querySelectorAll<HTMLElement>('a,button:not(:disabled)'));
    controls[0]?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setMenu(false); menuButton.current?.focus(); }
      if (e.key === 'Tab') {
        const items = [menuButton.current!, ...controls];
        const i = items.indexOf(document.activeElement as HTMLElement);
        e.preventDefault(); items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length]?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = previousOverflow;
      animation?.revert();
    };
  }, [menu, motion]);
  return <div ref={root} className={`portfolio ${aiMode ? 'is-ai' : 'is-creative'} ${!motion ? 'motion-off' : ''}`}>
    <a href="#main" className="skip-link">跳至主要内容</a>
    <header className="header">
      <a href="#home" className="brand" aria-label="Portfolio 首页"><span className="brand-mark">z</span><span>CREATIVE<br/>INTELLIGENCE</span></a>
      <span className="header-caption">INDEPENDENT PORTFOLIO / 2026</span>
      <button ref={menuButton} className="menu-toggle" aria-expanded={menu} aria-controls="navigation" onClick={() => setMenu(!menu)}>{menu ? 'Close' : 'Explore'}<span>{menu ? '−' : '+'}</span></button>
    </header>
    {menu && <nav id="navigation" aria-label="主导航" className="navigation">
      <div className="nav-label">EXPLORE THE PORTFOLIO</div>
      {site.navigation.map((item, i) => item.available ? <a key={item.target} href={`#${item.target}`} onClick={() => { setMenu(false); setAiMode(item.target !== 'works'); }}><small>0{i + 1}</small>{item.label}<span>↗</span></a> : <div className="nav-pending" key={item.target}><small>0{i + 1}</small>{item.label}<em>即将呈现</em></div>)}
      <p>Creative technology. Human possibilities.</p>
    </nav>}
    <main id="main">
      <section id="home" className="hero" aria-label={site.title.join('. ')}>
        <div className="hero-stage">
        <Suspense fallback={<div className="relief-scene loading" aria-hidden="true"><div className="relief-fallback"/><span className="model-status">LOADING SCULPTURE</span></div>}>
          <ReliefScene motion={motion} dark={!aiMode} />
        </Suspense>
        <div className="hero-wash"/>
        </div>
        <div className="hero-opening">
        <div className="hero-content">
          <p className="eyebrow hero-detail"><span/> AT THE INTERSECTION OF HUMAN & MACHINE</p>
          <h1>{site.title.map((line, i) => <span className={`headline-line line-${i}`} key={line}><span className="headline-inner"><span>{line.split(' ')[0]}</span>{' '}<span className="headline-phrase">{line.split(' ').slice(1).join(' ')}</span></span></span>)}</h1>
          <div className="hero-bottom hero-detail"><p>{site.subtitle}</p><span className="discipline">创意技术 · 交互体验 · AI 产品</span></div>
        </div>
        <div className="scene-caption hero-detail"><span>01 — A STUDY IN RELIEF</span><span>MOVE TO REVEAL / PAUSE TO DISCOVER</span></div>
        <div className="hero-footer hero-detail">
          <a className="scroll-cue" href="#relief-scroll">
            {/* <span>↓</span>  */}
            SCROLL TO DISCOVER</a>
          <span className="page-index">RELIEF JOURNEY <span className="journey-track"><i/></span></span></div>
        </div>
        <div id="relief-scroll" className="journey-anchor" aria-hidden="true"/>
        <SelectedWorks motion={motion} aiMode={aiMode} onModeChange={changeMode} />
      </section>
    </main>
  </div>;
}
