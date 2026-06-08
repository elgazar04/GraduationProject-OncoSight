import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/shared/Icon';
import './PatientPages.css';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All Specialties');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/doctors');
        if (res.ok) {
          setDoctors(await res.json());
        }
      } catch (err) {
        console.error('Error fetching doctors', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'All Specialties' || doc.specialization === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '100%', width: '100%' }}>
        <h1 className="page-title">Specialist Directory</h1>
        <p className="page-subtitle">Find and connect with top-rated neurologists and oncologists for your specific needs.</p>

        <div className="filters-bar" style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <input 
            type="text" 
            placeholder="Search by name or specialty..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} 
          />
          <select 
            value={specialtyFilter}
            onChange={e => setSpecialtyFilter(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
          >
            <option>All Specialties</option>
            <option>Neuro-Oncologist</option>
            <option>Neurosurgeon</option>
            <option>Neurologist</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading verified doctors...</div>
        ) : (
          <div className="doctor-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredDoctors.map(doc => (
              <div key={doc.id} className="doctor-list-item" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '40px 32px', display: 'flex', gap: '24px', alignItems: 'center', minHeight: '180px' }}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=1e90ff&color=fff&size=100`} alt={doc.name} style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1e90ff', flexShrink: 0 }} />
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="doctor-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', margin: '0 0 2px 0', color: '#fff' }}>{doc.name}</h3>
                      <span style={{ color: '#00e5ff', fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>{doc.specialization}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="star" size={14} color="#ffd700" />
                        {doc.average_rating || 'New'} Rating
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="stethoscope" size={14} color="#00e5ff" />
                        {doc.years_experience || 0} Yrs Exp
                      </span>
                    </div>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                    {doc.bio ? (
                      doc.bio.length > 180 ? `${doc.bio.substring(0, 180)}...` : doc.bio
                    ) : (
                      `${doc.name} is a board-certified ${doc.specialization} with ${doc.years_experience || 0} years of clinical experience. They specialize in integrating AI-assisted diagnostic tools into neuro-oncology treatment pathways to deliver precise patient outcomes.`
                    )}
                  </p>
                </div>

                <div className="doctor-list-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '180px', flexShrink: 0 }}>
                  <Link to={`/doctors/${doc.id}`} className="btn btn--glass" style={{ width: '100%', padding: '10px', fontSize: '0.85rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="user" size={14} /> View Profile
                  </Link>
                  <Link to={`/patient/booking/${doc.id}`} className="btn btn--glow" style={{ width: '100%', padding: '10px', fontSize: '0.85rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="calendar" size={14} /> Book Consultation
                  </Link>
                </div>
              </div>
            ))}
            {filteredDoctors.length === 0 && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No doctors found matching your criteria.</div>}
            
            <style>{`
              @media (max-width: 768px) {
                .doctor-list-item {
                  flex-direction: column !important;
                  align-items: center !important;
                  text-align: center !important;
                  padding: 20px !important;
                }
                .doctor-list-header {
                  flex-direction: column !important;
                  align-items: center !important;
                  gap: 12px !important;
                }
                .doctor-list-actions {
                  width: 100% !important;
                  flex-direction: row !important;
                }
                .doctor-list-actions a {
                  flex: 1 !important;
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </main>
  );
}
