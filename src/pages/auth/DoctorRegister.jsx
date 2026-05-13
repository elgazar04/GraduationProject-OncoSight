import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../patient/PatientPages.css';

export default function DoctorRegister() {
  const { registerDoctor } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', specialty: '', licenseNumber: '', clinicInfo: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await registerDoctor(formData);
      navigate('/doctor/dashboard'); // Will show pending verification state
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '650px', borderTop: '4px solid #b388ff' }}>
        <h1 className="page-title" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #fff, #b388ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Medical Professional Registration</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>Join our network of verified specialists</p>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form className="intake-form" onSubmit={handleSubmit}>
          <div className="form-group-row">
            <div className="form-group">
              <label>Full Name (with title)</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Dr. John Doe" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="doctor@clinic.com" />
            </div>
          </div>
          
          <div className="form-group-row">
            <div className="form-group">
              <label>Medical Specialty</label>
              <select required value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})}>
                <option value="">Select Specialty</option>
                <option value="neuro-oncologist">Neuro-Oncologist</option>
                <option value="neurosurgeon">Neurosurgeon</option>
                <option value="neurologist">Neurologist</option>
                <option value="radiologist">Radiologist</option>
              </select>
            </div>
            <div className="form-group">
              <label>Medical License Number</label>
              <input type="text" required value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} placeholder="For verification" />
            </div>
          </div>

          <div className="form-group">
            <label>Clinic/Hospital Affiliation</label>
            <input type="text" required value={formData.clinicInfo} onChange={e => setFormData({...formData, clinicInfo: e.target.value})} placeholder="e.g. Johns Hopkins Medical Center" />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
          </div>

          <div className="form-actions" style={{ marginTop: '10px' }}>
            <button type="submit" className="btn btn--glow" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)' }} disabled={isLoading}>
              {isLoading ? 'Submitting Application...' : 'Submit Application for Review'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '12px' }}>Already verified? <Link to="/login" style={{ color: '#b388ff', textDecoration: 'none', fontWeight: 600 }}>Login</Link></p>
          <p>Are you a patient? <Link to="/register" style={{ color: '#1e90ff', textDecoration: 'none', fontWeight: 600 }}>Register here</Link></p>
        </div>
      </div>
    </main>
  );
}
