import { useState, useEffect } from 'react';
import '../patient/PatientPages.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('verification');
  const [stats, setStats] = useState({ patients: 0, verifiedDoctors: 0, totalScansProcessed: 0 });
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers });
      if (statsRes.ok) setStats(await statsRes.json());
      
      const doctorsRes = await fetch('http://localhost:5000/api/admin/doctors/pending', { headers });
      if (doctorsRes.ok) setPendingDoctors(await doctorsRes.json());
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/doctors/${id}/verify`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Doctor successfully ${status}`);
        fetchData();
      }
    } catch (err) {
      console.error('Error verifying doctor', err);
    }
  };

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1000px' }}>
        <h1 className="page-title">System Administration</h1>
        <p className="page-subtitle">Manage users, doctors, and system health.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: '#1e90ff', fontSize: '2rem', marginBottom: '8px' }}>{stats.patients}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Total Registered Patients</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: '#10b981', fontSize: '2rem', marginBottom: '8px' }}>{stats.verifiedDoctors}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Verified Doctors</p>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '2rem', marginBottom: '8px' }}>{pendingDoctors.length}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Pending Verifications</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
          <button className={`btn ${activeTab === 'verification' ? 'btn--glow' : 'btn--glass'}`} onClick={() => setActiveTab('verification')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Doctor Verification</button>
          <button className={`btn ${activeTab === 'stats' ? 'btn--glow' : 'btn--glass'}`} onClick={() => setActiveTab('stats')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>System Logs</button>
        </div>

        {activeTab === 'verification' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
            ) : pendingDoctors.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No pending doctor verifications.</div>
            ) : pendingDoctors.map(doc => (
              <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{doc.name}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                    <span>{doc.specialty || 'General'}</span>
                    <span>•</span>
                    <span>License: <a href={`http://localhost:5000${doc.license_file_path}`} target="_blank" rel="noreferrer" style={{color: '#01BAEF'}}>View Document</a></span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button className="btn btn--glass" style={{ padding: '8px 16px', fontSize: '0.9rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => handleVerify(doc.id, 'rejected')}>
                    Reject
                  </button>
                  <button className="btn btn--glow" style={{ padding: '8px 16px', fontSize: '0.9rem', background: '#10b981', boxShadow: 'none' }} onClick={() => handleVerify(doc.id, 'verified')}>
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontFamily: 'monospace', color: '#10b981', fontSize: '1.2rem', marginBottom: '16px' }}>System operating nominally. ML Server Uptime: 99.98%</p>
            <p style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>Total Scans Processed: {stats.totalScansProcessed}</p>
          </div>
        )}

      </div>
    </main>
  );
}
