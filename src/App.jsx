import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Icon from './components/shared/Icon';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PatientProvider } from './contexts/PatientContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import CursorFollower from './components/shared/CursorFollower';
import HomePage from './pages/public/HomePage';
import SharedScan from './pages/public/SharedScan';
import TumorInfo from './pages/public/TumorInfo';
import FAQ from './pages/public/FAQ';
import IntakeForm from './pages/patient/IntakeForm';
import MriUpload from './pages/patient/MriUpload';
import ScanResults from './pages/patient/ScanResults';
import AnalysisLoader from './pages/patient/AnalysisLoader';
import ScanHistory from './pages/patient/ScanHistory';
import Dashboard from './pages/patient/Dashboard';
import DoctorList from './pages/patient/DoctorList';
import DoctorProfile from './pages/patient/DoctorProfile';
import Booking from './pages/patient/Booking';
import Login from './pages/auth/Login';
import PatientRegister from './pages/auth/PatientRegister';
import DoctorRegister from './pages/auth/DoctorRegister';
import Profile from './pages/auth/Profile';
import ProtectedRoute from './components/shared/ProtectedRoute';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDetail from './pages/doctor/PatientDetail';
import DoctorConsultations from './pages/doctor/DoctorConsultations';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <PatientProvider>
            <BrowserRouter>
          <CursorFollower />
          <Header />
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/shared/:token" element={<SharedScan />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<PatientRegister />} />
            <Route path="/register/doctor" element={<DoctorRegister />} />

            {/* Protected Patient Routes */}
            <Route element={<ProtectedRoute allowedRoles={['patient', 'admin']} />}>
              <Route path="/patient/intake" element={<IntakeForm />} />
              <Route path="/patient/upload" element={<MriUpload />} />
              <Route path="/patient/analysis/:scanId" element={<AnalysisLoader />} />
              <Route path="/patient/results/:scanId" element={<ScanResults />} />
              <Route path="/patient/history" element={<ScanHistory />} />
              <Route path="/patient/doctors" element={<DoctorList />} />
              <Route path="/patient/doctor/:id" element={<DoctorProfile />} />
              <Route path="/patient/booking/:doctorId" element={<Booking />} />
              <Route path="/patient/consultations" element={<ComingSoon title="My Consultations" />} />
              <Route path="/patient/profile" element={<Profile />} />
              <Route path="/patient/dashboard" element={<Dashboard />} />
            </Route>

            {/* Protected Doctor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['doctor', 'admin']} />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/patients" element={<ComingSoon title="My Patients" />} />
              <Route path="/doctor/patient/:id" element={<PatientDetail />} />
              <Route path="/doctor/consultations" element={<DoctorConsultations />} />
              <Route path="/doctor/profile" element={<Profile />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/doctors/verify" element={<AdminDashboard />} />
              <Route path="/admin/stats" element={<AdminDashboard />} />
            </Route>

            {/* Info */}
            <Route path="/info/tumors" element={<TumorInfo />} />
            <Route path="/info/faq" element={<FAQ />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          </BrowserRouter>
        </PatientProvider>
      </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

function ComingSoon({ title }) {
  return (
    <main style={{
      minHeight: 'calc(100vh - var(--header-height) - 200px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      textAlign: 'center',
    }}>
      <span style={{ fontSize: '4rem', marginBottom: '16px' }}>🚧</span>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>This page is coming soon in the next phase!</p>
    </main>
  );
}

function NotFound() {
  return (
    <main style={{
      minHeight: 'calc(100vh - var(--header-height) - 200px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      textAlign: 'center',
    }}>
      <div style={{ marginBottom: '16px', opacity: 0.8 }}>
        <Icon name="search" size={80} color="#1e90ff" />
      </div>
      <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '8px' }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Page not found.</p>
    </main>
  );
}
