import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="form-wrapper" style={{ maxWidth: '900px' }}>
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
          <div className="doctor-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filteredDoctors.map(doc => (
              <div key={doc.id} className="doctor-card" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', transition: 'transform 0.3s' }}>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=1e90ff&color=fff`} alt={doc.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '16px', border: '2px solid #1e90ff' }} />
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{doc.name}</h3>
                  <span style={{ color: '#00e5ff', fontSize: '0.9rem', marginBottom: '12px' }}>{doc.specialization}</span>
                  
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                    <span>⭐ {doc.average_rating || 'New'}</span>
                    <span>👨‍⚕️ {doc.years_experience} yrs</span>
                  </div>

                  <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
                    <Link to={`/patient/doctor/${doc.id}`} className="btn btn--glass" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }}>
                      Profile
                    </Link>
                    <Link to={`/patient/booking/${doc.id}`} className="btn btn--glow" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }}>
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {filteredDoctors.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No doctors found matching your criteria.</div>}
          </div>
        )}
      </div>
    </main>
  );
}
