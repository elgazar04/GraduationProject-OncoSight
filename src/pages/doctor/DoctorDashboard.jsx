import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FloatingChat from '../../components/shared/FloatingChat';
import '../patient/PatientPages.css';

export default function DoctorDashboard() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    specialization: '',
    years_experience: '',
    license_file_path: '',
    bio: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          name: data.name || '',
          specialization: data.profile?.specialization || '',
          years_experience: data.profile?.years_experience || '',
          license_file_path: data.profile?.license_file_path || '',
          bio: data.profile?.bio || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/consultations/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConsultations(data);
      } else {
        setError('Failed to fetch patient queue.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please verify API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/profile/doctor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileData.name,
          specialization: profileData.specialization,
          years_experience: parseInt(profileData.years_experience) || 0,
          license_file_path: profileData.license_file_path,
          bio: profileData.bio
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchConsultations();
        fetchProfile();
      } else {
        const errData = await res.json();
        setSaveError(errData.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      setSaveError('Failed to save profile. Try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const pendingCount = consultations.filter(c => c.status === 'pending' || c.status === 'accepted' || c.status === 'in_progress').length;
  const completedCount = consultations.filter(c => c.status === 'completed').length;
  
  const todayStr = new Date().toDateString();
  const todayCount = consultations.filter(c => new Date(c.meeting_time).toDateString() === todayStr).length;

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Doctor Dashboard</h1>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>Welcome back. Here is your patient queue and review metrics.</p>
          </div>
          <button 
            className="btn btn--glow" 
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '10px 24px', fontSize: '0.85rem' }}
          >
            Edit Profile & Bio
          </button>
        </div>

        {error && <div className="alert-message error" style={{ marginBottom: '20px' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(245,158,11,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>{pendingCount}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Pending Reviews</p>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <h3 style={{ color: '#10b981', fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>{completedCount}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Completed Reviews</p>
          </div>
          <div style={{ background: 'rgba(0,229,255,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,229,255,0.2)' }}>
            <h3 style={{ color: '#00e5ff', fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>{todayCount}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Consultations Today</p>
          </div>
        </div>

        <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', color: 'var(--text-primary)' }}>
          Recent Patient Queue
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            Loading queue...
          </div>
        ) : consultations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            Your consultation queue is empty.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {consultations.map(c => {
              const dateStr = new Date(c.meeting_time).toLocaleDateString();
              const timeStr = new Date(c.meeting_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              let tierColor = '#10b981';
              let tierText = 'Routine';
              if (c.triage_tier === 'emergency' || c.triage_tier === '1' || c.triage_tier === 1) {
                tierColor = '#ef4444';
                tierText = 'Emergency';
              } else if (c.triage_tier === 'urgent' || c.triage_tier === '2' || c.triage_tier === 2) {
                tierColor = '#f59e0b';
                tierText = 'Urgent';
              }

              return (
                <div key={c.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(10px)',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {c.patient_name}
                    </h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>Schedule: {dateStr} at {timeStr}</span>
                      <span>•</span>
                      <span>AI Finding: <strong style={{ color: '#00e5ff' }}>{c.tumor_type || 'Processing'}</strong></span>
                      <span>•</span>
                      <span>Status: <strong style={{ textTransform: 'capitalize', color: c.status === 'completed' ? '#10b981' : '#f59e0b' }}>{c.status}</strong></span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                      background: `${tierColor}15`,
                      color: tierColor,
                      border: `1px solid ${tierColor}30`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginRight: '8px'
                    }}>
                      {tierText}
                    </span>
                    <Link to={`/doctor/patient/${c.id}`} className="btn btn--glass" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      View Clinical Profile
                    </Link>
                    <button
                      className="btn btn--glow"
                      style={{ padding: '8px 16px', fontSize: '0.85rem', border: 'none', background: 'var(--neon-cyan)', color: '#0b0e14' }}
                      onClick={() => {
                        const event = new CustomEvent('open-chat', {
                          detail: { consultationId: c.id, contactName: c.patient_name }
                        });
                        window.dispatchEvent(event);
                      }}
                    >
                      Chat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Profile Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div className="form-wrapper" style={{ maxWidth: '600px', width: '100%', position: 'relative', borderTop: '4px solid var(--neon-cyan)', animation: 'none' }}>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', outline: 'none' }}
              >
                ✕
              </button>
              
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#fff' }}>Edit Profile & Bio</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Update your public information displayed to patients.</p>

              {saveError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  {saveError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="intake-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={profileData.name} 
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })} 
                    placeholder="e.g. Dr. John Carter"
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Specialty</label>
                    <select 
                      required 
                      value={profileData.specialization} 
                      onChange={e => setProfileData({ ...profileData, specialization: e.target.value })}
                    >
                      <option value="">Select Specialty</option>
                      <option value="neuro-oncologist">Neuro-Oncologist</option>
                      <option value="neurosurgeon">Neurosurgeon</option>
                      <option value="neurologist">Neurologist</option>
                      <option value="radiologist">Radiologist</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input 
                      type="number" 
                      required 
                      min="0" 
                      max="60" 
                      value={profileData.years_experience} 
                      onChange={e => setProfileData({ ...profileData, years_experience: e.target.value })} 
                      placeholder="e.g. 15"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Medical License Number</label>
                  <input 
                    type="text" 
                    required 
                    value={profileData.license_file_path} 
                    onChange={e => setProfileData({ ...profileData, license_file_path: e.target.value })} 
                    placeholder="For verification"
                  />
                </div>

                <div className="form-group">
                  <label>Biography / Professional Summary</label>
                  <textarea 
                    value={profileData.bio} 
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })} 
                    placeholder="Describe your credentials, background, and clinical focus..."
                    rows="4"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="button" className="btn btn--glass" onClick={() => setIsModalOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                  <button type="submit" className="btn btn--glow" disabled={saveLoading} style={{ flex: 1, justifyContent: 'center' }}>
                    {saveLoading ? 'Saving Changes...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <FloatingChat />
    </main>
  );
}
