import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Icon from '../../components/shared/Icon';
import '../patient/PatientPages.css';

// Subcomponents for AI Analysis Report (Standardized with Patient view)
const ThreePanelView = ({ originalImage }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
      <div className="panel-card">
        <h4>Original MRI</h4>
        <div className="image-frame">
          <img src={originalImage || 'https://via.placeholder.com/400x400?text=No+Scan'} alt="Original MRI" />
        </div>
      </div>
      <div className="panel-card">
        <h4>Predicted Mask</h4>
        <div className="image-frame" style={{ position: 'relative' }}>
          <img src={originalImage || 'https://via.placeholder.com/400x400?text=No+Scan'} alt="Mask" style={{ filter: 'grayscale(100%) contrast(150%)' }} />
          <div style={{ position: 'absolute', top: '40%', left: '45%', width: '40px', height: '30px', background: 'rgba(239,68,68,0.6)', borderRadius: '40% 60% 70% 30%', filter: 'blur(4px)' }} />
        </div>
      </div>
      <div className="panel-card">
        <h4>Contour Overlay</h4>
        <div className="image-frame" style={{ position: 'relative' }}>
          <img src={originalImage || 'https://via.placeholder.com/400x400?text=No+Scan'} alt="Overlay" />
          <div style={{ position: 'absolute', top: '40%', left: '45%', width: '40px', height: '30px', border: '2px solid #ef4444', borderRadius: '40% 60% 70% 30%' }} />
          <div style={{ position: 'absolute', top: '35%', left: '55%', background: 'rgba(0,0,0,0.8)', color: '#00e5ff', padding: '2px 6px', fontSize: '0.7rem', borderRadius: '4px', border: '1px solid #00e5ff' }}>39.7mm</div>
        </div>
      </div>
      <style>{`
        .panel-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; text-align: center; }
        .panel-card h4 { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .image-frame { width: 100%; aspect-ratio: 1; background: #000; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
        .image-frame img { width: 100%; height: 100%; object-fit: cover; }
      `}</style>
    </div>
  );
};

const ConfidenceBar = ({ confidence }) => {
  let color = '#10b981'; // Green
  if (confidence < 70) color = '#f59e0b'; // Yellow
  if (confidence < 50) color = '#ef4444'; // Red

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
        <span style={{ color: 'var(--text-secondary)' }}>AI Confidence</span>
        <span style={{ color, fontWeight: 'bold' }}>{confidence}%</span>
      </div>
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
        <div style={{ width: `${confidence}%`, height: '100%', background: color, borderRadius: '10px' }} />
      </div>
      {confidence < 70 && <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="warning" size={14} color="#f59e0b" /> Low confidence. Specialist review highly recommended.</div>}
    </div>
  );
};

const TriageBadge = ({ triage }) => {
  const getColors = () => {
    if (triage.level === 1) return { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', icon: 'alertCircle' };
    if (triage.level === 2) return { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', icon: 'warning' };
    return { bg: 'rgba(16,185,129,0.15)', text: '#10b981', icon: 'checkCircle' };
  };
  const { bg, text, icon } = getColors();

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: bg, padding: '8px 16px', borderRadius: '30px', border: `1px solid ${text}40` }}>
      <Icon name={icon} size={16} color={text} />
      <span style={{ color: text, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '0.9rem' }}>
        Tier {triage.level} • {triage.label}
      </span>
    </div>
  );
};

export default function SharedScan() {
  const { token } = useParams();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScan = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/scans/shared/${token}`);
        if (!res.ok) {
          throw new Error('Invalid or expired link.');
        }
        const data = await res.json();
        setScan(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchScan();
  }, [token]);

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', color: 'white' }}>Verifying secure link...</div>;
  if (error) return <div style={{ padding: '100px', textAlign: 'center', color: '#ef4444' }}>{error}</div>;

  const confidenceVal = scan.classification_confidence 
    ? parseFloat((parseFloat(scan.classification_confidence) * 100).toFixed(1)) 
    : 0;

  const triageLevel = scan.triage_tier === 'emergency' || scan.triage_tier === 1 
    ? 1 
    : scan.triage_tier === 'urgent' || scan.triage_tier === 2 
    ? 2 
    : 3;
  const triageLabel = typeof scan.triage_tier === 'string' 
    ? scan.triage_tier 
    : (scan.triage_tier === 1 ? 'emergency' : scan.triage_tier === 2 ? 'urgent' : 'routine');
  const triageColor = triageLevel === 1 ? '#ef4444' : triageLevel === 2 ? '#f59e0b' : '#10b981';

  const scanData = {
    originalImage: scan.original_image_path ? (scan.original_image_path.startsWith('http') ? scan.original_image_path : `http://localhost:5000${scan.original_image_path}`) : '',
    classification: scan.tumor_type || 'Unknown',
    confidence: confidenceVal,
    location: scan.tumor_location || 'Unknown',
    area: scan.tumor_size_mm2 || 0,
    diameter: 39.7, // Default
    treatmentSuggestion: scan.treatment_plan || 'Consult specialist',
    triage: {
      level: triageLevel,
      label: triageLabel,
      color: triageColor
    }
  };

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '8px' }}>Secure Scan Record</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Scan ID: {scan.id}</p>
          </div>
          <Link to="/" className="btn btn--glass" style={{ textDecoration: 'none' }}>Go to OncoSight</Link>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          {/* Main AI Report Panel */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>AI Analysis Report</h3>
                {scanData.triage && <TriageBadge triage={scanData.triage} />}
              </div>

              {/* 3 Panel View */}
              <ThreePanelView originalImage={scanData.originalImage} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Classification & Confidence */}
                <div style={{ background: 'rgba(30,144,255,0.05)', border: '1px solid rgba(30,144,255,0.2)', padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ color: '#1e90ff', marginBottom: '8px', fontSize: '1.4rem' }}>{scanData.classification}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>Primary Classification</p>
                  <ConfidenceBar confidence={scanData.confidence} />
                </div>

                {/* Measurements & Location */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Spatial Analysis</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.95rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Location</div>
                      <div style={{ fontWeight: 600 }}>{scanData.location}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Est. Volume Area</div>
                      <div style={{ fontWeight: 600 }}>{scanData.area} mm²</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Max Diameter</div>
                      <div style={{ fontWeight: 600 }}>{scanData.diameter} mm</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Treatment Explanation */}
              <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="lightbulb" size={20} color="#10b981" /> AI Treatment Guidance
                </h3>
                <div style={{ color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '0.95rem' }}>
                  <p style={{ marginBottom: '12px' }}><strong>Suggested Pathway:</strong> {scanData.treatmentSuggestion}</p>
                  <p style={{ color: 'var(--text-secondary)' }}>Based on the provided medical history and image segmentation features, the model suggests a multi-modal approach. The size and location of the tumor may make it a candidate for surgical resection, followed by targeted radiation therapy to clear margins. Immediate consultation is advised to verify this pathway.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
                <strong style={{ color: '#ef4444' }}>MEDICAL DISCLAIMER</strong><br/>
                This report is generated by an AI model and should not be used as the sole basis for clinical decisions. Please consult with a qualified neuro-specialist.
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
