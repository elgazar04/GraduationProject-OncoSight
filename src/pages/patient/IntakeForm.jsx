import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientContext } from '../../contexts/PatientContext';
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
  const { intakeData, updateIntakeData } = usePatientContext();
  const [formData, setFormData] = useState(intakeData);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateIntakeData(formData);
    navigate('/patient/upload');
  };

  return (
    <main className="page-container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 80px)' }}>
      <div className="form-wrapper" style={{ maxWidth: '650px' }}>
        <h1 className="page-title" style={{ textAlign: 'center' }}>Medical Intake</h1>
        <p className="page-subtitle" style={{ textAlign: 'center' }}>Please provide context for the AI analysis</p>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <form className="intake-form" onSubmit={handleSubmit}>
          
          {/* Step 1: Personal Info */}
          <FormStep isActive={currentStep === 0}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#1e90ff' }}>1. Personal Information</h3>
            <div className="form-group-row">
              <div className="form-group">
                <label>Age</label>
                <input type="number" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} placeholder="e.g. 45" />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label>Weight (kg)</label>
                <input type="number" required value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 70" />
              </div>
              <div className="form-group">
                <label>Height (cm)</label>
                <input type="number" required value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="e.g. 175" />
              </div>
            </div>
          </FormStep>

          {/* Step 2: Medical History */}
          <FormStep isActive={currentStep === 1}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#1e90ff' }}>2. Medical History</h3>
            <div className="form-group">
              <label>Family history of brain tumors?</label>
              <select value={formData.tumor_history_family} onChange={e => setFormData({...formData, tumor_history_family: e.target.value})}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="form-group">
              <label>Prior Brain Surgery?</label>
              <select value={formData.prior_surgery} onChange={e => setFormData({...formData, prior_surgery: e.target.value})}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label>Prior Radiation?</label>
                <select value={formData.prior_radiation} onChange={e => setFormData({...formData, prior_radiation: e.target.value})}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Prior Chemotherapy?</label>
                <select value={formData.prior_chemo} onChange={e => setFormData({...formData, prior_chemo: e.target.value})}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>
          </FormStep>

          {/* Step 3: Current Symptoms */}
          <FormStep isActive={currentStep === 2}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#1e90ff' }}>3. Current Symptoms</h3>
            <div className="form-group">
              <label>Select all that apply:</label>
              <SymptomChecklist formData={formData} setFormData={setFormData} />
            </div>
          </FormStep>

          {/* Step 4: Symptom Details */}
          <FormStep isActive={currentStep === 3}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#1e90ff' }}>4. Symptom Details</h3>
            <div className="form-group">
              <label>How many months have you experienced these?</label>
              <input type="number" required={formData.symptom_headache || formData.symptom_seizure || formData.symptom_vision || formData.symptom_cognitive} value={formData.symptom_duration_months} onChange={e => setFormData({...formData, symptom_duration_months: e.target.value})} placeholder="e.g. 3" />
            </div>
            <SeveritySlider 
              label="Overall Symptom Severity" 
              value={formData.symptom_severity} 
              onChange={e => setFormData({...formData, symptom_severity: e.target.value})} 
            />
          </FormStep>

          {/* Step 5: Lifestyle */}
          <FormStep isActive={currentStep === 4}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#1e90ff' }}>5. Lifestyle & Health</h3>
            <div className="form-group">
              <label>Smoking Status</label>
              <select value={formData.smoking_status} onChange={e => setFormData({...formData, smoking_status: e.target.value})}>
                <option value="never">Never Smoked</option>
                <option value="former">Former Smoker</option>
                <option value="current">Current Smoker</option>
              </select>
            </div>
            <SeveritySlider 
              label="Overall Health Score (1=Poor, 10=Excellent)" 
              value={formData.overall_health_score} 
              onChange={e => setFormData({...formData, overall_health_score: e.target.value})} 
            />
          </FormStep>

          {/* Step 6: Review */}
          <FormStep isActive={currentStep === 5}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '24px', color: '#10b981' }}>6. Review & Submit</h3>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <p><strong>Age/Gender:</strong> {formData.age || '--'}, {formData.gender || '--'}</p>
              <p><strong>Family History:</strong> {formData.tumor_history_family}</p>
              <p><strong>Symptoms:</strong> {
                [
                  formData.symptom_headache && 'Headaches',
                  formData.symptom_seizure && 'Seizures',
                  formData.symptom_vision && 'Vision',
                  formData.symptom_cognitive && 'Cognitive'
                ].filter(Boolean).join(', ') || 'None'
              } (Severity: {formData.symptom_severity}/10)</p>
              <p><strong>Prior Treatments:</strong> Surgery({formData.prior_surgery}), Radiation({formData.prior_radiation}), Chemo({formData.prior_chemo})</p>
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
