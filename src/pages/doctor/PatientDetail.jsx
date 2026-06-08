import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ChatWindow from '../../components/shared/ChatWindow';
import FloatingChat from '../../components/shared/FloatingChat';
import Icon from '../../components/shared/Icon';
import '../patient/PatientPages.css';

// Subcomponents for AI Analysis Report (Standardized with Patient view)
const ThreePanelView = ({ originalImage, segmentationMask }) => {
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
          {segmentationMask ? (
            <img src={segmentationMask} alt="Predicted Mask" />
          ) : (
            <>
              <img src={originalImage || 'https://via.placeholder.com/400x400?text=No+Scan'} alt="Mask" style={{ filter: 'grayscale(100%) contrast(150%)' }} />
              <div style={{ position: 'absolute', top: '40%', left: '45%', width: '40px', height: '30px', background: 'rgba(239,68,68,0.6)', borderRadius: '40% 60% 70% 30%', filter: 'blur(4px)' }} />
            </>
          )}
        </div>
      </div>
      <div className="panel-card">
        <h4>Contour Overlay</h4>
        <div className="image-frame" style={{ position: 'relative' }}>
          {segmentationMask ? (
            <img src={segmentationMask} alt="Contour Overlay" />
          ) : (
            <>
              <img src={originalImage || 'https://via.placeholder.com/400x400?text=No+Scan'} alt="Overlay" />
              <div style={{ position: 'absolute', top: '40%', left: '45%', width: '40px', height: '30px', border: '2px solid #ef4444', borderRadius: '40% 60% 70% 30%' }} />
            </>
          )}
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

export default function PatientDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [override, setOverride] = useState('');
  const [notes, setNotes] = useState('');
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/consultations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setConsultation(data);
          if (data.ai_agreement) {
            setOverride(data.ai_agreement);
            setNotes(data.clinical_notes || '');
          }
        }
      } catch (err) {
        console.error('Error fetching consultation', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultation();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/consultations/${id}/notes`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          clinical_notes: notes,
          ai_agreement: override,
          status: 'completed'
        })
      });
      if (res.ok) {
        alert('Clinical notes saved and consultation marked as completed.');
        navigate('/doctor/dashboard');
      } else {
        alert('Error saving notes.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', color: 'white' }}>Loading consultation data...</div>;
  if (!consultation) return <div style={{ padding: '100px', textAlign: 'center', color: 'white' }}>Consultation not found.</div>;

  const confidenceVal = consultation.classification_confidence 
    ? parseFloat((parseFloat(consultation.classification_confidence) * 100).toFixed(1)) 
    : 0;

  const triageLevel = consultation.triage_tier === 'emergency' || consultation.triage_tier === 1 
    ? 1 
    : consultation.triage_tier === 'urgent' || consultation.triage_tier === 2 
    ? 2 
    : 3;
  const triageLabel = typeof consultation.triage_tier === 'string' 
    ? consultation.triage_tier 
    : (consultation.triage_tier === 1 ? 'emergency' : consultation.triage_tier === 2 ? 'urgent' : 'routine');
  const triageColor = triageLevel === 1 ? '#ef4444' : triageLevel === 2 ? '#f59e0b' : '#10b981';

  const scanData = {
    originalImage: consultation.original_image_path ? (consultation.original_image_path.startsWith('http') ? consultation.original_image_path : `http://localhost:5000${consultation.original_image_path}`) : '',
    segmentationMask: consultation.segmentation_mask_path ? (consultation.segmentation_mask_path.startsWith('http') ? consultation.segmentation_mask_path : `http://localhost:5000${consultation.segmentation_mask_path}`) : '',
    classification: consultation.tumor_type || 'Unknown',
    confidence: confidenceVal,
    location: consultation.tumor_location || 'Unknown',
    area: consultation.tumor_size_mm2 || 0,
    treatmentSuggestion: consultation.treatment_plan || 'Consult specialist',
    triage: {
      level: triageLevel,
      label: triageLabel,
      color: triageColor
    }
  };

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '100%', width: '100%' }}>
        <h1 className="page-title">Clinical Review: {consultation.patient_name}</h1>
        <p className="page-subtitle">Consultation ID: {id} | Status: <span style={{ color: '#10b981', textTransform: 'uppercase' }}>{consultation.status}</span></p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', marginTop: '32px' }}>
          
          {/* Main AI Report Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>AI Analysis Report (Scan #{consultation.scan_id})</h3>
                {scanData.triage && <TriageBadge triage={scanData.triage} />}
              </div>

              {/* 3 Panel View */}
              <ThreePanelView originalImage={scanData.originalImage} segmentationMask={scanData.segmentationMask} />

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

            {/* In-App Chat Integration */}
            <ChatWindow consultationId={id} currentUserRole={user?.role} currentUserId={user?.id} />
            
            {/* Doctor Override Form */}
            <div style={{ background: 'rgba(16,185,129,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <h3 style={{ color: '#10b981', fontSize: '1.2rem', marginBottom: '16px' }}>Doctor Notes & Feedback</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>AI Agreement Level</label>
                  <select value={override} onChange={e => setOverride(e.target.value)} required>
                    <option value="">Select agreement level...</option>
                    <option value="agree">Agree with AI Diagnosis</option>
                    <option value="partially_agree">Minor Correction</option>
                    <option value="disagree">Disagree with AI Diagnosis</option>
                  </select>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>Used to continuously train and improve the ML model.</span>
                </div>
                <div className="form-group">
                  <label>Clinical Notes</label>
                  <textarea 
                    value={notes} 
                    onChange={e => setNotes(e.target.value)} 
                    rows="4" 
                    placeholder="Enter clinical notes for the patient's record..."
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', outline: 'none' }}
                    required
                  />
                </div>
                <button type="submit" className="btn btn--glow" style={{ width: '100%', justifyContent: 'center' }}>Mark Consultation as Completed</button>
              </form>
            </div>
          </div>

          {/* Sidebar Patient Info */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#1e90ff' }}>Patient Intake Data</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Age/Gender:</span> <span>{consultation.age || 'N/A'}, {consultation.gender || 'N/A'}</span></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Family Hx:</span> <span>{consultation.family_cancer_history ? 'Yes' : 'No'}</span></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Prior Surgery:</span> <span>{consultation.previous_treatment ? 'Yes' : 'No'}</span></li>
                <li style={{ display: 'flex', flexDirection: 'column', marginTop: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Neurological Symptoms:</span> 
                  <span style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '4px' }}>{consultation.neurological_symptoms || 'None reported'}</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}><span style={{ color: 'var(--text-secondary)' }}>Headache Severity:</span> <span>{consultation.headache_severity || 0}/10</span></li>
              </ul>
            </div>
            
            <div style={{ background: 'rgba(245,158,11,0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: '#f59e0b' }}>Telehealth</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Meeting scheduled for: {new Date(consultation.meeting_time).toLocaleString()}</p>
              <button className="btn btn--glow" style={{ width: '100%', justifyContent: 'center', background: '#f59e0b', color: '#000', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => alert('Launching WebRTC Call...')}>
                <Icon name="video" size={18} color="#000" /> Start Video Call
              </button>
            </div>
          </div>

        </div>
      </div>
      <FloatingChat />
    </main>
  );
}
