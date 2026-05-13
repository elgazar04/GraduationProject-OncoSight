import { useEffect, useRef } from 'react';
import './BrainVisualization.css';

export default function BrainVisualization() {
  const scanLineRef = useRef(null);

  useEffect(() => {
    let y = 0;
    let dir = 1;
    const animate = () => {
      if (scanLineRef.current) {
        y += dir * 0.5;
        if (y > 100 || y < 0) dir *= -1;
        scanLineRef.current.style.top = `${y}%`;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  return (
    <div className="brain-viz" aria-hidden="true">
      <div className="brain-viz__glow" />
      <svg className="brain-viz__svg" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Brain outline - left hemisphere */}
        <path
          className="brain-viz__path brain-viz__path--left"
          d="M200 60 C140 60 90 90 70 130 C50 170 45 210 55 250 C65 290 95 330 130 350 C155 365 180 370 200 370"
          stroke="url(#brainGrad1)"
          strokeWidth="2"
          fill="none"
        />
        {/* Brain outline - right hemisphere */}
        <path
          className="brain-viz__path brain-viz__path--right"
          d="M200 60 C260 60 310 90 330 130 C350 170 355 210 345 250 C335 290 305 330 270 350 C245 365 220 370 200 370"
          stroke="url(#brainGrad2)"
          strokeWidth="2"
          fill="none"
        />
        {/* Inner folds - left */}
        <path className="brain-viz__fold" d="M200 80 C170 100 130 120 100 160" stroke="rgba(44,187,143,0.3)" strokeWidth="1" fill="none" />
        <path className="brain-viz__fold" d="M200 100 C160 130 120 170 80 200" stroke="rgba(96,165,250,0.25)" strokeWidth="1" fill="none" />
        <path className="brain-viz__fold" d="M200 130 C165 160 130 200 90 240" stroke="rgba(175,169,236,0.2)" strokeWidth="1" fill="none" />
        <path className="brain-viz__fold" d="M200 170 C170 200 140 240 110 280" stroke="rgba(44,187,143,0.2)" strokeWidth="1" fill="none" />
        <path className="brain-viz__fold" d="M200 220 C175 250 150 280 130 320" stroke="rgba(96,165,250,0.15)" strokeWidth="1" fill="none" />
        {/* Inner folds - right */}
        <path className="brain-viz__fold" d="M200 80 C230 100 270 120 300 160" stroke="rgba(96,165,250,0.3)" strokeWidth="1" fill="none" />
        <path className="brain-viz__fold" d="M200 100 C240 130 280 170 320 200" stroke="rgba(175,169,236,0.25)" strokeWidth="1" fill="none" />
        <path className="brain-viz__fold" d="M200 130 C235 160 270 200 310 240" stroke="rgba(44,187,143,0.2)" strokeWidth="1" fill="none" />
        <path className="brain-viz__fold" d="M200 170 C230 200 260 240 290 280" stroke="rgba(96,165,250,0.2)" strokeWidth="1" fill="none" />
        <path className="brain-viz__fold" d="M200 220 C225 250 250 280 270 320" stroke="rgba(175,169,236,0.15)" strokeWidth="1" fill="none" />
        {/* Central line */}
        <line className="brain-viz__center" x1="200" y1="55" x2="200" y2="375" stroke="rgba(44,187,143,0.15)" strokeWidth="1" strokeDasharray="4 6" />
        {/* Tumor marker */}
        <circle className="brain-viz__tumor" cx="155" cy="180" r="22" />
        <circle className="brain-viz__tumor-ring" cx="155" cy="180" r="30" />
        <circle className="brain-viz__tumor-ring brain-viz__tumor-ring--outer" cx="155" cy="180" r="38" />
        {/* Neural activity dots */}
        {[
          [120, 140], [280, 150], [90, 220], [310, 230],
          [140, 300], [260, 310], [170, 110], [230, 120],
          [100, 180], [300, 190], [160, 250], [240, 260],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            className="brain-viz__neuron"
            cx={cx} cy={cy} r="3"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
        {/* Gradients */}
        <defs>
          <linearGradient id="brainGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2cbb8f" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#afa9ec" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="brainGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#afa9ec" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2cbb8f" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
      {/* Scan line */}
      <div className="brain-viz__scan-line" ref={scanLineRef} />
      {/* Data readout */}
      <div className="brain-viz__readout">
        <div className="brain-viz__readout-line">
          <span className="brain-viz__label">TYPE</span>
          <span className="brain-viz__value brain-viz__value--danger">GLIOMA</span>
        </div>
        <div className="brain-viz__readout-line">
          <span className="brain-viz__label">CONF</span>
          <span className="brain-viz__value">87.3%</span>
        </div>
        <div className="brain-viz__readout-line">
          <span className="brain-viz__label">LOC</span>
          <span className="brain-viz__value">FRONTAL-L</span>
        </div>
        <div className="brain-viz__readout-line">
          <span className="brain-viz__label">AREA</span>
          <span className="brain-viz__value">1,240 mm²</span>
        </div>
      </div>
    </div>
  );
}
