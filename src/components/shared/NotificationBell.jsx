import React, { useState, useEffect } from 'react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'scan_completed': return '🧠';
      case 'consultation_requested': return '📅';
      case 'consultation_accepted': return '✅';
      case 'consultation_declined': return '❌';
      case 'notes_available': return '📝';
      case 'new_message': return '💬';
      case 'doctor_verified': return '⚕️';
      default: return '🔔';
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', position: 'relative' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0, background: '#ef4444', color: 'white',
            borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: '0', width: '300px', maxHeight: '400px', overflowY: 'auto',
          background: '#0B4F6C', border: '1px solid rgba(1, 186, 239, 0.3)', borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 1000, marginTop: '12px'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 'bold' }}>
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No notifications yet.
            </div>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                onClick={() => { if (!n.is_read) markAsRead(n.id); }}
                style={{ 
                  padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: n.is_read ? 'transparent' : 'rgba(1, 186, 239, 0.1)',
                  cursor: 'pointer', display: 'flex', gap: '12px', transition: 'background 0.2s'
                }}
              >
                <div style={{ fontSize: '1.2rem' }}>{getIconForType(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', marginBottom: '4px', color: n.is_read ? 'var(--text-secondary)' : 'white' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                {!n.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#01BAEF', alignSelf: 'center' }} />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
