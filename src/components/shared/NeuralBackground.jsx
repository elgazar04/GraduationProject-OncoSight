import { useEffect, useRef } from 'react';

export default function NeuralBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let nodes = [];
    let mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const NODE_COUNT = 80;
    const CONNECTION_DIST = 160;
    const MOUSE_DIST = 200;

    class Node {
      constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.01 + Math.random() * 0.02;
      }
      update(w, h) {
        this.x += this.vx;
        this.y += this.vy;
        this.pulsePhase += this.pulseSpeed;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_DIST) {
          const force = (MOUSE_DIST - dist) / MOUSE_DIST * 0.02;
          this.vx += dx * force;
          this.vy += dy * force;
        }

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1.2) {
          this.vx *= 0.98;
          this.vy *= 0.98;
        }
      }
    }

    const init = () => {
      resize();
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push(new Node(w, h));
      }
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i++) {
        nodes[i].update(w, h);
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.2;
            const pulse = (Math.sin(nodes[i].pulsePhase) + 1) * 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const g = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            g.addColorStop(0, `rgba(44, 187, 143, ${alpha * pulse})`);
            g.addColorStop(0.5, `rgba(96, 165, 250, ${alpha * 0.8})`);
            g.addColorStop(1, `rgba(175, 169, 236, ${alpha * pulse})`);
            ctx.strokeStyle = g;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      for (const node of nodes) {
        const pulse = (Math.sin(node.pulsePhase) + 1) * 0.5;
        const r = node.radius * (0.8 + pulse * 0.4);

        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(44, 187, 143, ${0.05 * pulse})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        const mix = pulse;
        const cr = Math.round(44 + (96 - 44) * mix);
        const cg = Math.round(187 + (165 - 187) * mix);
        const cb = Math.round(143 + (250 - 143) * mix);
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.5 + pulse * 0.5})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    init();
    draw();
    window.addEventListener('resize', init);
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', init);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 0,
      }}
    />
  );
}
