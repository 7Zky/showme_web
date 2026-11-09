import { useEffect, useState } from 'react';

/** Inertia uses native scroll positions, keeping sticky layers and anchors aligned. */
export function useSmoothScroll(enabled: boolean) {
  const [desktop, setDesktop] = useState(() => matchMedia('(min-width: 801px) and (pointer: fine)').matches);
  useEffect(() => {
    const media = matchMedia('(min-width: 801px) and (pointer: fine)');
    const change = () => setDesktop(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!enabled || !desktop) return;
    let frame = 0;
    let current = window.scrollY;
    let target = current;
    let lastWritten = current;
    let lastTime = 0;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      current = target = window.scrollY;
    };
    const tick = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, .05);
      lastTime = time;
      const limit = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      target = Math.min(target, limit);
      current += (target - current) * (1 - Math.exp(-dt / .19));
      const done = Math.abs(target - current) < .35;
      if (done) current = target;
      window.scrollTo({ top: current, behavior: 'instant' });
      lastWritten = window.scrollY;
      frame = done ? 0 : requestAnimationFrame(tick);
    };
    const wheel = (event: WheelEvent) => {
      if (innerWidth <= 800 || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY) || document.body.style.overflow === 'hidden') return;
      if (event.target instanceof Element && event.target.closest('input,textarea,select,[contenteditable="true"],[data-native-scroll]')) return;
      if (!frame) current = target = window.scrollY;
      const unit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? innerHeight : 1;
      const delta = Math.max(-innerHeight * .9, Math.min(innerHeight * .9, event.deltaY * unit));
      const next = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, target + delta));
      if (next === target) return;
      event.preventDefault();
      target = next;
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    const scroll = () => { if (frame && Math.abs(window.scrollY - lastWritten) > 3) stop(); };
    const keydown = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) stop();
    };
    window.addEventListener('wheel', wheel, { passive: false });
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('keydown', keydown);
    window.addEventListener('pointerdown', stop);
    window.addEventListener('touchstart', stop, { passive: true });
    window.addEventListener('hashchange', stop);
    window.addEventListener('resize', stop);
    document.addEventListener('visibilitychange', stop);
    return () => {
      stop();
      window.removeEventListener('wheel', wheel);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('pointerdown', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('hashchange', stop);
      window.removeEventListener('resize', stop);
      document.removeEventListener('visibilitychange', stop);
    };
  }, [enabled, desktop]);
}
