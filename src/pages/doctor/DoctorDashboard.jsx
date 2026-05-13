import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../patient/PatientPages.css';

const MOCK_PATIENTS = [
  { id: '101', name: 'John Doe', scanDate: '2026-05-04', tier: 2, status: 'Pending Review', classification: 'Glioma' },
  { id: '102', name: 'Emily Smith', scanDate: '2026-05-03', tier: 3, status: 'Reviewed', classification: 'Clear' },
  { id: '103', name: 'Robert Johnson', scanDate: '2026-05-05', tier: 1, status: 'ER Admitted', classification: 'Glioblastoma' }
];

export default function DoctorDashboard() {
  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1000px' }}>
        <h1 className="page-title">Doctor Dashboard</h1>
        <p className="page-subtitle">Welcome back, Dr. Smith. Here is your patient queue.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(245,158,11,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '2rem', marginBottom: '8px' }}>4</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Pending Reviews (Tier 2)</p>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <h3 style={{ color: '#10b981', fontSize: '2rem', marginBottom: '8px' }}>12</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Reviewed This Week</p>
          </div>
          <div style={{ background: 'rgba(30,144,255,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(30,144,255,0.2)' }}>
            <h3 style={{ color: '#1e90ff', fontSize: '2rem', marginBottom: '8px' }}>3</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Consultations Today</p>
          </div>
        </div>

        <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>Recent Scan Reports</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {MOCK_PATIENTS.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{p.name}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                  <span>Scan: {p.scanDate}</span>
                  <span>•</span>
                  <span>AI: {p.classification}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <span style={{ 
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                  background: p.tier === 1 ? 'rgba(239,68,68,0.1)' : p.tier === 2 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                  color: p.tier === 1 ? '#ef4444' : p.tier === 2 ? '#f59e0b' : '#10b981'
                }}>
                  Tier {p.tier}
                </span>
                <Link to={`/doctor/patient/${p.id}`} className="btn btn--glass" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                  View Clinical Profile
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
