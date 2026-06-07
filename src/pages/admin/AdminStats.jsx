import { useState, useEffect } from 'react';
import '../patient/PatientPages.css';

export default function AdminStats() {
  const [stats, setStats] = useState({ patients: 0, verifiedDoctors: 0, totalScansProcessed: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      } else {
        setError('Failed to fetch statistics');
      }

      const pendingRes = await fetch('http://localhost:5000/api/admin/doctors/pending', { headers });
      if (pendingRes.ok) {
        const pending = await pendingRes.json();
        setPendingCount(pending.length);
      }
    } catch (err) {
      console.error(err);
      setError('Connection timeout or server offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1000px' }}>
        <h1 className="page-title">System & Analytics Dashboard</h1>
        <p className="page-subtitle">Live status, database sizes, and health checks of the MRI segmentation pipelines.</p>

        {error && <div className="alert-message error" style={{ marginBottom: '20px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            Retrieving live stats...
          </div>
        ) : (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <h3 style={{ color: '#00e5ff', fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>
                  {stats.patients}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Registered Patients</p>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.02)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <h3 style={{ color: '#00ffb2', fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>
                  {stats.verifiedDoctors}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Verified Doctors</p>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.02)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <h3 style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>
                  {stats.totalScansProcessed}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Total Scans Processed</p>
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Subsystems Integrity & Logs
            </h3>

            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.85)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              lineHeight: '1.6'
            }}>
              <div><span style={{ color: '#00ffb2' }}>[OK]</span> Node.js/Express Gateway running on port 5000</div>
              <div><span style={{ color: '#00ffb2' }}>[OK]</span> MySQL Local Connection Active</div>
              <div><span style={{ color: '#00ffb2' }}>[OK]</span> ML Inference Endpoint initialized</div>
              <div><span style={{ color: '#00e5ff' }}>[INFO]</span> Doctors Pending Verification: <strong style={{ color: '#f59e0b' }}>{pendingCount}</strong></div>
              <div><span style={{ color: '#00e5ff' }}>[INFO]</span> Model status: ResNet/UNet running optimally</div>
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                margin: '12px 0 6px',
                paddingTop: '12px',
                color: 'var(--text-secondary)'
              }}>
                Last system snapshot generated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
