import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../patient/PatientPages.css';

export default function PatientRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', dob: '', phone: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await register({ ...formData, role: 'patient' });
      navigate('/patient/intake');
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '550px' }}>
        <h1 className="page-title" style={{ textAlign: 'center' }}>Create Account</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>Join BrainScanAI to get instant MRI analysis</p>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form className="intake-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
          </div>
          
          <div className="form-group-row">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 8900" />
            </div>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" required value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '10px' }}>
            <button type="submit" className="btn btn--glow" style={{ width: '100%', justifyContent: 'center' }} disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '12px' }}>Already have an account? <Link to="/login" style={{ color: '#1e90ff', textDecoration: 'none', fontWeight: 600 }}>Login</Link></p>
          <p>Are you a doctor? <Link to="/register/doctor" style={{ color: '#00e5ff', textDecoration: 'none', fontWeight: 600 }}>Register as Medical Professional</Link></p>
        </div>
      </div>
    </main>
  );
}
