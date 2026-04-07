import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 60, height: 60,
          background: 'linear-gradient(135deg, #4A90E2, #00C9FF)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
          animation: 'pulse 2s ease-in-out infinite',
          boxShadow: '0 0 30px rgba(74,144,226,0.5)',
        }}>
          🎯
        </div>
        <div style={{ color: '#94A3B8', fontSize: '0.9rem', fontWeight: 500 }}>
          Loading SpeakSmart...
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
