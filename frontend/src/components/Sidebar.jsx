import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from './LanguageToggle';

const NAV_ITEMS = [
  { to: '/', icon: '🏠', label: 'Dashboard' },
  { to: '/call', icon: '📞', label: 'AI Call' },
  { to: '/interview', icon: '🎤', label: 'Interview' },
  { to: '/challenges', icon: '🧠', label: 'Challenges' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isTamilMode } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const levelColors = {
    'Beginner': '#10B981',
    'Elementary': '#3B82F6',
    'Intermediate': '#8B5CF6',
    'Upper-Intermediate': '#F59E0B',
    'Advanced': '#EF4444',
    'Fluent': '#EC4899',
  };

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🎯</div>
        <div>
          <div style={styles.logoText}>SpeakSmart</div>
          <div style={styles.logoSub}>AI Coach</div>
        </div>
      </div>

      {/* User Profile */}
      <div style={styles.userCard}>
        <div style={styles.avatar}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div style={styles.userInfo}>
          <div style={styles.userName}>{user?.name || 'User'}</div>
          <span style={{
            ...styles.levelBadge,
            background: levelColors[user?.level] || '#3B82F6'
          }}>
            {user?.level || 'Beginner'}
          </span>
        </div>
      </div>

      {/* XP Bar */}
      <div style={styles.xpContainer}>
        <div style={styles.xpHeader}>
          <span style={styles.xpLabel}>⚡ XP: {user?.xp || 0}</span>
          <span style={styles.streakBadge}>🔥 {user?.streak?.current || 0}</span>
        </div>
        <div style={styles.xpBar}>
          <div style={{ ...styles.xpFill, width: `${Math.min(100, ((user?.xp || 0) % 500) / 5)}%` }} />
        </div>
      </div>

      {/* Language Toggle */}
      <div style={styles.langSection}>
        <LanguageToggle compact />
      </div>

      {/* Nav Items */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.navIcon}>{icon}</span>
            <span style={styles.navLabel}>{label}</span>
            {isTamilMode && to === '/call' && (
              <span style={styles.tamilTag}>தமிழ்</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom */}
      <div style={styles.bottom}>
        <div style={styles.modeIndicator}>
          <span>{isTamilMode ? '🌟 Tamil-Assisted' : '🇬🇧 English Mode'}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0, top: 0, bottom: 0,
    width: 260,
    background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
    zIndex: 100,
    overflowY: 'auto',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 28, paddingLeft: 4,
  },
  logoIcon: {
    width: 44, height: 44,
    background: 'linear-gradient(135deg, #4A90E2, #00C9FF)',
    borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20,
    boxShadow: '0 4px 16px rgba(74,144,226,0.5)',
  },
  logoText: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 800, fontSize: '1.1rem', color: 'white',
  },
  logoSub: { fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 16, padding: '14px',
    marginBottom: 16,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  avatar: {
    width: 44, height: 44,
    background: 'linear-gradient(135deg, #4A90E2, #7C3AED)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', fontWeight: 700, color: 'white',
    flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    color: 'white', fontWeight: 600, fontSize: '0.95rem',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  levelBadge: {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'white',
    marginTop: 4,
  },
  xpContainer: { marginBottom: 16, padding: '0 4px' },
  xpHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  xpLabel: { fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 },
  streakBadge: { fontSize: '0.75rem', color: '#F59E0B', fontWeight: 700 },
  xpBar: { height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  xpFill: {
    height: '100%', borderRadius: 3,
    background: 'linear-gradient(135deg, #4A90E2, #00C9FF)',
    transition: 'width 1s ease',
  },
  langSection: { marginBottom: 20 },
  nav: { display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px',
    borderRadius: 12,
    textDecoration: 'none',
    color: '#94A3B8',
    fontWeight: 500,
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, rgba(74,144,226,0.3), rgba(0,201,255,0.15))',
    color: 'white',
    border: '1px solid rgba(74,144,226,0.4)',
  },
  navIcon: { fontSize: '1.1rem', flexShrink: 0 },
  navLabel: { flex: 1 },
  tamilTag: {
    fontSize: '0.6rem', padding: '2px 6px',
    background: 'rgba(16,185,129,0.2)',
    color: '#10B981', borderRadius: 8, fontWeight: 700,
  },
  bottom: {
    paddingTop: 16,
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  modeIndicator: {
    fontSize: '0.75rem', color: '#64748B',
    padding: '8px 14px', marginBottom: 8,
    fontWeight: 500,
  },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '10px 14px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 10,
    color: '#F87171', fontSize: '0.875rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s ease',
  },
};

export default Sidebar;
