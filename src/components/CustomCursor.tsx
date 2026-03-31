import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export const CustomCursor = () => {
  const enabled = useStore((s) => s.cursorTrailEnabled);

  useEffect(() => {
    if (!enabled) return;
    const move = (e: MouseEvent) => {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.left = `${e.clientX}px`;
      trail.style.top = `${e.clientY}px`;
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 500);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [enabled]);

  return (
    <style>{`
      .cursor-trail {
        position: fixed;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 1px solid hsl(0 85% 45% / 0.8);
        background: radial-gradient(circle, hsl(0 95% 55% / 0.85) 0%, hsl(0 90% 35% / 0.4) 45%, transparent 70%);
        pointer-events: none;
        z-index: 9998;
        animation: trail-fade 0.5s ease-out forwards;
        box-shadow: 0 0 8px hsl(0 95% 55% / 0.55), inset 0 0 5px hsl(0 0% 100% / 0.25);
        transform: translate(-50%, -50%);
      }
      @keyframes trail-fade {
        0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.2); }
      }
    `}</style>
  );
};
