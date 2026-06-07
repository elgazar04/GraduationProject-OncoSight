import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DoctorRating from '../../components/shared/DoctorRating';
import FloatingChat from '../../components/shared/FloatingChat';
import Icon from '../../components/shared/Icon';
import { useAuth } from '../../contexts/AuthContext';
import './PatientPages.css';

export default function Dashboard() {
  const { user, isProfileComplete } = useAuth();
  const [scans, setScans] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const scansRes = await fetch('http://localhost:5000/api/scans/history/me', { headers });
      if (scansRes.ok) setScans(await scansRes.json());
      
      const consultsRes = await fetch('http://localhost:5000/api/consultations/me', { headers });
      if (consultsRes.ok) setConsultations(await consultsRes.json());
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteScan = async (scanId) => {
    if (!window.confirm('Are you sure you want to permanently delete this scan? This will also cancel any associated consultations. This action is irreversible.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/scans/${scanId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Scan deleted successfully');
        fetchData();
      } else {
        alert('Failed to delete scan');
      }
    } catch (err) {
      console.error(err);
      alert('Error communicating with server');
    }
  };

  const triggerChat = (consultationId, doctorName) => {
    const event = new CustomEvent('open-chat', {
      detail: { consultationId, contactName: `Dr. ${doctorName}` }
    });
    window.dispatchEvent(event);
  };

  const upcomingConsultations = consultations.filter(c => c.status === 'accepted' || c.status === 'pending' || c.status === 'in_progress');
  const completedConsultations = consultations.filter(c => c.status === 'completed');

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1200px', width: '100%' }}>
        <h1 className="page-title">Patient Portal</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Manage your medical scans and clinical consultations below.</p>

        {/* Two-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', marginTop: '32px', alignItems: 'start' }}>
          
          {/* LEFT SIDE: Scan History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>Recent Scans & Diagnostic History</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{scans.length} scans uploaded</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                Loading scans...
              </div>
            ) : scans.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 40px',
                color: 'var(--text-secondary)',
                background: 'rgba(255, 255, 255, 0.01)',
                borderRadius: '16px',
                border: '1px dashed rgba(255, 255, 255, 0.08)'
              }}>
                No scans found. Upload an MRI to begin analysis.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {scans.map(scan => {
                  const isCompleted = scan.status === 'completed';
                  const isEmergency = scan.triage_tier === 'emergency' || scan.triage_tier === 1;
                  const isUrgent = scan.triage_tier === 'urgent' || scan.triage_tier === 2;

                  let triageColor = '#10b981';
                  let triageBg = 'rgba(16,185,129,0.1)';
                  if (isEmergency) {
                    triageColor = '#ef4444';
                    triageBg = 'rgba(239,68,68,0.1)';
                  } else if (isUrgent) {
                    triageColor = '#f59e0b';
                    triageBg = 'rgba(245,158,11,0.1)';
                  }

                  const scanId = scan.id || scan._id;
                  const scanDate = scan.created_at || scan.uploadDate;

                  return (
                    <div key={scanId} style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '24px',
                      flexWrap: 'wrap',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ flex: 1, minWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{
                            background: isCompleted ? 'rgba(0, 255, 178, 0.1)' : scan.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: isCompleted ? '#00ffb2' : scan.status === 'failed' ? '#ef4444' : '#f59e0b',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            letterSpacing: '0.5px'
                          }}>
                            {scan.status}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>ID: {scanId.substring(0, 8)}...</span>
                        </div>

                        <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>
                          MRI Scan Analysis
                        </h4>
                        
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <span>Date: {new Date(scanDate).toLocaleDateString()}</span>
                          {isCompleted && (
                            <>
                              <span>•</span>
                              <span>Finding: <strong style={{ color: '#00e5ff' }}>{scan.tumor_type || scan.results?.classification || 'Normal'}</strong></span>
                              <span>•</span>
                              <span>Triage: <strong style={{ color: triageColor }}>{scan.triage_tier || 'routine'}</strong></span>
                            </>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {isCompleted ? (
                          <Link to={`/patient/results/${scanId}`} className="btn btn--glass" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                            View Report
                          </Link>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Processing...</span>
                        )}
                        <button
                          onClick={() => handleDeleteScan(scanId)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed Consultations & Ratings */}
            {completedConsultations.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>Completed Reviews</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {completedConsultations.map(c => (
                    <div key={c.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '20px', borderRadius: '16px' }}>
                      <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>Dr. {c.doctor_name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>{new Date(c.meeting_time).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.88rem', marginBottom: '16px', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <strong>Doctor Notes:</strong> {c.clinical_notes || 'No notes provided.'}
                      </div>
                      {c.rating ? (
                        <div style={{ color: '#f59e0b', fontSize: '0.9rem' }}>Your Rating: {c.rating} ★</div>
                      ) : (
                        <DoctorRating consultationId={c.id} onRated={fetchData} />
                      )}
                      <button 
                        className="btn btn--glass" 
                        style={{ width: '100%', marginTop: '16px', fontSize: '0.85rem' }} 
                        onClick={() => triggerChat(c.id, c.doctor_name)}
                      >
                        View Chat History
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Profile, Upload, Upcoming */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Quick Actions (New Analysis) */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(0, 255, 178, 0.08))', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>New Diagnostics</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>Upload a brain MRI scan and run diagnostic classification algorithms.</p>
              <Link 
                to={isProfileComplete() ? "/patient/upload" : "/patient/intake"} 
                className="btn btn--glow" 
                style={{ width: '100%', justifyContent: 'center', background: '#00ffb2', color: '#0b0e14', fontWeight: 600 }}
              >
                Upload MRI Scan
              </Link>
            </div>

            {/* Profile Summary Card */}
            {isProfileComplete() && user?.profile && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '24px', borderRadius: '16px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                  <Icon name="clipboard" size={18} color="var(--neon-cyan)" /> Clinical Health Profile
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Age / Biological Sex:</strong> <span style={{ color: '#fff' }}>{user.profile.age} yrs / {user.profile.gender}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Functional Status:</strong> <span style={{ color: '#fff' }}>{user.profile.functional_status === 'needs_some_help' ? 'Some help' : user.profile.functional_status === 'needs_significant_help' ? 'Significant help' : user.profile.functional_status === 'fully_dependent' ? 'Bed-bound' : 'Independent'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Smoking Status:</strong> <span style={{ color: '#fff' }}>{user.profile.smoking_status || 'Never'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Comorbidities:</strong> <span style={{ color: '#fff' }}>{user.profile.diabetes === 1 || user.profile.hypertension === 1 ? 'Diabetes/Hypertension' : 'None reported'}</span></div>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <Link to="/patient/intake" className="btn btn--glass" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '0.85rem' }}>
                    Edit Profile Details
                  </Link>
                </div>
              </div>
            )}

            {/* Upcoming Consultations */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff' }}>Upcoming Consultations</h3>
              {loading ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading schedule...</p>
              ) : upcomingConsultations.length === 0 ? (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.88rem', margin: 0 }}>No consultations scheduled.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {upcomingConsultations.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>Dr. {c.doctor_name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '2px' }}>{new Date(c.meeting_time).toLocaleString()}</div>
                        <div style={{ color: c.status === 'pending' ? '#f59e0b' : '#10b981', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>{c.status}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {c.status === 'accepted' && (
                          <button className="btn btn--glass" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Join</button>
                        )}
                        <button 
                          className="btn btn--glow" 
                          style={{ padding: '4px 10px', fontSize: '0.75rem', border: 'none', background: 'var(--neon-cyan)', color: '#0b0e14' }} 
                          onClick={() => triggerChat(c.id, c.doctor_name)}
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
      
      {/* Global persistent chat widget is mounted here */}
      <FloatingChat />
    </main>
  );
}
