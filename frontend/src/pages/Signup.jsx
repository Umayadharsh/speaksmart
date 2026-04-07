import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', languageMode: 'ENGLISH' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.languageMode);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 style={styles.brandName}>Join SpeakSmart</h1>
          <p style={styles.brandTagline}>Start your English fluency journey today — completely free!</p>

          <div style={styles.benefitCards}>
            {[
              { icon: '🤖', title: 'AI-Powered Coach', desc: 'Real-time feedback on every sentence' },
              { icon: '🌟', title: 'Tamil Support', desc: 'Learn in your mother tongue style' },
              { icon: '🏆', title: 'Gamified Learning', desc: 'Earn XP, badges and climb the leaderboard' },
              { icon: '📱', title: 'Chrome Extension', desc: 'Practice anywhere, anytime' },
            ].map((b, i) => (
              <div key={i} style={styles.benefitCard}>
                <span style={styles.benefitIcon}>{b.icon}</span>
                <div>
                  <div style={styles.benefitTitle}>{b.title}</div>
                  <div style={styles.benefitDesc}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Your Account ✨</h2>
            <p style={styles.formSubtitle}>It's free — no credit card required</p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                id="signup-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">🌐 Learning Language Mode</label>
              <div style={styles.modeSelect}>
                {[
                  { value: 'ENGLISH', label: '🇬🇧 English Only', desc: 'Full English coaching' },
                  { value: 'TAMIL_ASSISTED', label: '🌟 Tamil-Assisted', desc: 'Tanglish support included' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, languageMode: opt.value }))}
                    style={{
                      ...styles.modeBtn,
                      ...(form.languageMode === opt.value ? styles.modeBtnActive : {}),
                    }}
                  >
                    <div style={styles.modeBtnLabel}>{opt.label}</div>
                    <div style={styles.modeBtnDesc}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {form.languageMode === 'TAMIL_ASSISTED' && (
              <div style={styles.tamilNote}>
                🌟 <strong>Tamil-Assisted mode</strong> — AI will respond in Tanglish (Tamil + English mix) and help you gradually transition to full English. Perfect for Tamil speakers!
              </div>
            )}

            <button
              id="signup-submit"
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <><div className="spinner spinner-sm" style={{ borderTopColor: 'white' }} /> Creating account...</>
              ) : (
                '🚀 Start Learning Free'
              )}
            </button>
          </form>

          <div style={styles.divider}>Already have an account?</div>
          <Link to="/login" className="btn btn-secondary w-full" style={{ textDecoration: 'none' }}>
            Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { display: 'flex', minHeight: '100vh' },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #7C3AED 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 48,
  },
  leftContent: { maxWidth: 440 },
  brandLogo: {
    width: 64, height: 64,
    background: 'linear-gradient(135deg, #4A90E2, #00C9FF)',
    borderRadius: 18, fontSize: 30,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
    boxShadow: '0 8px 32px rgba(74,144,226,0.4)',
  },
  brandName: {
    fontFamily: "'Poppins', sans-serif", fontWeight: 800,
    fontSize: '2.2rem', color: 'white', marginBottom: 8,
  },
  brandTagline: { color: '#94A3B8', fontSize: '0.95rem', marginBottom: 36, lineHeight: 1.6 },
  benefitCards: { display: 'flex', flexDirection: 'column', gap: 16 },
  benefitCard: {
    display: 'flex', alignItems: 'center', gap: 16,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 14, padding: '14px 16px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  benefitIcon: { fontSize: '1.5rem', flexShrink: 0 },
  benefitTitle: { color: 'white', fontWeight: 600, fontSize: '0.9rem' },
  benefitDesc: { color: '#94A3B8', fontSize: '0.8rem', marginTop: 2 },
  rightPanel: {
    width: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 48, background: '#F8FAFC',
  },
  formCard: {
    width: '100%', background: 'white',
    borderRadius: 24, padding: 40,
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
  },
  formHeader: { marginBottom: 28 },
  formTitle: {
    fontFamily: "'Poppins', sans-serif", fontWeight: 800,
    fontSize: '1.6rem', color: '#0F172A', marginBottom: 6,
  },
  formSubtitle: { color: '#94A3B8', fontSize: '0.875rem' },
  modeSelect: { display: 'flex', gap: 10 },
  modeBtn: {
    flex: 1, padding: '12px 8px',
    border: '2px solid rgba(74,144,226,0.2)',
    borderRadius: 12, background: 'white',
    cursor: 'pointer', textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  modeBtnActive: {
    border: '2px solid #4A90E2',
    background: '#E8F4FF',
    boxShadow: '0 0 0 4px rgba(74,144,226,0.1)',
  },
  modeBtnLabel: { fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', marginBottom: 3 },
  modeBtnDesc: { fontSize: '0.72rem', color: '#94A3B8' },
  tamilNote: {
    background: '#EDE9FE', border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: 12, padding: '12px 14px',
    fontSize: '0.82rem', color: '#5B21B6', lineHeight: 1.6,
    marginBottom: 16,
  },
  divider: {
    textAlign: 'center', margin: '24px 0',
    color: '#94A3B8', fontSize: '0.875rem',
  },
};

export default Signup;
