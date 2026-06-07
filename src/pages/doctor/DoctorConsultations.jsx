import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../patient/PatientPages.css';

export default function DoctorConsultations() {
  const [activeTab, setActiveTab] = useState('accepted');
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/consultations/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setConsultations(data);
        }
      } catch (err) {
        console.error('Error fetching consultations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, []);

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '900px' }}>
        <h1 className="page-title">Consultation Schedule</h1>
        <p className="page-subtitle">Manage your telehealth and in-person appointments</p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
          <button className={`btn ${activeTab === 'pending' ? 'btn--glow' : 'btn--glass'}`} onClick={() => setActiveTab('pending')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Pending Requests</button>
          <button className={`btn ${activeTab === 'accepted' ? 'btn--glow' : 'btn--glass'}`} onClick={() => setActiveTab('accepted')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Upcoming</button>
          <button className={`btn ${activeTab === 'completed' ? 'btn--glow' : 'btn--glass'}`} onClick={() => setActiveTab('completed')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Completed</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading consultations...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {consultations.filter(m => m.status === activeTab).map(meeting => (
              <div key={meeting.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>
                    {new Date(meeting.meeting_time).toLocaleString()} • {meeting.patient_name}
                  </h4>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: (meeting.triage_tier === 'emergency' || meeting.triage_tier === 1 || meeting.triage_tier === '1') 
                      ? '#ef4444' 
                      : (meeting.triage_tier === 'urgent' || meeting.triage_tier === 2 || meeting.triage_tier === '2') 
                        ? '#f59e0b' 
                        : '#10b981' 
                  }}>
                    Scan ID: {meeting.scan_id} {meeting.triage_tier ? `| ${meeting.triage_tier.toUpperCase()}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {activeTab === 'pending' && (
                    <button className="btn btn--glow" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={async () => {
                      const token = localStorage.getItem('token');
                      await fetch(`http://localhost:5000/api/consultations/${meeting.id}/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ status: 'accepted' })
                      });
                      window.location.reload();
                    }}>Accept</button>
                  )}
                  {activeTab === 'accepted' && (
                    <button className="btn btn--glow" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate(`/doctor/patient/${meeting.id}`)}>
                      Open Review
                    </button>
                  )}
                  {activeTab === 'completed' && (
                    <button className="btn btn--glass" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => navigate(`/doctor/patient/${meeting.id}`)}>
                      View Summary
                    </button>
                  )}
                </div>
              </div>
            ))}
            {consultations.filter(m => m.status === activeTab).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No {activeTab} consultations found.</div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
