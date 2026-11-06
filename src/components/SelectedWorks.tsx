import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AIProducts } from './AIProducts';
import { projects, mediaPath } from '../content/projects';
import type { Project } from '../content/projects';
import './selected-works.css';

gsap.registerPlugin(ScrollTrigger);

function WorkPreview({ project, index, active, onToggle, onStop }: {
  project: Project; index: number; active: boolean;
  onToggle: () => void; onStop: () => void;
}) {
  const article = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pageVisible, setPageVisible] = useState(!document.hidden);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .1 });
    observer.observe(article.current!);
    const visibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => { if (active && !visible) onStop(); }, [active, visible, onStop]);
  useEffect(() => { if (visible || active) setLoaded(true); }, [visible, active]);
  useEffect(() => {
    const player = video.current;
    if (!player || !loaded) return;
    let current = true;
    setPlaying(false);
    if (visible && pageVisible) {
      player.play().then(() => { if (current) setPlaying(true); }).catch(() => { if (current) setPlaying(false); });
    } else { player.pause(); setPlaying(false); }
    return () => { current = false; player.pause(); };
  }, [active, visible, pageVisible, loaded]);
  const reset = () => {
    onStop(); setPlaying(false);
    if (video.current) {
      video.current.currentTime = 0;
      if (!active && visible && pageVisible) {
        video.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    }
  };
  return <article ref={article} className={`work work-${project.layout}`} style={{ '--media-ratio': project.aspect, '--media-color': project.color } as CSSProperties}>
    <div className={`work-media ${playing ? 'is-playing' : ''}`}>
      <div className="work-visual">
        <img src={mediaPath(project, 'poster.jpg')} alt={`${project.name}项目画面`} loading="lazy" decoding="async"/>
        {loaded && <video ref={video} src={mediaPath(project, active ? 'film.mp4' : 'preview.mp4')} poster={mediaPath(project, 'poster.jpg')} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1}/>}
      </div>
      <span className="work-duration">{project.duration}</span>
      <div className="work-controls">
      <button type="button" className="preview-toggle" aria-label={`${active ? '暂停' : '播放'}${project.name}静音预览`} aria-pressed={active}
        onClick={onToggle}><span>{active ? 'Ⅱ' : '▷'}</span>{active ? '暂停预览' : '静音预览'}</button>
      <button type="button" className="reset-preview" aria-label={`重置${project.name}播放至开头`} onClick={reset}><span>↺</span>重置</button>
      </div>
    </div>
    <div className="work-caption"><span className="work-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{project.name}</h3><p>{project.scene}</p></div><span className="work-category">{project.category}</span></div>
    <p className="work-statement">{project.description}</p>
  </article>;
}

export function SelectedWorks({ motion, aiMode, onModeChange }: { motion: boolean; aiMode: boolean; onModeChange: (ai: boolean) => void }) {
  const section = useRef<HTMLElement>(null);
  const [viewAI, setViewAI] = useState(aiMode);
  const [switching, setSwitching] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    if (!['#works', '#ai'].includes(location.hash)) return;
    const frame = requestAnimationFrame(() => section.current?.scrollIntoView({ behavior: 'instant', block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    if (viewAI === aiMode) { setSwitching(false); return; }
    setSwitching(true);
    setActiveId(null);
    section.current?.querySelectorAll('video').forEach(video => video.pause());
    if (location.hash !== '#home') section.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    if (!motion) { setViewAI(aiMode); return; }
    const context = gsap.context(() => {
      const targets = viewAI ? '.ai-case > *' : '.work';
      gsap.to(targets, { opacity: 0, y: -24, filter: 'blur(5px)', duration: .5, stagger: .065,
        ease: 'power2.inOut', onComplete: () => setViewAI(aiMode) });
    }, section);
    return () => context.revert();
  }, [aiMode, viewAI, motion]);
  useEffect(() => {
    const refresh = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (location.hash === '#home') window.scrollTo({ top: 0, behavior: 'instant' });
    });
    if (!motion || viewAI !== aiMode) return () => cancelAnimationFrame(refresh);
    const context = gsap.context(() => {
      gsap.from('.works-heading .heading-content', { y: 18, opacity: 0, duration: .7 });
      if (viewAI) {
        gsap.utils.toArray<HTMLElement>('.ai-reveal').forEach(item => {
          gsap.from(item, { y: 30, opacity: 0, duration: .85, ease: 'power2.out',
            scrollTrigger: { trigger: item, start: 'top 94%', once: true } });
        });
      } else {
        gsap.utils.toArray<HTMLElement>('.work').forEach(work => {
          gsap.from(work, { y: 55, opacity: 0, duration: 1, ease: 'power2.out',
            scrollTrigger: { trigger: work, start: 'top 94%', once: true } });
          if (matchMedia('(min-width: 801px)').matches) {
            gsap.fromTo(work.querySelector('.work-media'), { yPercent: 4 }, { yPercent: -4, ease: 'none',
              scrollTrigger: { trigger: work, start: 'top bottom', end: 'bottom top', scrub: .8 } });
            gsap.fromTo(work.querySelector('.work-statement'), { y: 18 }, { y: -18, ease: 'none',
              scrollTrigger: { trigger: work, start: 'top bottom', end: 'bottom top', scrub: 1.1 } });
          }
        });
      }
    }, section);
    return () => { cancelAnimationFrame(refresh); context.revert(); };
  }, [motion, viewAI, aiMode]);
  return <section id="works" className="selected-works" ref={section} aria-labelledby="works-title" aria-busy={switching}>
    <span id="ai" className="ai-anchor" aria-hidden="true"/>
    <div className="works-heading">
      <div className="works-kicker"><span>02 / SELECTED WORKS</span><span>{viewAI ? '02 CASES' : '07 PROJECTS'}</span></div>
      <div className="works-switch" role="tablist" aria-label="作品类别" onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) && !switching) { event.preventDefault(); const ai = event.key === 'End' || (event.key !== 'Home' && !viewAI); onModeChange(ai); document.getElementById(ai ? 'ai-tab' : 'creative-tab')?.focus(); } }}>
        <button id="creative-tab" role="tab" aria-selected={!viewAI} aria-controls="creative-panel" aria-disabled={switching} onClick={() => { if (!switching) onModeChange(false); }}>交互项目</button>
        <button id="ai-tab" role="tab" aria-selected={viewAI} aria-controls="ai-panel" aria-disabled={switching} onClick={() => { if (!switching) onModeChange(true); }}>AI 产品 <span aria-hidden="true">↗</span></button>
      </div>
      <div className="heading-content" key={viewAI ? 'ai' : 'creative'}>
        <h2 id="works-title">{viewAI ? <>AI<br/><span>Products</span><sup>(02)</sup></> : <>Selected<br/><span>Works</span><sup>(07)</sup></>}</h2>
        <div className="works-intro">{viewAI ? <><p>让智能，走进<br/>真实的使用情境。</p><div><p>从知识问答，到情感共创。<br/>连接用户需求、交互与技术实现。</p><p>一个可运行的 RAG 应用，<br/>与一份 AI 礼品产品设计实践。</p></div></> : <><p>把技术，变成<br/>可感知的体验。</p><div><p>空间交互、数字展陈与数据可视化。<br/>让创意在真实场景中落地。</p><p>担任项目主负责人，负责开发制作，<br/>并在部分项目中参与需求制定与方案确认。</p></div></>}</div>
      </div>
    </div>
    <span className="mode-announcement" role="status">{switching ? '正在切换作品类别' : viewAI ? '已显示 AI 产品案例' : '已显示交互项目'}</span>
    {viewAI ? <AIProducts/> : <div id="creative-panel" role="tabpanel" aria-labelledby="creative-tab" className="works-grid">{projects.map((project, index) => <WorkPreview key={project.id} project={project} index={index}
      active={activeId === project.id} onToggle={() => setActiveId(activeId === project.id ? null : project.id)}
      onStop={() => setActiveId(current => current === project.id ? null : current)}/>)}</div>}
    <div className="works-end"><span>{viewAI ? 'AI APPLICATIONS / PRODUCT THINKING' : 'CREATIVE TECHNOLOGY / SELECTED ARCHIVE'}</span><a href="#home">回到顶部 <span>↑</span></a></div>
  </section>;
}
