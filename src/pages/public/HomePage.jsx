import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Brain3D from '../../components/shared/Brain3D';
import Icon from '../../components/shared/Icon';
import './HomePage.css';

/* ──────── Typewriter ──────── */
function TypeWriter({ words, className }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[idx];
    const speed = deleting ? 35 : 70;
    const timer = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, text.length + 1));
        if (text.length + 1 === word.length) setTimeout(() => setDeleting(true), 2200);
      } else {
        setText(word.slice(0, text.length - 1));
        if (text.length === 0) { setDeleting(false); setIdx((idx + 1) % words.length); }
      }
    }, speed);
    return () => clearTimeout(timer);
  }, [text, deleting, idx, words]);
  return <span className={className}>{text}<span className="tw-cursor">|</span></span>;
}

/* ──────── Scroll Observer ──────── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('revealed'); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}
function Reveal({ children, className = '', delay = 0, direction = 'up' }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`rvl rvl--${direction} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/* ──────── Magnetic Button ──────── */
function MagneticBtn({ children, className = '', ...props }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    ref.current.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  };
  const handleLeave = () => { ref.current.style.transform = ''; };
  return <div ref={ref} className={`mag-wrap ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave} {...props}>{children}</div>;
}

/* ──────── Interactive Word ──────── */
function WordWave({ text, className = '' }) {
  return (
    <span className={`word-wave ${className}`}>
      {text.split('').map((ch, i) => (
        <span key={i} className="word-wave__ch" style={{ animationDelay: `${i * 0.04}s` }}>
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

/* ──────── Data ──────── */
const FEATURES = [
  { icon: 'microscope', title: 'Tumor Classification', desc: 'CNN identifies glioma, meningioma, or pituitary tumors with real-time confidence scores.', color: '#0fa37a' },
  { icon: 'target', title: 'Precise Segmentation', desc: 'U-Net draws exact tumor boundaries and calculates area (mm²), diameter, and contour.', color: '#3b82f6' },
  { icon: 'mapPin', title: 'Location Mapping', desc: 'Maps tumor to brain region (Frontal, Temporal, etc.) with hemisphere identification.', color: '#8b5cf6' },
  { icon: 'pill', title: 'Treatment Plans', desc: 'ML model predicts treatment plan and urgency from MRI features + patient history.', color: '#f97316' },
  { icon: 'zap', title: '3-Tier Triage', desc: 'Auto-routes patients to Emergency, Urgent, or Routine care based on AI analysis.', color: '#ef4444' },
  { icon: 'clipboard', title: 'PDF Reports', desc: 'Downloadable reports with visuals and measurements — share directly with your doctor.', color: '#14b8a6' },
];

const STEPS = [
  { num: '01', title: 'Register & Intake', desc: 'Create your account and complete the medical history intake wizard with symptoms.', icon: 'edit' },
  { num: '02', title: 'Upload MRI Scan', desc: 'Drag & drop your MRI scan image. We validate and prepare it for analysis.', icon: 'upload' },
  { num: '03', title: 'AI Deep Analysis', desc: 'Our ensemble of deep learning models classify, segment, and localize in seconds.', icon: 'brain' },
  { num: '04', title: 'Results & Action', desc: 'View comprehensive results, treatment suggestions, and connect with specialized doctors.', icon: 'checkCircle' },
];

export default function HomePage() {
  const { lang, t } = useLanguage();

  return (
    <main className="home" id="home-page">

      {/* ═══════════════ HERO — Full-screen 3D Brain ═══════════════ */}
      <section className="hero-immersive" id="hero-section">
        {/* Monumental background text */}
        <div className="hero-immersive__bg-text" aria-hidden="true">
          <span>ONCOSIGHT</span>
        </div>

        {/* Scan-line overlay */}
        <div className="hero-immersive__scanlines" aria-hidden="true" />

        {/* Corner decorations */}
        <div className="hero-immersive__corner hero-immersive__corner--tl" />
        <div className="hero-immersive__corner hero-immersive__corner--tr" />
        <div className="hero-immersive__corner hero-immersive__corner--bl" />
        <div className="hero-immersive__corner hero-immersive__corner--br" />

        {/* 3D Brain — fills the entire hero */}
        <div className="hero-immersive__brain">
          <Brain3D />
        </div>

        {/* Top-left badge */}
        <div className="hero-immersive__badge">
          <span className="hero-immersive__badge-pulse" />
          {lang === 'ar' ? 'تشخيصات الأعصاب بالذكاء الاصطناعي' : 'AI-Powered Neuro Diagnostics'}
        </div>

        {/* Bottom text overlay */}
        <div className="hero-immersive__bottom">
          <div className="hero-immersive__headline">
            <h1 className="hero-immersive__title">
              <span className="hero-immersive__title-main">{lang === 'ar' ? 'كشف أورام الدماغ' : 'Detect Brain Tumors'}</span>
              <span className="hero-immersive__title-sub">
                {lang === 'ar' ? 'بأقصى درجات ' : 'with '}
                <TypeWriter
                  words={lang === 'ar' ? ['الدقة', 'الثقة', 'الذكاء', 'السرعة'] : ['Precision', 'Confidence', 'Intelligence', 'Speed']}
                  className="hero-immersive__tw"
                />
              </span>
            </h1>
            <p className="hero-immersive__desc">
              {lang === 'ar' 
                ? 'قم برفع صور الرنين المغناطيسي للدماغ للحصول على تراكيب التجزئة الفورية ومقاييس التحليل السريري المتقدمة.'
                : 'Upload an MRI scan and receive instant AI classification, precise segmentation, and personalized treatment plans.'}
            </p>
          </div>
          <div className="hero-immersive__ctas">
            <MagneticBtn>
              <Link to="/patient/intake" className="btn btn--glow" id="hero-cta">
                <span>{lang === 'ar' ? 'ابدأ التحليل' : 'Start Analysis'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none', margin: '0 4px' }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </MagneticBtn>
            <MagneticBtn>
              <Link to="/info/tumors" className="btn btn--glass" id="hero-learn">
                {lang === 'ar' ? 'استكشف الميزات' : 'Explore Features'}
              </Link>
            </MagneticBtn>
          </div>
        </div>

        {/* Side stats */}
        <div className="hero-immersive__side-stats">
          {['97% Accuracy', '<10s Analysis', '3 Tumor Types'].map((s, i) => (
            <span key={i} className="hero-immersive__stat">{s}</span>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="hero-immersive__scroll">
          <div className="hero-immersive__scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="stats" id="stats-section">
        <div className="stats__inner container">
          {[
            { val: '3', label: 'Tumor Types', icon: 'dna', suffix: '' },
            { val: '97', label: 'Accuracy', icon: 'target', suffix: '%' },
            { val: '<10', label: 'Analysis Time', icon: 'zap', suffix: 's' },
            { val: '24/7', label: 'Availability', icon: 'globe', suffix: '' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="stat-card" data-cursor="hover">
                <span className="stat-card__icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={s.icon} size={24} color="#00ffb2" />
                </span>
                <span className="stat-card__val">{s.val}<span className="stat-card__suffix">{s.suffix}</span></span>
                <span className="stat-card__label">{s.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="features" id="features-section">
        <div className="features__inner container">
          <Reveal className="features__header">
            <span className="pill">Core Capabilities</span>
            <h2 className="sec-title">
              Six AI Models,{' '}
              <WordWave text="One Diagnosis" className="sec-accent" />
            </h2>
            <p className="sec-desc">Our platform chains state-of-the-art deep learning models to deliver comprehensive brain tumor analysis from a single MRI scan.</p>
          </Reveal>
          <div className="features__grid">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="feat" data-cursor="hover">
                  <div className="feat__glow" style={{ background: f.color }} />
                  <div className="feat__icon" style={{ background: `${f.color}18`, color: f.color, borderColor: `${f.color}30`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={f.icon} size={22} color={f.color} />
                  </div>
                  <h3 className="feat__title">{f.title}</h3>
                  <p className="feat__desc">{f.desc}</p>
                  <span className="feat__cta" style={{ color: f.color }}>Learn more →</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW ═══════════════ */}
      <section className="how" id="how-section">
        <div className="how__inner container">
          <Reveal className="how__header">
            <span className="pill pill--warm">Workflow</span>
            <h2 className="sec-title">From Upload to Results <span className="sec-accent-line">in 4 Steps</span></h2>
          </Reveal>
          <div className="how__grid">
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="step" data-cursor="hover">
                  <div className="step__num" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={s.icon} size={24} color="#00ffb2" />
                  </div>
                  <span className="step__tag">Step {s.num}</span>
                  <h3 className="step__title">{s.title}</h3>
                  <p className="step__desc">{s.desc}</p>
                  <div className="step__bar"><div className="step__bar-fill" style={{ animationDelay: `${i * 0.5}s` }} /></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="cta" id="cta-section">
        <div className="cta__inner container">
          <Reveal>
            <div className="cta__card">
              <div className="cta__bg-grid" />
              {Array.from({ length: 15 }, (_, i) => (
                <span key={i} className="cta__spark" style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }} />
              ))}
              <h2 className="cta__title">Ready to See What AI Can Reveal?</h2>
              <p className="cta__desc">Create your free account and get AI-powered brain tumor analysis in seconds.</p>
              <MagneticBtn>
                <Link to="/patient/intake" className="cta__btn" id="cta-register">
                  Get Started Free
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </MagneticBtn>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
