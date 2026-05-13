import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientContext } from '../../contexts/PatientContext';
import { scanService } from '../../services/scanService';
import './PatientPages.css';

export default function AnalysisLoader() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { setResults } = usePatientContext();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing AI pipeline...');

  useEffect(() => {
    let curr = 0;
    const interval = setInterval(async () => {
      curr += 3 + Math.random() * 5;
      
      if (curr >= 100) {
        clearInterval(interval);
        setProgress(100);
        setStatusText('Analysis Complete. Finalizing report...');
        
        try {
          // Fetch the completed results from the API
          const results = await scanService.getScanResults(scanId);
          setResults(results); // Save to global state
          
          setTimeout(() => {
            navigate(`/patient/results/${scanId}`);
          }, 800);
        } catch (err) {
          console.error(err);
          alert('Error retrieving results');
        }
      } else {
        setProgress(Math.floor(curr));
        if (curr < 25) setStatusText('Preprocessing image and normalizing contrast...');
        else if (curr < 50) setStatusText('Running 3D U-Net Segmentation...');
        else if (curr < 75) setStatusText('Extracting features and classifying tumor subtype...');
        else setStatusText('Synthesizing confidence intervals...');
      }
    }, 200);

    return () => clearInterval(interval);
  }, [scanId, navigate, setResults]);

  return (
    <main className="page-container" style={{ padding: '80px 24px', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center' }}>
      <div className="form-wrapper" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <div className="analysis-brain-loader" style={{ fontSize: '5rem', marginBottom: '32px', animation: 'pulseGlow 2s infinite ease-in-out' }}>🧠</div>
        
        <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Analyzing Neural Structures</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', minHeight: '24px' }}>{statusText}</p>
        
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #1e90ff, #00e5ff)', transition: 'width 0.2s ease', boxShadow: '0 0 10px rgba(0,229,255,0.5)' }} />
        </div>
        <div style={{ color: '#00e5ff', fontWeight: 700, fontSize: '1.2rem' }}>{progress}%</div>

        <style>{`
          @keyframes pulseGlow {
            0% { transform: scale(0.95); filter: drop-shadow(0 0 10px rgba(0,229,255,0.2)); }
            50% { transform: scale(1.05); filter: drop-shadow(0 0 40px rgba(0,229,255,0.8)); }
            100% { transform: scale(0.95); filter: drop-shadow(0 0 10px rgba(0,229,255,0.2)); }
          }
        `}</style>
      </div>
    </main>
  );
}
