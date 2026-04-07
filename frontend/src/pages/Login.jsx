import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.brandLogo}>🎯</div>
          <h1 style={styles.brandName}>SpeakSmart</h1>
          <p style={styles.brandTagline}>Your AI-Powered English Communication Partner</p>
          
          <div style={styles.featureList}>
            {[
              { icon: '📞', text: 'Real-time AI Voice Calls' },
              { icon: '🎤', text: 'Interview Practice Mode' },
              { icon: '🧠', text: 'Speaking Challenges & Gamification' },
              { icon: '🌟', text: 'Tamil-Assisted Learning Mode' },
              { icon: '📊', text: 'Detailed Performance Analytics' },
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>

          <div style={styles.statsRow}>
            <div style={styles.stat}><div style={styles.statNum}>10K+</div><div style={styles.statLbl}>Learners</div></div>
            <div style={styles.stat}><div style={styles.statNum}>98%</div><div style={styles.statLbl}>Improved</div></div>
            <div style={styles.stat}><div style={styles.statNum}>50+</div><div style={styles.statLbl}>Topics</div></div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome Back! 👋</h2>
            <p style={styles.formSubtitle}>Sign in to continue your English journey</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Signing in...</>
              ) : (
                '🚀 Sign In'
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span>Don't have an account?</span>
          </div>

          <Link to="/signup" className="btn btn-secondary w-full" style={{ textDecoration: 'none', marginTop: 4 }}>
            ✨ Create Free Account
          </Link>

          <div style={styles.tamiltip}>
            <span style={styles.tamilEmoji}>🌟</span>
            <span>Tamil-speaking? We have a special <strong>Tamil-Assisted mode</strong> just for you!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #1565C0 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: { maxWidth: 440, position: 'relative', zIndex: 1 },
  brandLogo: {
    width: 72, height: 72,
    background: 'linear-gradient(135deg, #4A90E2, #00C9FF)',
    borderRadius: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 36, marginBottom: 24,
    boxShadow: '0 8px 32px rgba(74,144,226,0.4)',
    animation: 'float 3s ease-in-out infinite',
  },
  brandName: {
    fontFamily: "'Poppins', sans-serif", fontWeight: 800,
    fontSize: '2.5rem', color: 'white', marginBottom: 8,
  },
  brandTagline: {
    color: '#94A3B8', fontSize: '1rem', marginBottom: 40, lineHeight: 1.6,
  },
  featureList: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 14 },
  featureIcon: {
    width: 40, height: 40,
    background: 'rgba(74,144,226,0.2)',
    borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', flexShrink: 0,
  },
  featureText: { color: '#CBD5E1', fontSize: '0.95rem', fontWeight: 500 },
  statsRow: {
    display: 'flex', gap: 24,
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: 28,
  },
  stat: { textAlign: 'center' },
  statNum: { fontFamily: "'Poppins', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#4A90E2' },
  statLbl: { fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' },
  rightPanel: {
    width: 480,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    background: '#F8FAFC',
  },
  formCard: {
    width: '100%',
    background: 'white',
    borderRadius: 24,
    padding: 40,
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  },
  formHeader: { marginBottom: 32 },
  formTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.75rem', fontWeight: 800,
    color: '#0F172A', marginBottom: 8,
  },
  formSubtitle: { color: '#94A3B8', fontSize: '0.95rem' },
  divider: {
    textAlign: 'center', margin: '24px 0',
    color: '#94A3B8', fontSize: '0.875rem',
  },
  tamiltip: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    background: '#EDE9FE',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: 12,
    padding: '12px 14px',
    marginTop: 20,
    fontSize: '0.8rem',
    color: '#5B21B6',
    lineHeight: 1.5,
  },
  tamilEmoji: { fontSize: '1.1rem', flexShrink: 0 },
};

export default Login;
