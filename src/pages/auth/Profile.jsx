import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../patient/PatientPages.css';

export default function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    currentPassword: '',
    newPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Profile updated successfully! (Mock)');
  };

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '600px' }}>
        <h1 className="page-title">Profile Management</h1>
        <p className="page-subtitle">Update your personal information and security settings</p>

        <form className="intake-form" onSubmit={handleSubmit}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
            <img src={user?.avatar || "https://i.pravatar.cc/150?img=12"} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
            <button type="button" className="btn btn--glass" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Upload New Avatar</button>
          </div>

          <h3 style={{ fontSize: '1.2rem', marginTop: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Personal Information</h3>

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled style={{ opacity: 0.7 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Contact support to change email address.</span>
          </div>

          <h3 style={{ fontSize: '1.2rem', marginTop: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Security Settings</h3>

          <div className="form-group">
            <label>Current Password</label>
            <input type="password" value={formData.currentPassword} onChange={e => setFormData({...formData, currentPassword: e.target.value})} placeholder="Leave blank to keep same" />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} placeholder="New password" />
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="submit" className="btn btn--glow" style={{ width: '100%', justifyContent: 'center' }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
