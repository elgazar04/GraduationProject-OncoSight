import { useEffect, useRef, useState } from 'react';

export default function CursorFollower() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRefs = useRef([]);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    // Don't show on touch devices
    if ('ontouchstart' in window) return;

    const move = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const handleOver = (e) => {
      const el = e.target.closest('a, button, [data-cursor="hover"], input, textarea, select, .tilt-card');
      setHovering(!!el);
    };

    const hide = () => setVisible(false);
    const show = () => setVisible(true);

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseleave', hide);
    document.addEventListener('mouseenter', show);

    let rafId;
    const animate = () => {
      const lerp = 0.15;
      pos.current.x += (target.current.x - pos.current.x) * lerp;
      pos.current.y += (target.current.y - pos.current.y) * lerp;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        const ringLerp = 0.08;
        const rx = parseFloat(ringRef.current.dataset.x || pos.current.x);
        const ry = parseFloat(ringRef.current.dataset.y || pos.current.y);
        const nx = rx + (target.current.x - rx) * ringLerp;
        const ny = ry + (target.current.y - ry) * ringLerp;
        ringRef.current.dataset.x = nx;
        ringRef.current.dataset.y = ny;
        ringRef.current.style.transform = `translate(${nx}px, ${ny}px) translate(-50%, -50%)`;
      }

      // Trailing dots
      let prev = { x: pos.current.x, y: pos.current.y };
      trailRefs.current.forEach((trail, i) => {
        if (!trail) return;
        const tx = parseFloat(trail.dataset.x || prev.x);
        const ty = parseFloat(trail.dataset.y || prev.y);
        const speed = 0.2 - i * 0.03;
        const nx = tx + (prev.x - tx) * speed;
        const ny = ty + (prev.y - ty) * speed;
        trail.dataset.x = nx;
        trail.dataset.y = ny;
        trail.style.transform = `translate(${nx}px, ${ny}px) translate(-50%, -50%)`;
        prev = { x: nx, y: ny };
      });

      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseleave', hide);
      document.removeEventListener('mouseenter', show);
    };
  }, [visible]);

  if (!visible && typeof window !== 'undefined' && 'ontouchstart' in window) return null;

  return (
    <>
      <style>{`
        .cursor-dot {
          position: fixed;
          top: 0; left: 0;
          width: 8px; height: 8px;
          background: linear-gradient(135deg, #0fa37a, #60a5fa);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transition: width 0.3s, height 0.3s, opacity 0.3s;
          mix-blend-mode: normal;
        }
        .cursor-dot--hover {
          width: 6px; height: 6px;
          opacity: 0.6;
        }
        .cursor-ring {
          position: fixed;
          top: 0; left: 0;
          width: 40px; height: 40px;
          border: 1.5px solid rgba(15, 163, 122, 0.35);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9998;
          transition: width 0.35s cubic-bezier(0.16,1,0.3,1),
                      height 0.35s cubic-bezier(0.16,1,0.3,1),
                      border-color 0.3s,
                      background 0.3s;
        }
        .cursor-ring--hover {
          width: 56px; height: 56px;
          border-color: rgba(15, 163, 122, 0.5);
          background: rgba(15, 163, 122, 0.06);
        }
        .cursor-trail {
          position: fixed;
          top: 0; left: 0;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9997;
        }
        @media (max-width: 768px) {
          .cursor-dot, .cursor-ring, .cursor-trail { display: none !important; }
        }
      `}</style>
      {/* Trailing dots */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          ref={el => trailRefs.current[i] = el}
          className="cursor-trail"
          style={{
            width: `${4 - i * 0.5}px`,
            height: `${4 - i * 0.5}px`,
            background: `rgba(15, 163, 122, ${0.3 - i * 0.05})`,
            opacity: visible ? 1 : 0,
          }}
        />
      ))}
      <div
        ref={dotRef}
        className={`cursor-dot ${hovering ? 'cursor-dot--hover' : ''}`}
        style={{ opacity: visible ? 1 : 0 }}
      />
      <div
        ref={ringRef}
        className={`cursor-ring ${hovering ? 'cursor-ring--hover' : ''}`}
        style={{ opacity: visible ? 1 : 0 }}
      />
    </>
  );
}
