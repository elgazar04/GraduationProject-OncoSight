import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scanService } from '../../services/scanService';
import './PatientPages.css';

export default function ScanHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await scanService.getHistory();
        setHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '900px' }}>
        <h1 className="page-title">Scan History</h1>
        <p className="page-subtitle">Timeline of all your uploaded MRI scans and AI reports.</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading history...</div>
        ) : (
          <div className="timeline-container" style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid rgba(30,144,255,0.2)' }}>
            {history.map((scan, idx) => (
              <div key={scan.id} style={{ position: 'relative', marginBottom: '32px', paddingLeft: '24px' }}>
                {/* Timeline Dot */}
                <div style={{ position: 'absolute', left: '-29px', top: '0', width: '16px', height: '16px', borderRadius: '50%', background: idx === 0 ? '#1e90ff' : 'rgba(255,255,255,0.2)', border: '4px solid var(--bg-card)', boxShadow: idx === 0 ? '0 0 10px #1e90ff' : 'none' }} />
                
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Scan: {scan.id.toUpperCase()}</h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
                      {new Date(scan.date).toLocaleString()}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ background: scan.classification === 'Clear' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: scan.classification === 'Clear' ? '#10b981' : '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                        {scan.classification}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Confidence: {scan.confidence}%
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link to={`/patient/results/${scan.id}`} className="btn btn--glow" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                      View Full Report
                    </Link>
                    {idx === 0 && history.length > 1 && (
                      <button className="btn btn--glass" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
                        Compare to Previous
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
