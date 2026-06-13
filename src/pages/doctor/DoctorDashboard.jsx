import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FloatingChat from '../../components/shared/FloatingChat';
import '../patient/PatientPages.css';

export default function DoctorDashboard() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    specialization: '',
    years_experience: '',
    license_file_path: '',
    bio: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Slots State
  const [activeTab, setActiveTab] = useState('queue');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('');
  const [slotError, setSlotError] = useState('');

  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/doctors/me/slots', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSaveSlot = async (e) => {
    e.preventDefault();
    setSlotError('');
    try {
      const token = localStorage.getItem('token');
      const url = editingSlot 
        ? `http://localhost:5000/api/doctors/me/slots/${editingSlot.id}`
        : 'http://localhost:5000/api/doctors/me/slots';
      const method = editingSlot ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          slot_date: slotDate,
          slot_time: slotTime,
          is_reserved: editingSlot ? editingSlot.is_reserved : false
        })
      });

      if (res.ok) {
        setIsSlotModalOpen(false);
        setEditingSlot(null);
        setSlotDate('');
        setSlotTime('');
        fetchSlots();
      } else {
        const errData = await res.json();
        setSlotError(errData.message || 'Failed to save slot');
      }
    } catch (err) {
      console.error(err);
      setSlotError('Connection failed.');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/doctors/me/slots/${slotId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSlots();
      } else {
        setError('Failed to delete slot.');
      }
    } catch (err) {
      setError('Network error: Failed to delete slot.');
    }
  };

  const handleToggleSlotReservation = async (slot) => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/doctors/me/slots/${slot.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          slot_date: slot.slot_date,
          slot_time: slot.slot_time,
          is_reserved: !slot.is_reserved
        })
      });
      if (res.ok) {
        fetchSlots();
      } else {
        setError('Failed to update slot reservation status.');
      }
    } catch (err) {
      setError('Network error: Failed to update slot reservation status.');
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData({
          name: data.name || '',
          specialization: data.profile?.specialization || '',
          years_experience: data.profile?.years_experience || '',
          license_file_path: data.profile?.license_file_path || '',
          bio: data.profile?.bio || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/consultations/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConsultations(data);
      } else {
        setError('Failed to fetch patient queue.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please verify API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
    fetchProfile();
    fetchSlots();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/profile/doctor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profileData.name,
          specialization: profileData.specialization,
          years_experience: parseInt(profileData.years_experience) || 0,
          license_file_path: profileData.license_file_path,
          bio: profileData.bio
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchConsultations();
        fetchProfile();
      } else {
        const errData = await res.json();
        setSaveError(errData.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      setSaveError('Failed to save profile. Try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const pendingCount = consultations.filter(c => c.status === 'pending' || c.status === 'accepted' || c.status === 'in_progress').length;
  const completedCount = consultations.filter(c => c.status === 'completed').length;
  
  const todayStr = new Date().toDateString();
  const todayCount = consultations.filter(c => new Date(c.meeting_time).toDateString() === todayStr).length;

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Doctor Dashboard</h1>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>Welcome back. Here is your patient queue and review metrics.</p>
          </div>
          <button 
            className="btn btn--glow" 
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '10px 24px', fontSize: '0.85rem' }}
          >
            Edit Profile & Bio
          </button>
        </div>

        {error && <div className="alert-message error" style={{ marginBottom: '20px' }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: 'rgba(245,158,11,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <h3 style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>{pendingCount}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Pending Reviews</p>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
            <h3 style={{ color: '#10b981', fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>{completedCount}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Completed Reviews</p>
          </div>
          <div style={{ background: 'rgba(0,229,255,0.1)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,229,255,0.2)' }}>
            <h3 style={{ color: '#00e5ff', fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>{todayCount}</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Consultations Today</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px', paddingBottom: '2px' }}>
          <button 
            type="button"
            onClick={() => setActiveTab('queue')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'queue' ? '2px solid var(--neon-cyan)' : '2px solid transparent',
              color: activeTab === 'queue' ? '#fff' : 'var(--text-secondary)',
              padding: '8px 16px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          >
            Patient Queue ({consultations.length})
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('slots')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'slots' ? '2px solid var(--neon-cyan)' : '2px solid transparent',
              color: activeTab === 'slots' ? '#fff' : 'var(--text-secondary)',
              padding: '8px 16px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          >
            Availability Slots ({slots.length})
          </button>
        </div>

        {activeTab === 'queue' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                Loading queue...
              </div>
            ) : consultations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                Your consultation queue is empty.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {consultations.map(c => {
                  const dateStr = new Date(c.meeting_time).toLocaleDateString();
                  const timeStr = new Date(c.meeting_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  let tierColor = '#10b981';
                  let tierText = 'Routine';
                  if (c.triage_tier === 'emergency' || c.triage_tier === '1' || c.triage_tier === 1) {
                    tierColor = '#ef4444';
                    tierText = 'Emergency';
                  } else if (c.triage_tier === 'urgent' || c.triage_tier === '2' || c.triage_tier === 2) {
                    tierColor = '#f59e0b';
                    tierText = 'Urgent';
                  }

                  return (
                    <div key={c.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '20px',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(10px)',
                      gap: '20px',
                      flexWrap: 'wrap'
                    }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                          {c.patient_name}
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <span>Schedule: {dateStr} at {timeStr}</span>
                          <span>•</span>
                          <span>AI Finding: <strong style={{ color: '#00e5ff' }}>{c.tumor_type || 'Processing'}</strong></span>
                          <span>•</span>
                          <span>Status: <strong style={{ textTransform: 'capitalize', color: c.status === 'completed' ? '#10b981' : '#f59e0b' }}>{c.status}</strong></span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ 
                          padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                          background: `${tierColor}15`,
                          color: tierColor,
                          border: `1px solid ${tierColor}30`,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginRight: '8px'
                        }}>
                          {tierText}
                        </span>
                        <Link to={`/doctor/patient/${c.id}`} className="btn btn--glass" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                          View Clinical Profile
                        </Link>
                        <button
                          type="button"
                          className="btn btn--glow"
                          style={{ padding: '8px 16px', fontSize: '0.85rem', border: 'none', background: 'var(--neon-cyan)', color: '#0b0e14' }}
                          onClick={() => {
                            const event = new CustomEvent('open-chat', {
                              detail: { consultationId: c.id, contactName: c.patient_name }
                            });
                            window.dispatchEvent(event);
                          }}
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'slots' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>Manage Availability Slots</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>Click "Available" or "Reserved" status badges to toggle manually.</p>
              </div>
              <button 
                type="button"
                className="btn btn--glow" 
                onClick={() => {
                  setEditingSlot(null);
                  setSlotDate('');
                  setSlotTime('');
                  setSlotError('');
                  setIsSlotModalOpen(true);
                }}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                + Add New Slot
              </button>
            </div>

            {slotsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                Loading slots...
              </div>
            ) : slots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                No availability slots defined yet. Click "+ Add New Slot" to specify when patients can book.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {slots.map(s => (
                  <div key={s.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    gap: '20px',
                    flexWrap: 'wrap'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', margin: 0 }}>
                        {new Date(s.slot_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </h4>
                      <span style={{ fontSize: '0.9rem', color: 'var(--neon-cyan)', fontWeight: 500 }}>
                        Time: {s.slot_time}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button 
                        type="button"
                        onClick={() => handleToggleSlotReservation(s)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: s.is_reserved ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                          color: s.is_reserved ? '#ef4444' : '#10b981',
                          border: `1px solid ${s.is_reserved ? '#ef4444' : '#10b981'}40`,
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        {s.is_reserved ? 'Reserved' : 'Available'}
                      </button>
                      <button 
                        type="button"
                        className="btn btn--glass"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        onClick={() => {
                          setEditingSlot(s);
                          setSlotDate(s.slot_date);
                          setSlotTime(s.slot_time);
                          setSlotError('');
                          setIsSlotModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        type="button"
                        className="btn"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                        onClick={() => handleDeleteSlot(s.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Edit Profile Modal */}
        {isModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div className="form-wrapper" style={{ maxWidth: '600px', width: '100%', position: 'relative', borderTop: '4px solid var(--neon-cyan)', animation: 'none' }}>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', outline: 'none' }}
              >
                ✕
              </button>
              
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#fff' }}>Edit Profile & Bio</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>Update your public information displayed to patients.</p>

              {saveError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  {saveError}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="intake-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={profileData.name} 
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })} 
                    placeholder="e.g. Dr. John Carter"
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Specialty</label>
                    <select 
                      required 
                      value={profileData.specialization} 
                      onChange={e => setProfileData({ ...profileData, specialization: e.target.value })}
                    >
                      <option value="">Select Specialty</option>
                      <option value="neuro-oncologist">Neuro-Oncologist</option>
                      <option value="neurosurgeon">Neurosurgeon</option>
                      <option value="neurologist">Neurologist</option>
                      <option value="radiologist">Radiologist</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Years of Experience</label>
                    <input 
                      type="number" 
                      required 
                      min="0" 
                      max="60" 
                      value={profileData.years_experience} 
                      onChange={e => setProfileData({ ...profileData, years_experience: e.target.value })} 
                      placeholder="e.g. 15"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Medical License Number</label>
                  <input 
                    type="text" 
                    required 
                    value={profileData.license_file_path} 
                    onChange={e => setProfileData({ ...profileData, license_file_path: e.target.value })} 
                    placeholder="For verification"
                  />
                </div>

                <div className="form-group">
                  <label>Biography / Professional Summary</label>
                  <textarea 
                    value={profileData.bio} 
                    onChange={e => setProfileData({ ...profileData, bio: e.target.value })} 
                    placeholder="Describe your credentials, background, and clinical focus..."
                    rows="4"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', color: '#fff', width: '100%', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="button" className="btn btn--glass" onClick={() => setIsModalOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                  <button type="submit" className="btn btn--glow" disabled={saveLoading} style={{ flex: 1, justifyContent: 'center' }}>
                    {saveLoading ? 'Saving Changes...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Slot Management Modal */}
        {isSlotModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div className="form-wrapper" style={{ maxWidth: '450px', width: '100%', position: 'relative', borderTop: '4px solid var(--neon-cyan)', animation: 'none' }}>
              <button 
                type="button"
                onClick={() => setIsSlotModalOpen(false)} 
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem', outline: 'none' }}
              >
                ✕
              </button>
              
              <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#fff' }}>
                {editingSlot ? 'Edit Time Slot' : 'Add Availability Slot'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                {editingSlot ? 'Modify the selected slot details.' : 'Define a date and time you will be available for consultations.'}
              </p>

              {slotError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
                  {slotError}
                </div>
              )}

              <form onSubmit={handleSaveSlot} className="intake-form">
                <div className="form-group">
                  <label>Select Date</label>
                  <input 
                    type="date" 
                    required 
                    value={slotDate} 
                    onChange={e => setSlotDate(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Select Time</label>
                  <input 
                    type="time" 
                    required 
                    value={slotTime} 
                    onChange={e => setSlotTime(e.target.value)} 
                  />
                </div>

                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="button" className="btn btn--glass" onClick={() => setIsSlotModalOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                  <button type="submit" className="btn btn--glow" style={{ flex: 1, justifyContent: 'center' }}>
                    {editingSlot ? 'Save Changes' : 'Create Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <FloatingChat />
    </main>
  );
}
