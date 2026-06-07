import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../patient/PatientPages.css';

export default function DoctorDashboard() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, []);

  const pendingCount = consultations.filter(c => c.status === 'pending' || c.status === 'accepted' || c.status === 'in_progress').length;
  const completedCount = consultations.filter(c => c.status === 'completed').length;
  
  const todayStr = new Date().toDateString();
  const todayCount = consultations.filter(c => new Date(c.meeting_time).toDateString() === todayStr).length;

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1000px' }}>
        <h1 className="page-title">Doctor Dashboard</h1>
        <p className="page-subtitle">Welcome back. Here is your patient queue and review metrics.</p>

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
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                      background: `${tierColor}15`,
                      color: tierColor,
                      border: `1px solid ${tierColor}30`,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {tierText}
                    </span>
                    <Link to={`/doctor/patient/${c.id}`} className="btn btn--glass" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                      View Clinical Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
