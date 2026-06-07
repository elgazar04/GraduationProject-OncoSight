import { useState, useEffect } from 'react';
import '../patient/PatientPages.css';

export default function DoctorVerification() {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPendingDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/doctors/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingDoctors(await res.json());
      } else {
        setError('Failed to fetch pending doctor registrations');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to system API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
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
        alert(`Doctor has been successfully ${status}`);
        fetchPendingDoctors();
      } else {
        alert('Failed to execute verification update');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating credentials verification status');
    }
  };

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1000px' }}>
        <h1 className="page-title">Doctor Verification Portal</h1>
        <p className="page-subtitle">Verify qualifications and credentials for newly registered medical practitioners.</p>

        {error && <div className="alert-message error" style={{ marginBottom: '20px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            Retrieving candidate records...
          </div>
        ) : pendingDoctors.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            color: 'var(--text-secondary)',
            background: 'rgba(255,255,255,0.01)',
            borderRadius: '16px',
            border: '1px dashed rgba(255,255,255,0.1)'
          }}>
            No doctors currently awaiting verification.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingDoctors.map(doc => (
              <div key={doc.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.02)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)',
                gap: '20px',
                flexWrap: 'wrap'
              }}>
                <div style={{ flex: '1', minWidth: '280px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Dr. {doc.name}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>Email: {doc.email}</span>
                    <span>Specialty: <strong style={{ color: '#00ffb2' }}>{doc.specialization}</strong></span>
                    <span>
                      License Document:{' '}
                      {doc.license_file_path && doc.license_file_path !== 'pending_upload' ? (
                        <a
                          href={`http://localhost:5000${doc.license_file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#00e5ff', textDecoration: 'underline' }}
                        >
                          View Uploaded Credentials
                        </a>
                      ) : (
                        <span style={{ color: '#ef4444', fontStyle: 'italic' }}>Pending upload</span>
                      )}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    className="btn btn--glass"
                    onClick={() => handleVerify(doc.id, 'rejected')}
                    style={{
                      padding: '10px 20px',
                      fontSize: '0.9rem',
                      color: '#ef4444',
                      borderColor: 'rgba(239,68,68,0.3)',
                      borderRadius: '8px'
                    }}
                  >
                    Reject Candidate
                  </button>
                  <button
                    className="btn btn--glow"
                    onClick={() => handleVerify(doc.id, 'verified')}
                    style={{
                      padding: '10px 20px',
                      fontSize: '0.9rem',
                      background: '#00ffb2',
                      color: '#0b0e14',
                      borderRadius: '8px',
                      fontWeight: 600
                    }}
                  >
                    Verify & Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
