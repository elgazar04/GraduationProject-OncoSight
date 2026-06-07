import { useState, useEffect } from 'react';
import '../patient/PatientPages.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError('Failed to retrieve user accounts');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
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
        alert('Failed to update account status');
      }
    } catch (err) {
      console.error(err);
      alert('Communication error occurred');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1000px' }}>
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Inspect, activate, and deactivate user profiles across the network.</p>

        <div className="form-group" style={{ marginBottom: '24px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 20px', borderRadius: '12px' }}
          />
        </div>

        {error && <div className="alert-message error" style={{ marginBottom: '20px' }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            Loading user records...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            No matching users found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredUsers.map(u => (
              <div key={u.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.02)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    {u.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>Email: {u.email}</span>
                    <span>•</span>
                    <span style={{
                      textTransform: 'uppercase',
                      color: u.role === 'admin' ? '#00e5ff' : u.role === 'doctor' ? '#00ffb2' : '#f59e0b',
                      fontWeight: 600
                    }}>{u.role}</span>
                    <span>•</span>
                    <span>Registered: {new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <button
                    className="btn"
                    onClick={() => handleToggleStatus(u.id, u.is_active)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      background: u.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 255, 178, 0.1)',
                      color: u.is_active ? '#ef4444' : '#00ffb2',
                      border: `1px solid ${u.is_active ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 255, 178, 0.3)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
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
