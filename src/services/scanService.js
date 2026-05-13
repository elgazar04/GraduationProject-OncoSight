const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authHeader = () => {
  const token = localStorage.getItem('token');
  return { 'Authorization': `Bearer ${token}` };
};

export const scanService = {
  uploadScan: async (fileData, intakeData) => {
    const formData = new FormData();
    formData.append('image', fileData);
    formData.append('intakeData', JSON.stringify(intakeData));

    const response = await fetch(`${API_URL}/scans/upload`, {
      method: 'POST',
      headers: authHeader(),
      body: formData
    });

    if (!response.ok) throw new Error('Failed to upload scan');
    const data = await response.json();
    return { scanId: data.scanId };
  },

  getScanResults: async (scanId) => {
    // We will poll the backend slightly in the loader component,
    // but when it gets here it expects the final results.
    const response = await fetch(`${API_URL}/scans/${scanId}`, {
      headers: authHeader()
    });

    if (!response.ok) throw new Error('Failed to get scan results');
    const data = await response.json();
    
    // Map backend schema to frontend expectation
    return {
      id: data._id,
      classification: data.results.classification,
      confidence: data.results.confidence,
      location: data.results.location,
      area: data.results.area,
      diameter: data.results.diameter,
      treatmentSuggestion: data.results.treatmentSuggestion,
      urgencyScore: data.results.urgencyScore,
      triage: data.results.triageTier,
      date: data.uploadDate
    };
  },

  getHistory: async () => {
    const response = await fetch(`${API_URL}/scans/history/me`, {
      headers: authHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    const data = await response.json();
    return data.map(scan => ({
      id: scan._id,
      date: scan.uploadDate,
      status: scan.status,
      classification: scan.results?.classification || 'Processing',
      confidence: scan.results?.confidence || 0
    }));
  },

  downloadReport: async (scanId) => {
    console.log(`Mock generating PDF report for ${scanId}`);
    return new Promise(resolve => setTimeout(() => resolve({ url: '#' }), 1000));
  },

  shareWithDoctor: async (scanId, doctorId) => {
    console.log(`Mock sharing scan ${scanId} with doctor ${doctorId}`);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
  }
};

