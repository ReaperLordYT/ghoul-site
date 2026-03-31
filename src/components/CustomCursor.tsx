import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

export const CustomCursor = () => {
  const enabled = useStore((s) => s.cursorTrailEnabled);
  const [point, setPoint] = useState({ x: -100, y: -100 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const interactive =
      "a,button,input,textarea,select,[role='button'],label,.cursor-active";

    const move = (e: MouseEvent) => {
      setPoint({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement | null;
      setActive(Boolean(target?.closest(interactive)));
      if (!enabled) return;
      const trail = document.createElement("div");
      trail.className = "cursor-trail";
      trail.style.left = `${e.clientX}px`;
      trail.style.top = `${e.clientY}px`;
      document.body.appendChild(trail);
      window.setTimeout(() => trail.remove(), 320);
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [enabled]);

  return (
    <>
      <div
        className={`kaneki-cursor eye-cursor ${active ? "is-active" : ""}`}
        style={{ left: point.x, top: point.y }}
      />
      <style>{`
        .kaneki-cursor.eye-cursor {
          position: fixed;
          width: 26px;
          height: 26px;
          pointer-events: none;
          z-index: 9999;
          clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
          border: 1px solid hsl(var(--primary) / 0.9);
          background: linear-gradient(135deg, hsl(260 60% 18% / 0.65), hsl(var(--primary) / 0.2));
          transform: translate(-50%, -50%);
          transition: width 120ms ease, height 120ms ease, border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease, transform 120ms ease;
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.12), 0 0 14px hsl(var(--primary) / 0.4);
        }
        .kaneki-cursor.eye-cursor::after {
          content: "";
          position: absolute;
          inset: 7px;
          border-radius: 9999px;
          background: radial-gradient(circle, hsl(var(--primary) / 0.95) 0%, hsl(var(--primary) / 0.55) 55%, transparent 100%);
        }
        .kaneki-cursor.eye-cursor.is-active {
          width: 32px;
          height: 32px;
          border-color: hsl(var(--primary));
          background: linear-gradient(135deg, hsl(var(--primary) / 0.35), hsl(var(--primary) / 0.12));
          box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2), 0 0 26px hsl(var(--primary) / 0.62);
          transform: translate(-50%, -50%) scale(1.02);
        }
        .cursor-trail {
          position: fixed;
          width: 9px;
          height: 9px;
          border-radius: 9999px;
          border: 1px solid hsl(var(--primary) / 0.5);
          background: radial-gradient(circle, hsl(var(--primary) / 0.7) 0%, transparent 72%);
          pointer-events: none;
          z-index: 9998;
          animation: trail-fade 0.32s ease-out forwards;
          transform: translate(-50%, -50%);
        }
        @keyframes trail-fade {
          0% { opacity: 0.9; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.1); }
        }
      `}</style>
    </>
  );
};
