import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Icon from './Icon';
import ChatWindow from './ChatWindow';
import './SharedComponents.css';

export default function FloatingChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [activeConsultationId, setActiveConsultationId] = useState(null);
  const [activeContactName, setActiveContactName] = useState('');
  const [loading, setLoading] = useState(false);

  // Don't render if not logged in or admin
  if (!user || user.role === 'admin') return null;

  const fetchConsultationsForChat = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/consultations/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter consultations to only show accepted, completed, or in_progress ones (valid chats)
        const validChats = data.filter(c => ['accepted', 'completed', 'in_progress', 'pending'].includes(c.status));
        setConsultations(validChats);
      }
    } catch (err) {
      console.error('Error fetching consultations for chat', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConsultationsForChat();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpenChatEvent = (e) => {
      const { consultationId, contactName } = e.detail;
      setIsOpen(true);
      setActiveConsultationId(consultationId);
      setActiveContactName(contactName || 'Chat');
    };
    window.addEventListener('open-chat', handleOpenChatEvent);
    return () => window.removeEventListener('open-chat', handleOpenChatEvent);
  }, []);

  const handleSelectChat = (consultationId, contactName) => {
    setActiveConsultationId(consultationId);
    setActiveContactName(contactName);
  };

  const handleBackToList = () => {
    setActiveConsultationId(null);
    setActiveContactName('');
    fetchConsultationsForChat(); // refresh list
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: "'Space Grotesk', 'Rajdhani', sans-serif" }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00FFB2, #00E5FF)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)',
            transition: 'all 0.3s ease',
            color: '#0b0e14'
          }}
          title="Open Consultation Chat"
        >
          <Icon name="chat" size={24} color="#0b0e14" />
        </button>
      )}

      {/* Chat Expanded Panel */}
      {isOpen && (
        <div style={{
          width: '380px',
          height: '500px',
          background: '#121212',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: '#181818',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeConsultationId && (
                <button
                  onClick={handleBackToList}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--neon-cyan)',
                    cursor: 'pointer',
                    padding: 0,
                    marginRight: '6px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              )}
              <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>
                {activeConsultationId ? activeContactName : 'Consultation Chats'}
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <Icon name="x" size={18} color="var(--text-tertiary)" />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {activeConsultationId ? (
              // Renders ChatWindow for selected booking session
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <ChatWindow 
                  consultationId={activeConsultationId} 
                  currentUserRole={user.role} 
                  currentUserId={user.id} 
                />
              </div>
            ) : (
              // Renders Booking Contacts list
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {loading && consultations.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0', fontSize: '0.9rem' }}>
                    Loading active channels...
                  </div>
                ) : consultations.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: 'var(--text-tertiary)',
                    padding: '60px 20px',
                    fontSize: '0.9rem',
                    border: '1px dashed rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px'
                  }}>
                    No active consultation bookings found to start a conversation.
                  </div>
                ) : (
                  consultations.map(c => {
                    const isPatient = user.role === 'patient';
                    const contactName = isPatient ? `Dr. ${c.doctor_name}` : c.patient_name;
                    const metaLabel = isPatient ? c.specialization : `Scan: ${c.tumor_type || 'Unclassified'}`;
                    
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectChat(c.id, contactName)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'rgba(255, 255, 255, 0.01)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.borderColor = 'var(--neon-cyan)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem', marginBottom: '3px' }}>{contactName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{metaLabel}</div>
                        </div>
                        <span style={{
                          fontSize: '0.7rem',
                          background: c.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: c.status === 'completed' ? '#10b981' : '#f59e0b',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {c.status}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
