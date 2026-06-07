import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { usePatientContext } from '../../contexts/PatientContext';
import Icon from '../../components/shared/Icon';
import './PatientPages.css';

export default function Booking() {
  const { doctorId } = useParams();
  const { analysisResults } = usePatientContext();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [type, setType] = useState('video');
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isUrgent = analysisResults?.triage?.level === 2 || analysisResults?.triageTier?.level === 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Clean time string if Priority suffix exists
    const cleanTime = selectedTime.includes('(') ? selectedTime.split(' ')[0] : selectedTime;
    
    try {
      const token = localStorage.getItem('token');
      const scanId = analysisResults?.id || analysisResults?._id || localStorage.getItem('last_scan_id');
      
      const res = await fetch('http://localhost:5000/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          scan_id: scanId,
          doctor_id: doctorId,
          date: selectedDate,
          time: cleanTime
        })
      });
      
      if (res.ok) {
        setBooked(true);
      } else {
        const errorData = await res.json();
        const msg = errorData.error?.message || errorData.message || 'An unknown error occurred.';
        alert('Booking failed: ' + msg);
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (booked) {
    return (
      <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center' }}>
        <div className="form-wrapper" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <Icon name="checkCircle" size={80} color="#00ffb2" />
          </div>
          <h1 className="page-title">Appointment Confirmed!</h1>
          <p className="page-subtitle">Your {type} consultation is scheduled for {selectedDate} at {selectedTime}.</p>
          <div style={{ marginTop: '32px' }}>
            <Link to="/patient/dashboard" className="btn btn--glow" style={{ width: '100%', justifyContent: 'center' }}>Return to Dashboard</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '600px' }}>
        <h1 className="page-title">Book Consultation</h1>
        <p className="page-subtitle">Schedule an appointment to discuss your scan results.</p>

        {isUrgent && (
          <div style={{ background: 'rgba(245,158,11,0.1)', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '0 8px 8px 0', marginBottom: '24px' }}>
            <div style={{ color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="warning" size={16} color="#f59e0b" /> AI Triage: Priority Access Unlocked
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Due to the urgency of your scan results, we have unlocked priority appointment slots for you to see a specialist within 24-48 hours.
            </div>
          </div>
        )}

        <form className="intake-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Date</label>
            <input type="date" required onChange={(e) => setSelectedDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Select Time Slot</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} onChange={(e) => setSelectedTime(e.target.value)}>
              {isUrgent && (
                <label className="time-slot" style={{ display: 'flex' }}>
                  <input type="radio" name="time" value="08:00 (Priority)" style={{ display: 'none' }} />
                  <span style={{ padding: '12px', border: '1px solid #f59e0b', borderRadius: '8px', width: '100%', textAlign: 'center', cursor: 'pointer', color: '#f59e0b' }}>08:00 AM*</span>
                </label>
              )}
              <label className="time-slot" style={{ display: 'flex' }}>
                <input type="radio" name="time" value="09:00" style={{ display: 'none' }} />
                <span style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '100%', textAlign: 'center', cursor: 'pointer' }}>09:00 AM</span>
              </label>
              <label className="time-slot" style={{ display: 'flex' }}>
                <input type="radio" name="time" value="11:30" style={{ display: 'none' }} />
                <span style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '100%', textAlign: 'center', cursor: 'pointer' }}>11:30 AM</span>
              </label>
              <label className="time-slot" style={{ display: 'flex' }}>
                <input type="radio" name="time" value="14:00" style={{ display: 'none' }} />
                <span style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '100%', textAlign: 'center', cursor: 'pointer' }}>02:00 PM</span>
              </label>
            </div>
            <style>{`
              .time-slot input:checked + span {
                background: rgba(30,144,255,0.2);
                border-color: #1e90ff;
                color: #fff;
              }
            `}</style>
          </div>

          <div className="form-group">
            <label>Consultation Type</label>
            <select required>
              <option value="video">Video Call (Telehealth)</option>
              <option value="in_person">In-Person Clinic Visit</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes for Doctor (Optional)</label>
            <textarea 
              rows="4" 
              placeholder="Any specific concerns..."
              style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
            ></textarea>
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="submit" className="btn btn--glow" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
