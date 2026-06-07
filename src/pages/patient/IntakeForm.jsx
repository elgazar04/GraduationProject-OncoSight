import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePatientContext } from '../../contexts/PatientContext';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/shared/Icon';
import './PatientPages.css';

// Subcomponents for the Wizard
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="step-indicator" style={{ display: 'flex', gap: '8px', marginBottom: '32px', justifyContent: 'center' }}>
    {Array.from({ length: totalSteps }).map((_, idx) => (
      <div 
        key={idx} 
        style={{
          height: '6px',
          width: '100%',
          maxWidth: '40px',
          borderRadius: '10px',
          background: idx <= currentStep ? 'linear-gradient(90deg, #1e90ff, #00e5ff)' : 'rgba(255,255,255,0.1)',
          transition: 'background 0.4s ease'
        }}
      />
    ))}
  </div>
);

const FormStep = ({ children, isActive }) => (
  <div style={{ display: isActive ? 'block' : 'none', animation: 'fadeIn 0.4s ease' }}>
    {children}
  </div>
);

const SymptomChecklist = ({ formData, setFormData }) => (
  <div className="symptoms-grid">
    {[
      { key: 'symptom_headache', label: 'Severe Headaches' },
      { key: 'symptom_seizure', label: 'Seizures' },
      { key: 'symptom_vision', label: 'Vision Changes' },
      { key: 'symptom_cognitive', label: 'Cognitive/Memory Issues' }
    ].map(symp => (
      <button
        type="button"
        key={symp.key}
        className={`symptom-chip ${formData[symp.key] ? 'selected' : ''}`}
        onClick={() => setFormData({ ...formData, [symp.key]: !formData[symp.key] })}
      >
        {symp.label}
      </button>
    ))}
  </div>
);

const SeveritySlider = ({ value, onChange, label }) => (
  <div className="form-group" style={{ marginBottom: '24px' }}>
    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
      {label} 
      <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>{value} / 10</span>
    </label>
    <input 
      type="range" 
      min="1" 
      max="10" 
      value={value} 
      onChange={onChange}
      style={{ width: '100%', accentColor: '#1e90ff', height: '6px', outline: 'none' }}
    />
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
      <span>Mild</span>
      <span>Severe</span>
    </div>
  </div>
);

// Main Component
export default function IntakeWizard() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectMessage = location.state?.message;
  
  const { intakeData, updateIntakeData } = usePatientContext();
  const { user, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState(intakeData);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 6;

  // Sync state with active user profile from auth context
  useEffect(() => {
    if (user && user.profile) {
      const p = user.profile;
      setFormData({
        age: p.age !== null && p.age !== undefined ? p.age : '',
        gender: p.gender || '',
        smoking_status: p.smoking_status || 'Never',
        diabetes: p.diabetes === 1,
        hypertension: p.hypertension === 1,
        prior_cancer: p.family_cancer_history === 1,
        prior_brain_surgery: p.previous_treatment === 1,
        immunosuppressed: p.immunosuppressed === 1,
        seizures: p.seizure_history === 1,
        headache_severity: p.headache_severity || 5,
        symptom_duration_weeks: p.symptom_duration_weeks !== null && p.symptom_duration_weeks !== undefined ? p.symptom_duration_weeks : '',
        functional_status: p.functional_status === 'needs_some_help' ? 'Some help' : 
                           p.functional_status === 'needs_significant_help' ? 'Significant help' : 
                           p.functional_status === 'fully_dependent' ? 'Bed-bound' : 'Independent',
        neurological_symptoms: p.neurological_symptoms === 'mild' ? 1 : 
                               p.neurological_symptoms === 'moderate' ? 2 : 
                               p.neurological_symptoms === 'severe' ? 3 : 0
      });
    }
  }, [user]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://127.0.0.1:5000/api/auth/profile/patient', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user?.name,
          ...formData
        })
      });
      if (res.ok) {
        await refreshUser();
        updateIntakeData(formData);
        navigate('/patient/upload');
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to save health profile.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('An error occurred while saving your health profile.');
    }
  };

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '650px' }}>
        <h1 className="page-title" style={{ textAlign: 'center' }}>Clinical Medical Intake</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>Provide clinical details to guide the AI classification and suggestion engine</p>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {redirectMessage && (
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '0.95rem',
            fontWeight: 500,
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.3s ease'
          }}>
            <Icon name="warning" size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
            <span>{redirectMessage}</span>
          </div>
        )}

        <form className="intake-form" onSubmit={handleSubmit}>
          
          {/* Step 1: Personal Info */}
          <FormStep isActive={currentStep === 0}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#1e90ff' }}>1. Demographic Data</h3>
            <div className="form-group-row">
              <div className="form-group">
                <label>Age (years)</label>
                <input type="number" required min="0" max="120" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} placeholder="e.g. 45" />
              </div>
              <div className="form-group">
                <label>Biological Sex</label>
                <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </FormStep>

          {/* Step 2: Systemic History */}
          <FormStep isActive={currentStep === 1}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#1e90ff' }}>2. Systemic & Immunological History</h3>
            <div className="form-group-row">
              <div className="form-group">
                <label>Diabetes Diagnosis?</label>
                <select value={formData.diabetes ? 'yes' : 'no'} onChange={e => setFormData({...formData, diabetes: e.target.value === 'yes'})}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Hypertension Diagnosis?</label>
                <select value={formData.hypertension ? 'yes' : 'no'} onChange={e => setFormData({...formData, hypertension: e.target.value === 'yes'})}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
            <div className="form-group-row" style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label>Prior Cancer / Oncology History?</label>
                <select value={formData.prior_cancer ? 'yes' : 'no'} onChange={e => setFormData({...formData, prior_cancer: e.target.value === 'yes'})}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Immunosuppressed State?</label>
                <select value={formData.immunosuppressed ? 'yes' : 'no'} onChange={e => setFormData({...formData, immunosuppressed: e.target.value === 'yes'})}>
                  <option value="no">No</option>
                  <option value="yes">Yes (e.g., Chemo, Corticosteroids)</option>
                </select>
              </div>
            </div>
          </FormStep>

          {/* Step 3: Neurological History */}
          <FormStep isActive={currentStep === 2}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#1e90ff' }}>3. Neurological & Surgical History</h3>
            <div className="form-group">
              <label>Prior Brain Surgery?</label>
              <select value={formData.prior_brain_surgery ? 'yes' : 'no'} onChange={e => setFormData({...formData, prior_brain_surgery: e.target.value === 'yes'})}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>History of Seizures / Convulsions?</label>
              <select value={formData.seizures ? 'yes' : 'no'} onChange={e => setFormData({...formData, seizures: e.target.value === 'yes'})}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </FormStep>

          {/* Step 4: Current Symptoms */}
          <FormStep isActive={currentStep === 3}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#1e90ff' }}>4. Symptom Profile & Duration</h3>
            <div className="form-group">
              <label>Symptom Duration (weeks)</label>
              <input type="number" required min="1" max="1000" value={formData.symptom_duration_weeks} onChange={e => setFormData({...formData, symptom_duration_weeks: e.target.value})} placeholder="e.g. 4 weeks" />
            </div>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Neurological Symptoms Severity</label>
              <select value={formData.neurological_symptoms} onChange={e => setFormData({...formData, neurological_symptoms: parseInt(e.target.value)})}>
                <option value="0">None / Normal neurological status</option>
                <option value="1">Mild (Minor coordination/vision changes)</option>
                <option value="2">Moderate (Focal deficits, language difficulty)</option>
                <option value="3">Severe (Hemiparesis, cognitive deterioration)</option>
              </select>
            </div>

            <div style={{ marginTop: '20px' }}>
              <SeveritySlider 
                label="Headache Severity" 
                value={formData.headache_severity} 
                onChange={e => setFormData({...formData, headache_severity: parseInt(e.target.value)})} 
              />
            </div>
          </FormStep>

          {/* Step 5: Functional & Lifestyle */}
          <FormStep isActive={currentStep === 4}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#1e90ff' }}>5. Functional Status & Lifestyle</h3>
            <div className="form-group">
              <label>Functional Status (Independence Level)</label>
              <select value={formData.functional_status} onChange={e => setFormData({...formData, functional_status: e.target.value})}>
                <option value="Independent">Independent (Fully self-sufficient)</option>
                <option value="Some help">Some help (Needs minor daily assistance)</option>
                <option value="Significant help">Significant help (Requires intensive daily care)</option>
                <option value="Bed-bound">Bed-bound (Completely dependent)</option>
              </select>
            </div>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Smoking Status</label>
              <select value={formData.smoking_status} onChange={e => setFormData({...formData, smoking_status: e.target.value})}>
                <option value="Never">Never</option>
                <option value="Former">Former</option>
                <option value="Current">Current</option>
              </select>
            </div>
          </FormStep>

          {/* Step 6: Review */}
          <FormStep isActive={currentStep === 5}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#10b981' }}>6. Clinical Verification</h3>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.95rem', lineHeight: '2' }}>
              <p><strong>Age / Biological Sex:</strong> {formData.age || '--'}, {formData.gender || '--'}</p>
              <p><strong>Systemic Diseases:</strong> Diabetes ({formData.diabetes ? 'Yes' : 'No'}), Hypertension ({formData.hypertension ? 'Yes' : 'No'})</p>
              <p><strong>Cancer / Immunological:</strong> Prior Cancer ({formData.prior_cancer ? 'Yes' : 'No'}), Immunosuppressed ({formData.immunosuppressed ? 'Yes' : 'No'})</p>
              <p><strong>Neurological History:</strong> Prior Brain Surgery ({formData.prior_brain_surgery ? 'Yes' : 'No'}), Seizures ({formData.seizures ? 'Yes' : 'No'})</p>
              <p><strong>Symptom Profile:</strong> Duration ({formData.symptom_duration_weeks} weeks), Headache ({formData.headache_severity}/10), Neurological Deficit (Level {formData.neurological_symptoms})</p>
              <p><strong>Functional Status:</strong> {formData.functional_status} (Smoking: {formData.smoking_status})</p>
            </div>
          </FormStep>

          {/* Navigation Buttons */}
          <div className="form-actions" style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
            {currentStep > 0 && (
              <button type="button" className="btn btn--glass" onClick={handleBack} style={{ flex: 1, justifyContent: 'center' }}>
                Back
              </button>
            )}
            
            {currentStep < totalSteps - 1 ? (
              <button type="button" className="btn btn--glow" onClick={handleNext} style={{ flex: 1, justifyContent: 'center' }}>
                Next Step
              </button>
            ) : (
              <button type="submit" className="btn btn--glow" style={{ flex: 2, justifyContent: 'center', background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}>
                Confirm & Proceed to Scan
              </button>
            )}
          </div>

        </form>
      </div>
    </main>
  );
}
