import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PatientPages.css';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/doctors/${id}`);
        if (res.ok) {
          setDoctor(await res.json());
        }
      } catch (err) {
        console.error('Error fetching doctor details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', color: 'white' }}>Loading doctor profile...</div>;
  if (!doctor) return <div style={{ padding: '100px', textAlign: 'center', color: 'white' }}>Doctor not found</div>;

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '32px', marginBottom: '32px' }}>
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=1e90ff&color=fff&size=150`} alt={doctor.name} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #1e90ff' }} />
          <div>
            <h1 className="page-title" style={{ textAlign: 'left', marginBottom: '8px' }}>{doctor.name}</h1>
            <h3 style={{ color: '#00e5ff', fontSize: '1.2rem', marginBottom: '16px' }}>{doctor.specialization}</h3>
            <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)' }}>
              <span>⭐ {doctor.average_rating || 'New'} Rating</span>
              <span>👨‍⚕️ {doctor.years_experience} Years Exp.</span>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px' }}>
              <Link to={`/patient/booking/${doctor.id}`} className="btn btn--glow" style={{ padding: '12px 32px' }}>Book Consultation</Link>
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>About</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
            {doctor.name} is a board-certified {doctor.specialization} with {doctor.years_experience} years of experience. They specialize in integrating AI-assisted diagnostic tools into clinical practice to provide the most accurate and timely care for patients.
          </p>

          <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Patient Reviews</h2>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '24px' }}>
            {doctor.average_rating ? (
              <p style={{ color: 'var(--text-secondary)' }}>Reviews will be displayed here in a future update.</p>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
