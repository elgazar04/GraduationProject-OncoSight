import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from '../../components/shared/Icon';
import '../patient/PatientPages.css';

export default function AdminDashboard() {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState('scans'); // default to scans management
  const [stats, setStats] = useState({ patients: 0, verifiedDoctors: 0, totalScansProcessed: 0 });
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [scans, setScans] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Search states
  const [scanSearch, setScanSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [editScanModal, setEditScanModal] = useState(false);
  const [currentScan, setCurrentScan] = useState(null);

  const [editUserModal, setEditUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch stats
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers });
      if (statsRes.ok) setStats(await statsRes.json());
      
      // Fetch pending doctors
      const doctorsRes = await fetch('http://localhost:5000/api/admin/doctors/pending', { headers });
      if (doctorsRes.ok) setPendingDoctors(await doctorsRes.json());

      // Fetch all scans
      const scansRes = await fetch('http://localhost:5000/api/admin/scans', { headers });
      if (scansRes.ok) setScans(await scansRes.json());

      // Fetch all users
      const usersRes = await fetch('http://localhost:5000/api/admin/users', { headers });
      if (usersRes.ok) setUsers(await usersRes.json());

    } catch (err) {
      console.error('Error fetching admin data', err);
      setError('Connection failure. Could not populate admin databases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Doctor verification approve/reject
  const handleVerifyDoctor = async (id, status) => {
    if (!window.confirm(`Are you sure you want to change verification status to ${status}?`)) return;
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
        fetchData();
      } else {
        alert('Failed to update doctor verification status');
      }
    } catch (err) {
      console.error('Error verifying doctor', err);
      alert('Error communicating with server');
    }
  };

  // Toggle user activation state
  const handleToggleUserStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const nextStatus = !currentStatus;
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: nextStatus })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: nextStatus } : u));
      } else {
        alert('Failed to update user account status');
      }
    } catch (err) {
      console.error(err);
      alert('Communication error occurred');
    }
  };

  // Edit user save action
  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          is_active: currentUser.is_active
        })
      });
      if (res.ok) {
        alert('User details successfully updated');
        setEditUserModal(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error?.message || 'Failed to save user modifications');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating user record');
    }
  };

  // Delete user account
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`WARNING: Deleting user "${name}" will cascade delete all associated profiles, scans, and consultation notes. This action is IRREVERSIBLE. Do you wish to proceed?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('User account successfully deleted');
        fetchData();
      } else {
        alert('Failed to delete user account');
      }
    } catch (err) {
      console.error(err);
      alert('Communication failure during user deletion');
    }
  };

  // Edit scan save action
  const handleSaveScan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/scans/${currentScan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tumor_type: currentScan.tumor_type,
          tumor_location: currentScan.tumor_location,
          tumor_size_mm2: currentScan.tumor_size_mm2 ? parseFloat(currentScan.tumor_size_mm2) : null,
          hemisphere: currentScan.hemisphere,
          classification_confidence: currentScan.classification_confidence ? parseFloat(currentScan.classification_confidence) : null,
          treatment_plan: currentScan.treatment_plan,
          urgency_level: currentScan.urgency_level,
          triage_tier: currentScan.triage_tier,
          status: currentScan.status
        })
      });
      if (res.ok) {
        alert('Scan details successfully updated');
        setEditScanModal(false);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error?.message || 'Failed to update scan records');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving scan details');
    }
  };

  // Delete scan execution
  const handleDeleteScan = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this scan? Associated files on disk and consultation records will be destroyed. This action is irreversible.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/scans/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Scan successfully deleted');
        fetchData();
      } else {
        alert('Failed to delete scan from system');
      }
    } catch (err) {
      console.error(err);
      alert('Communication failure during scan deletion');
    }
  };

  // Filters
  const filteredScans = scans.filter(s => 
    (s.patient_name || '').toLowerCase().includes(scanSearch.toLowerCase()) ||
    (s.patient_email || '').toLowerCase().includes(scanSearch.toLowerCase()) ||
    (s.tumor_type || 'unclassified').toLowerCase().includes(scanSearch.toLowerCase()) ||
    s.id.includes(scanSearch)
  );

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1200px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>System Administration Portal</h1>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>Inspect, analyze, and manage platform databases, scans, and credentials.</p>
          </div>
          <button onClick={fetchData} className="btn btn--glass" style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="activity" size={16} /> Sync Data
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Database</span>
            <h3 style={{ color: '#00e5ff', fontSize: '2.2rem', margin: '4px 0 2px 0', fontWeight: 800 }}>{users.length}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Registered Users</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clinical Scans</span>
            <h3 style={{ color: '#00ffb2', fontSize: '2.2rem', margin: '4px 0 2px 0', fontWeight: 800 }}>{stats.totalScansProcessed}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Processed MRI Audits</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Staff Verification</span>
            <h3 style={{ color: pendingDoctors.length > 0 ? '#ff6e40' : '#b388ff', fontSize: '2.2rem', margin: '4px 0 2px 0', fontWeight: 800 }}>{pendingDoctors.length}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Pending Credentials</p>
          </div>
        </div>

        {/* Console Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', overflowX: 'auto', flexWrap: 'wrap' }}>
          {[
            { id: 'scans', label: 'Scan Database', icon: 'brain' },
            { id: 'users', label: 'User Accounts', icon: 'user' },
            { id: 'verification', label: 'Doctor Approvals', icon: 'shield' },
            { id: 'stats', label: 'System Logs', icon: 'activity' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`btn ${activeTab === tab.id ? 'btn--glow' : 'btn--glass'}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '10px'
              }}
            >
              <Icon name={tab.icon} size={16} color={activeTab === tab.id ? '#0b0e14' : 'var(--text-secondary)'} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {error && <div className="alert-message error" style={{ marginBottom: '24px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            Synchronizing admin console modules...
          </div>
        ) : (
          <div>
            {/* TAB 1: SCAN MANAGEMENT */}
            {activeTab === 'scans' && (
              <div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search scans by patient name, email, type, or Scan ID..."
                      value={scanSearch}
                      onChange={(e) => setScanSearch(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px' }}
                    />
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                      <Icon name="search" size={16} />
                    </div>
                  </div>
                </div>

                {filteredScans.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    No scans match your search query.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredScans.map(scan => (
                      <div key={scan.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '24px',
                        borderRadius: '16px',
                        flexWrap: 'wrap',
                        gap: '20px'
                      }}>
                        <div style={{ flex: '1', minWidth: '280px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <span style={{
                              background: scan.status === 'completed' ? 'rgba(0, 255, 178, 0.1)' : scan.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: scan.status === 'completed' ? '#00ffb2' : scan.status === 'failed' ? '#ef4444' : '#f59e0b',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              letterSpacing: '0.5px'
                            }}>
                              {scan.status}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>ID: {scan.id.substring(0, 8)}...</span>
                          </div>

                          <h4 style={{ fontSize: '1.15rem', color: '#fff', margin: '0 0 6px 0', fontWeight: 600 }}>
                            {scan.patient_name} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>({scan.patient_email})</span>
                          </h4>

                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>Type: <strong style={{ color: scan.tumor_type ? '#00e5ff' : 'var(--text-tertiary)' }}>{scan.tumor_type || 'Unclassified'}</strong></span>
                            <span>•</span>
                            <span>Location: <strong>{scan.tumor_location || 'none'}</strong></span>
                            <span>•</span>
                            <span>Size: <strong>{scan.tumor_size_mm2 ? `${scan.tumor_size_mm2} mm²` : '0 mm²'}</strong></span>
                            <span>•</span>
                            <span>Triage: <strong style={{
                              color: scan.triage_tier === 'emergency' ? '#ef4444' : scan.triage_tier === 'urgent' ? '#f59e0b' : '#10b981'
                            }}>{scan.triage_tier || 'none'}</strong></span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            className="btn btn--glass"
                            onClick={() => {
                              setCurrentScan({
                                ...scan,
                                classification_confidence: scan.classification_confidence ? (scan.classification_confidence * 100).toFixed(1) : ''
                              });
                              setEditScanModal(true);
                            }}
                            style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Icon name="edit" size={14} /> Edit
                          </button>
                          <button
                            className="btn btn--glass"
                            onClick={() => handleDeleteScan(scan.id)}
                            style={{ padding: '8px 14px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Icon name="x" size={14} color="#ef4444" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: USER MANAGEMENT */}
            {activeTab === 'users' && (
              <div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search users by name, email, or role..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px' }}
                    />
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                      <Icon name="search" size={16} />
                    </div>
                  </div>
                </div>

                {filteredUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    No users match your search query.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {filteredUsers.map(user => (
                      <div key={user.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        padding: '20px',
                        borderRadius: '16px',
                        flexWrap: 'wrap',
                        gap: '20px'
                      }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 6px 0', color: '#fff' }}>
                            {user.name}
                          </h3>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <span>Email: {user.email}</span>
                            <span>•</span>
                            <span style={{
                              textTransform: 'uppercase',
                              color: user.role === 'admin' ? '#00e5ff' : user.role === 'doctor' ? '#00ffb2' : '#f59e0b',
                              fontWeight: 600
                            }}>{user.role}</span>
                            <span>•</span>
                            <span>Registered: {new Date(user.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button
                            className="btn btn--glass"
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                            style={{
                              padding: '8px 14px',
                              fontSize: '0.85rem',
                              background: user.is_active ? 'rgba(239, 68, 68, 0.05)' : 'rgba(0, 255, 178, 0.05)',
                              color: user.is_active ? '#ef4444' : '#00ffb2',
                              borderColor: user.is_active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 255, 178, 0.2)'
                            }}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className="btn btn--glass"
                            onClick={() => {
                              setCurrentUser(user);
                              setEditUserModal(true);
                            }}
                            style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Icon name="edit" size={14} /> Edit
                          </button>
                          <button
                            className="btn btn--glass"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            style={{ padding: '8px 14px', fontSize: '0.85rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Icon name="x" size={14} color="#ef4444" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DOCTOR VERIFICATION */}
            {activeTab === 'verification' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingDoctors.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 40px',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.01)',
                    borderRadius: '16px',
                    border: '1px dashed rgba(255,255,255,0.08)'
                  }}>
                    No medical credentials currently awaiting review.
                  </div>
                ) : (
                  pendingDoctors.map(doc => (
                    <div key={doc.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: '24px',
                      borderRadius: '16px',
                      flexWrap: 'wrap',
                      gap: '20px'
                    }}>
                      <div style={{ flex: '1', minWidth: '280px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                          Dr. {doc.name}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          <span>Email: {doc.email}</span>
                          <span>Specialty: <strong style={{ color: '#00ffb2' }}>{doc.specialization}</strong></span>
                          <span>
                            Credentials Document:{' '}
                            {doc.license_file_path && doc.license_file_path !== 'pending_upload' ? (
                              <a
                                href={`http://localhost:5000${doc.license_file_path}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#00e5ff', textDecoration: 'underline' }}
                              >
                                View License Certificate
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
                          onClick={() => handleVerifyDoctor(doc.id, 'rejected')}
                          style={{ padding: '10px 20px', fontSize: '0.9rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', borderRadius: '8px' }}
                        >
                          Reject
                        </button>
                        <button
                          className="btn btn--glow"
                          onClick={() => handleVerifyDoctor(doc.id, 'verified')}
                          style={{ padding: '10px 20px', fontSize: '0.9rem', background: '#00ffb2', color: '#0b0e14', borderRadius: '8px', fontWeight: 600 }}
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: SYSTEM HEALTH & STATS */}
            {activeTab === 'stats' && (
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center'
              }}>
                <div style={{ display: 'inline-flex', alignSelf: 'center', background: 'rgba(0, 255, 178, 0.05)', padding: '16px', borderRadius: '50%', marginBottom: '24px', border: '1px solid rgba(0, 255, 178, 0.15)' }}>
                  <Icon name="activity" size={32} color="#00ffb2" />
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, margin: '0 0 10px 0' }}>All Systems Operational</h3>
                <p style={{ fontFamily: 'monospace', color: '#00ffb2', fontSize: '1.05rem', margin: '0 0 24px 0' }}>Diagnostic ML Server Uptime: 99.98%</p>
                
                <div style={{ maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>Node.js API Server Port</span>
                    <span style={{ fontFamily: 'monospace', color: '#fff' }}>5000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>FastAPI AI Service Port</span>
                    <span style={{ fontFamily: 'monospace', color: '#fff' }}>8000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>Total scans in system</span>
                    <span style={{ fontFamily: 'monospace', color: '#fff' }}>{stats.totalScansProcessed}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>Registered patients</span>
                    <span style={{ fontFamily: 'monospace', color: '#fff' }}>{stats.patients}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: EDIT SCAN DETAILS */}
      {editScanModal && currentScan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#1c1c1c',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '32px',
            width: '90%',
            maxWidth: '650px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>Edit Scan Diagnostics</h3>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Scan ID: {currentScan.id}</p>
              </div>
              <button onClick={() => setEditScanModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <Icon name="x" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveScan} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Scan Status</label>
                  <select
                    className="form-input"
                    value={currentScan.status}
                    onChange={(e) => setCurrentScan({ ...currentScan, status: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}
                  >
                    <option value="created">Created</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Tumor Classification</label>
                  <select
                    className="form-input"
                    value={currentScan.tumor_type || ''}
                    onChange={(e) => setCurrentScan({ ...currentScan, tumor_type: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}
                  >
                    <option value="">Normal (No Tumor)</option>
                    <option value="Glioma">Glioma</option>
                    <option value="Meningioma">Meningioma</option>
                    <option value="Pituitary">Pituitary</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Location Detail</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentScan.tumor_location || ''}
                    onChange={(e) => setCurrentScan({ ...currentScan, tumor_location: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}
                    placeholder="e.g. Frontal Lobe"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Hemisphere</label>
                  <select
                    className="form-input"
                    value={currentScan.hemisphere || ''}
                    onChange={(e) => setCurrentScan({ ...currentScan, hemisphere: e.target.value || null })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}
                  >
                    <option value="">None / Both</option>
                    <option value="left">Left Hemisphere</option>
                    <option value="right">Right Hemisphere</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Tumor Size (mm²)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={currentScan.tumor_size_mm2 || ''}
                    onChange={(e) => setCurrentScan({ ...currentScan, tumor_size_mm2: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>AI Confidence Score (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    max="100"
                    min="0"
                    className="form-input"
                    value={currentScan.classification_confidence || ''}
                    onChange={(e) => setCurrentScan({ ...currentScan, classification_confidence: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Urgency Level (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="form-input"
                    value={currentScan.urgency_level || ''}
                    onChange={(e) => setCurrentScan({ ...currentScan, urgency_level: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Triage Classification</label>
                  <select
                    className="form-input"
                    value={currentScan.triage_tier || ''}
                    onChange={(e) => setCurrentScan({ ...currentScan, triage_tier: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Treatment Suggestion Plan</label>
                <textarea
                  className="form-input"
                  value={currentScan.treatment_plan || ''}
                  onChange={(e) => setCurrentScan({ ...currentScan, treatment_plan: e.target.value })}
                  style={{ width: '100%', height: '80px', resize: 'vertical', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn--glass" onClick={() => setEditScanModal(false)} style={{ padding: '10px 24px' }}>Cancel</button>
                <button type="submit" className="btn btn--glow" style={{ padding: '10px 24px', background: '#00ffb2', color: '#0b0e14' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER DETAILS */}
      {editUserModal && currentUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#1c1c1c',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            padding: '32px',
            width: '90%',
            maxWidth: '500px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>Edit User Account</h3>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>User ID: {currentUser.id}</p>
              </div>
              <button onClick={() => setEditUserModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <Icon name="x" size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>System Role</label>
                <select
                  className="form-input"
                  value={currentUser.role}
                  onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.02)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '10px' }}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn--glass" onClick={() => setEditUserModal(false)} style={{ padding: '10px 24px' }}>Cancel</button>
                <button type="submit" className="btn btn--glow" style={{ padding: '10px 24px', background: '#00ffb2', color: '#0b0e14' }}>Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

