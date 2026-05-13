import { useAuth } from '../../contexts/AuthContext';

export default function RoleSwitch({ patientContent, doctorContent, adminContent, fallback }) {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) return fallback || null;

  switch (role) {
    case 'patient':
      return patientContent || fallback || null;
    case 'doctor':
      return doctorContent || fallback || null;
    case 'admin':
      return adminContent || fallback || null;
    default:
      return fallback || null;
  }
}
