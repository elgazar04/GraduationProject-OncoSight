import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../patient/PatientPages.css';

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

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '8px' }}>Secure Scan Record</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Scan ID: {scan.id}</p>
          </div>
          <Link to="/" className="btn btn--glass" style={{ textDecoration: 'none' }}>Go to BrainScanAI</Link>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
          {/* Main AI Report Panel */}
          <div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>AI Analysis Report</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', height: '250px' }}>
                   <img src={`http://localhost:5000${scan.original_image_path}`} alt="Original MRI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=MRI+Image'; }} />
                </div>
                <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', height: '250px' }}>
                   <img src={scan.segmentation_mask_path ? `http://localhost:5000${scan.segmentation_mask_path}` : "https://via.placeholder.com/400x400?text=Segmentation"} alt="Segmentation Mask" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.95rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Classification</div>
                  <div style={{ fontWeight: 'bold' }}>{scan.tumor_type || 'Processing...'}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Location</div>
                  <div style={{ fontWeight: 'bold' }}>{scan.tumor_location || 'N/A'}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Confidence Score</div>
                  <div style={{ fontWeight: 'bold' }}>{scan.classification_confidence ? `${(scan.classification_confidence * 100).toFixed(1)}%` : 'N/A'}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Tumor Size</div>
                  <div style={{ fontWeight: 'bold' }}>{scan.tumor_size_mm2 ? `${scan.tumor_size_mm2} mm²` : 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ background: 'rgba(30,144,255,0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(30,144,255,0.2)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#1e90ff' }}>Suggested Treatment</h3>
              <p style={{ color: 'white', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {scan.treatment_plan || 'No treatment plan available.'}
              </p>
            </div>
            
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
