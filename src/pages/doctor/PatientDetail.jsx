import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ChatWindow from '../../components/shared/ChatWindow';
import '../patient/PatientPages.css';

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

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1200px' }}>
        <h1 className="page-title">Clinical Review: {consultation.patient_name}</h1>
        <p className="page-subtitle">Consultation ID: {id} | Status: <span style={{ color: '#10b981', textTransform: 'uppercase' }}>{consultation.status}</span></p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', marginTop: '32px' }}>
          
          {/* Main AI Report Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>AI Analysis Report (Scan #{consultation.scan_id})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', height: '250px' }}>
                   <img src={`http://localhost:5000${consultation.original_image_path}`} alt="Original MRI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=MRI+Image'; }} />
                </div>
                <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', height: '250px' }}>
                   <img src={consultation.segmentation_mask_path ? `http://localhost:5000${consultation.segmentation_mask_path}` : "https://via.placeholder.com/400x400?text=Segmentation"} alt="Segmentation Mask" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.9rem' }}>
                <div><strong style={{color: 'var(--text-secondary)'}}>Classification:</strong> {consultation.tumor_type || 'Processing...'} {consultation.classification_confidence ? `(${(consultation.classification_confidence * 100).toFixed(1)}%)` : ''}</div>
                <div><strong style={{color: 'var(--text-secondary)'}}>Location:</strong> {consultation.tumor_location || 'N/A'}</div>
                <div><strong style={{color: 'var(--text-secondary)'}}>Triage Tier:</strong> {consultation.triage_tier ? `Tier ${consultation.triage_tier}` : 'N/A'}</div>
                <div><strong style={{color: 'var(--text-secondary)'}}>Suggested Rx:</strong> {consultation.treatment_plan || 'N/A'}</div>
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
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Family Hx:</span> <span>{consultation.family_history ? 'Yes' : 'No'}</span></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Prior Surgery:</span> <span>{consultation.prior_surgeries ? 'Yes' : 'No'}</span></li>
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
              <button className="btn btn--glow" style={{ width: '100%', justifyContent: 'center', background: '#f59e0b', color: '#000', boxShadow: 'none' }} onClick={() => alert('Launching WebRTC Call...')}>
                🎥 Start Video Call
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
