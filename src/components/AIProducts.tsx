import { useEffect, useRef, useState } from 'react';
import { giftAnalysis, giftExperience, giftJourney, giftMarket, ragFlow } from '../content/ai';
import './ai-products.css';

export function AIProducts() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const demo = useRef<HTMLDivElement>(null);
  const current = giftJourney[step];
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) video.current?.pause();
    }, { threshold: .1 });
    if (demo.current) observer.observe(demo.current);
    const hide = () => { if (document.hidden) video.current?.pause(); };
    document.addEventListener('visibilitychange', hide);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', hide); };
  }, []);
  useEffect(() => {
    if (loaded) video.current?.play().catch(() => setPlaying(false));
  }, [loaded]);
  const toggle = () => {
    if (!loaded) { setLoaded(true); return; }
    if (video.current?.paused) video.current.play().catch(() => setPlaying(false));
    else video.current?.pause();
  };
  return <div className="ai-products" id="ai-panel" role="tabpanel" aria-labelledby="ai-tab">
    <article className="ai-case gift-case" id="ai-gift" aria-labelledby="gift-title">
      <div className="gift-opening ai-reveal">
        <div className="gift-opening-copy"><p className="ai-eyebrow">01 / FEATURED PRODUCT CASE</p><p className="gift-featured-label">产品主案例 / 情感共创 × 实体礼品</p><h3 id="gift-title">AI 礼品<br/><em>向导。</em></h3><p className="gift-tagline">让心意，有一个声音。</p><span className="gift-role">我的职责 / 产品 · UI · 部分开发</span></div>
        <div className="gift-moment" aria-label="黄金三十秒：情感内容的设计目标"><div className="moment-orbit"/><span>30<sup>″</sup></span><p>A MOMENT, MEANT FOR YOU</p><small>情感内容的设计目标</small></div>
        <div className="gift-opening-footer"><span>场景定位 → 需求拆解 → 交互设计 → 交付流程</span><span aria-hidden="true">↘</span></div>
      </div>
      <div className="gift-context ai-reveal"><p className="ai-lead-copy">从“不知道怎么表达”，<br/>到一份亲手参与的心意。</p><div><p>面向情侣、夫妻与亲友等亲密关系，AI 礼品向导以小程序作为创作入口，将碎片化回忆整理为个性化情感内容，再由实体礼品承载声音。</p><p>从送礼人的表达困难出发，围绕告白、思念、离别和日常陪伴，拆解创作、确认、编辑与设备交付的需求，让情感表达形成完整的产品流程。</p></div></div>
      <section className="gift-market ai-reveal" aria-labelledby="gift-market-title">
        <div className="gift-section-heading"><p className="ai-small-label">MARKET ANALYSIS / POSITIONING</p><h4 id="gift-market-title">在现有送礼方式之间，<br/>找到情感共创的位置。</h4><p>从用户可选择的替代方案出发，分析表达成本、个性化程度与实体承载，形成产品定位判断。</p></div>
        <div className="gift-market-table" role="table" aria-label="送礼替代方案与产品机会分析">
          <div className="gift-market-row gift-market-head" role="row"><span role="columnheader">替代选择</span><span role="columnheader">满足的需求</span><span role="columnheader">本产品的切入机会</span></div>
          {giftMarket.map(item => <div className="gift-market-row" role="row" key={item.option}><h5 role="rowheader">{item.option}</h5><p role="cell">{item.value}</p><p role="cell">{item.opportunity}</p></div>)}
        </div>
        <div className="gift-market-position"><span>定位判断</span><p>以亲密关系为切入点，将 AI 的内容共创能力与实体礼品结合，让用户参与表达，再把共同回忆转化为可以听见的心意。</p></div>
        <div className="gift-market-validation"><span>下一步验证</span><p>围绕告白、思念、离别和日常陪伴，验证用户是否愿意提供回忆、能否顺利完成共创，以及实体承载是否增加礼物的情感价值。</p></div>
      </section>
      <section className="gift-analysis ai-reveal" aria-labelledby="gift-analysis-title">
        <div className="gift-section-heading"><p className="ai-small-label">MARKET / NEEDS / PEOPLE</p><h4 id="gift-analysis-title">先理解为什么送，<br/>再设计如何表达。</h4></div>
        <div className="gift-analysis-grid">{giftAnalysis.map(item => <div className="gift-analysis-item" key={item.title}><span>{item.label}</span><h5>{item.title}</h5><p>{item.text}</p><div className="gift-analysis-choice"><span>产品选择</span><p>{item.choice}</p></div></div>)}</div>
      </section>
      <div className="gift-journey ai-reveal"><div className="journey-intro"><p className="ai-small-label">A JOURNEY OF CO-CREATION</p><h4>六个步骤，<br/>把表达交还给用户。</h4><p>点击步骤，查看交互逻辑与设计取舍。</p></div><div className="journey-steps" role="tablist" aria-label="AI 礼品用户旅程" aria-orientation="vertical">{giftJourney.map((item,i)=><button role="tab" id={`gift-step-${i}`} aria-selected={step===i} aria-controls="gift-step-panel" key={item.title} tabIndex={step===i?0:-1} onClick={()=>setStep(i)} onKeyDown={event=>{if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?giftJourney.length-1:(i+(event.key==='ArrowDown'?1:-1)+giftJourney.length)%giftJourney.length;setStep(next);document.getElementById(`gift-step-${next}`)?.focus();}}}><span>0{i+1}</span><div>{item.title}<small>{item.short}</small></div><b aria-hidden="true">↗</b></button>)}</div><div id="gift-step-panel" className="journey-detail" role="tabpanel" aria-labelledby={`gift-step-${step}`} tabIndex={0}><div className="journey-detail-content" key={step}><span className="journey-detail-label">{current.label}</span><h5>{current.heading}</h5><p>{current.text}</p><div className="journey-input">{current.input}</div><div className="journey-decision"><span>设计取舍 / {current.decision}</span><p>{current.reason}</p></div></div></div></div>
      <div className="gift-principles ai-reveal"><p className="ai-small-label">FROM CONVERSATION TO DELIVERY</p><div><h4>两类智能体，分工收束</h4><p>需求搜集负责理解条件和多轮修改；总结展示负责提炼方案。在资料完整、用户确认后，进入内容设定。</p></div><div><h4>把交付异常放进流程</h4><p>生成次数不足、网络中断、未绑定与设备离线，都在 PRD 中定义了提示与恢复路径。</p></div><div><h4>先做好核心闭环</h4><p>以向导、信息卡、共创、编辑与设备下发为核心；声音个性化等能力作为后续规划。</p></div></div>
      <section className="gift-experience ai-reveal" aria-labelledby="gift-experience-title">
        <div className="gift-section-heading"><p className="ai-small-label">PROJECT EXPERIENCE / PRODUCT · UI · DEVELOPMENT</p><h4 id="gift-experience-title">把需求、沟通与执行，<br/>接成一条交付路径。</h4><p>在产品、UI 与部分开发的职责中，围绕同一条用户路径衔接方案与实现。</p></div>
        <ol className="gift-experience-list">{giftExperience.map((item, i) => <li key={item.title}><span className="ai-step-index">0{i + 1}</span><div><h5>{item.title}</h5><p>{item.text}</p></div><span className="gift-experience-output">{item.output}</span></li>)}</ol>
      </section>
    </article>
    <article className="ai-case rag-case" aria-labelledby="rag-title">
      <div className="rag-opening">
        <div className="ai-case-lead ai-reveal"><p className="ai-eyebrow">02 / RAG APPLICATION</p><h3 id="rag-title">先找到依据，<br/><em>再给出建议。</em></h3><p className="ai-lead-copy">把分散的制度资料，<br/>变成可以追问、可以核对的依据。</p></div>
      <div className="rag-demo ai-reveal" ref={demo}>
        <div className="ai-media-top"><span><i/> LOCAL INTELLIGENCE</span><span>DEMO / 01:35</span></div>
        <div className="rag-screen">
          {loaded ? <video ref={video} poster={`${import.meta.env.BASE_URL}media/ai/rag/poster.jpg`} muted playsInline controls preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} aria-label="财务知据 RAG 应用演示"><source src={`${import.meta.env.BASE_URL}media/ai/rag/demo-mobile.mp4`} media="(max-width: 800px)" type="video/mp4"/><source src={`${import.meta.env.BASE_URL}media/ai/rag/demo.mp4`} type="video/mp4"/></video> : <img src={`${import.meta.env.BASE_URL}media/ai/rag/poster.jpg`} alt="财务知据业务问答界面：先找到依据，再给出建议"/>}
          {!playing && <button className="rag-play" onClick={toggle} aria-label="播放 RAG 案例视频"><span>▷</span>播放 Demo</button>}
        </div>
        <div className="ai-media-caption"><span>财务知据</span><span>RAG / 本地知识问答</span></div>
      </div>
      </div>
        <div className="ai-case-copy rag-context ai-reveal"><p className="ai-small-label">PROBLEM & CONTEXT</p><p>财务经办与审核人员需要从制度中查找操作依据。直接得到一个答案还不够，还需要知道它引用了什么、来自哪个版本，以及哪些问题超出了资料范围。</p><p>“财务知据”将业务问答、知识库管理与效果评测放在同一工作空间，让检索、生成和核对形成连贯的流程。</p><div className="ai-scope"><span>案例范围</span><p>Demo 使用公开资料摘要；企业付款场景为虚构演示，回答不替代审批。</p></div></div>
      <ol className="rag-flow ai-reveal" aria-label="RAG 应用交互流程">{ragFlow.map((item,i)=><li key={item.title}><span className="ai-step-index">0{i+1}</span><h4>{item.title}</h4><p>{item.text}</p><span className="flow-arrow" aria-hidden="true">↗</span></li>)}</ol>
      <div className="rag-decisions ai-reveal"><p className="ai-small-label">DESIGN IN THE DETAILS</p><div><h4>依据先于结论</h4><p>将检索片段、来源与版本展示在回答之前，便于回到原文核对。</p></div><div><h4>效果可以复查</h4><p>保存本地检索实验、参数与问题记录，对比不同检索方案，追踪未完整召回的问题。</p></div><div><h4>边界明确可见</h4><p>区分公开参考资料与企业场景，给缺少制度、结果不相关、版本问题留下反馈入口。</p></div></div>

    </article>
  </div>;
}
