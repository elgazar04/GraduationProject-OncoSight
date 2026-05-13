import { createContext, useContext, useState } from 'react';

const PatientContext = createContext();

export function usePatientContext() {
  return useContext(PatientContext);
}

export function PatientProvider({ children }) {
  const [intakeData, setIntakeData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    tumor_history_family: 'no',
    symptom_headache: false,
    symptom_seizure: false,
    symptom_vision: false,
    symptom_cognitive: false,
    symptom_duration_months: '',
    symptom_severity: 5,
    prior_surgery: 'no',
    prior_radiation: 'no',
    prior_chemo: 'no',
    smoking_status: 'never',
    overall_health_score: 5
  });

  const [currentScan, setCurrentScan] = useState(null); // Will hold the image data URL
  
  const [analysisResults, setAnalysisResults] = useState(null);

  const updateIntakeData = (data) => {
    setIntakeData(data);
  };

  const uploadScan = (imageData) => {
    setCurrentScan(imageData);
  };

  const setResults = (results) => {
    setAnalysisResults(results);
  };

  const resetFlow = () => {
    setIntakeData({ age: '', gender: '', symptoms: [], duration: '', previousScans: 'no' });
    setCurrentScan(null);
    setAnalysisResults(null);
  };

  const value = {
    intakeData,
    updateIntakeData,
    currentScan,
    uploadScan,
    analysisResults,
    setResults,
    resetFlow
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
}
