import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LanguageToggle from '../components/LanguageToggle';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const QuickActionCard = ({ icon, title, desc, to, gradient, badge }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{ ...styles.quickCard, background: gradient }}>
      {badge && <div style={styles.badge}>{badge}</div>}
      <div style={styles.quickIcon}>{icon}</div>
      <div style={styles.quickTitle}>{title}</div>
      <div style={styles.quickDesc}>{desc}</div>
      <div style={styles.quickArrow}>Start →</div>
    </div>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { isTamilMode, t } = useLanguage();
  const [recentConversations, setRecentConversations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [motivationalMsg, setMotivationalMsg] = useState('');

  const ENGLISH_MSGS = [
    "Every sentence you speak brings you closer to fluency! 💪",
    "Confidence is built one conversation at a time. Let's go! 🚀",
    "Great speakers were once nervous beginners. Keep going! 🌟",
    "Your English is improving every day — don't stop now! ⭐",
  ];

  const TAMIL_MSGS = [
    "Neenga romba nalla effort potteenga! Keep it up! 💪",
    "Every day practice pannunga — fluency varum! 🌟",
    "Tamil speaker-a iruntha English learn panradhuu? Super! 🚀",
    "Slowly slowly — neenga definitely improve aaveenga! ⭐",
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const msgs = isTamilMode ? TAMIL_MSGS : ENGLISH_MSGS;
    setMotivationalMsg(msgs[Math.floor(Math.random() * msgs.length)]);

    fetchDashboardData();
  }, [isTamilMode]);

  const fetchDashboardData = async () => {
    try {
      const [historyRes, statsRes] = await Promise.all([
        api.get('/conversation/history?limit=5'),
        api.get('/user/stats'),
      ]);
      setRecentConversations(historyRes.data.conversations || []);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const levelProgress = () => {
    const levels = ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Fluent'];
    const idx = levels.indexOf(user?.level || 'Beginner');
    return ((idx + 1) / levels.length) * 100;
  };

  const getSessionTypeIcon = (type) => {
    const icons = { CALL: '📞', INTERVIEW: '🎤', CHALLENGE: '🧠', FREE_TALK: '💬' };
    return icons[type] || '💬';
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.container}>
          {/* Hero Header */}
          <div style={styles.hero}>
            <div style={styles.heroLeft}>
              <div style={styles.greetingBadge}>
                {isTamilMode ? '🌟 Tamil-Assisted Mode' : '🇬🇧 English Mode'}
              </div>
              <h1 style={styles.heroTitle}>
                {greeting}, {user?.name?.split(' ')[0] || 'Learner'}! 👋
              </h1>
              <p style={styles.heroMsg}>{motivationalMsg}</p>
              <div style={styles.heroCta}>
                <Link to="/call" className="btn btn-primary btn-lg">
                  📞 Start AI Call
                </Link>
                <Link to="/challenges" className="btn btn-secondary btn-lg">
                  🧠 Take Challenge
                </Link>
              </div>
            </div>

            <div style={styles.heroRight}>
              {/* Level Card */}
              <div style={styles.levelCard}>
                <div style={styles.levelHeader}>
                  <span style={styles.levelLabel}>Current Level</span>
                  <span style={styles.levelBadge}>{user?.level || 'Beginner'}</span>
                </div>
                <div style={styles.levelBarBg}>
                  <div style={{ ...styles.levelBarFill, width: `${levelProgress()}%` }} />
                </div>
                <div style={styles.levelFooter}>
                  <span>⚡ {user?.xp || 0} XP</span>
                  <span>🔥 {user?.streak?.current || 0} day streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div style={styles.statsRow}>
            {[
              { icon: '📞', label: 'Sessions', value: user?.speakingStats?.totalSessions || 0 },
              { icon: '📈', label: 'Avg Score', value: `${user?.speakingStats?.averageScore || 0}%` },
              { icon: '⏱️', label: 'Minutes', value: user?.speakingStats?.totalMinutes || 0 },
              { icon: '✏️', label: 'Grammar', value: `${user?.speakingStats?.grammarScore || 0}%` },
              { icon: '💪', label: 'Confidence', value: `${user?.speakingStats?.confidenceScore || 0}%` },
              { icon: '🏆', label: 'Rank', value: `#${stats?.user?.rank || '—'}` },
            ].map((s, i) => (
              <div key={i} style={styles.statCard}>
                <div style={styles.statIcon}>{s.icon}</div>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Quick Practice</h2>
          </div>
          <div style={styles.quickGrid}>
            <QuickActionCard
              icon="📞"
              title="AI Voice Call"
              desc={isTamilMode ? "AI oda real-time conversation. Tamil + English!" : "Real-time voice conversation with AI coach"}
              to="/call"
              gradient="linear-gradient(135deg, #1565C0 0%, #0288D1 100%)"
              badge="LIVE"
            />
            <QuickActionCard
              icon="🎤"
              title="Interview Practice"
              desc={isTamilMode ? "Job interview ku prepare aavenm. AI questions + feedback" : "Prepare for job interviews with AI feedback"}
              to="/interview"
              gradient="linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)"
              badge="HOT"
            />
            <QuickActionCard
              icon="🧠"
              title="Speaking Challenges"
              desc={isTamilMode ? "Challenges complete panni XP earn pannunga!" : "Time-based speaking challenges to earn XP"}
              to="/challenges"
              gradient="linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)"
            />
          </div>

          {/* Bottom Row */}
          <div style={styles.bottomRow}>
            {/* Recent Sessions */}
            <div style={styles.recentCard}>
              <div style={styles.recentHeader}>
                <h3 style={styles.recentTitle}>Recent Sessions</h3>
                <Link to="/analytics" style={styles.viewAll}>View All →</Link>
              </div>
              {loading ? (
                <div style={styles.loadingRow}>
                  {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 56, marginBottom: 8 }} />)}
                </div>
              ) : recentConversations.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🎯</div>
                  <div style={styles.emptyText}>No sessions yet. Start your first AI call!</div>
                  <Link to="/call" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Start Now</Link>
                </div>
              ) : (
                recentConversations.map(conv => (
                  <div key={conv._id} style={styles.recentItem}>
                    <div style={styles.recentIcon}>{getSessionTypeIcon(conv.sessionType)}</div>
                    <div style={styles.recentInfo}>
                      <div style={styles.recentName}>{conv.title || 'Practice Session'}</div>
                      <div style={styles.recentMeta}>
                        {new Date(conv.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} •
                        {' '}{conv.messages?.length || 0} messages
                      </div>
                    </div>
                    <div style={{
                      ...styles.recentScore,
                      color: (conv.overallScore || 0) >= 70 ? '#10B981' : '#F59E0B',
                    }}>
                      {conv.overallScore || '—'}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Language Settings */}
            <div style={styles.langCard}>
              <h3 style={styles.recentTitle}>Language Settings</h3>
              <div style={{ marginTop: 16 }}>
                <LanguageToggle />
              </div>

              {/* Daily Challenge Tip */}
              <div style={styles.dailyTip}>
                <div style={styles.tipHeader}>💡 Today's Tip</div>
                <div style={styles.tipText}>
                  {isTamilMode
                    ? '"Practice makes perfect" — epadi solluveenga? Romba correct! Daily 10 minutes practice pannunga. 🌟'
                    : '"The most important thing in communication is hearing what isn\'t said." — Practice active listening! 🎧'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  main: { marginLeft: 260, minHeight: '100vh', background: '#F0F7FF' },
  container: { padding: 32, maxWidth: 1300, margin: '0 auto' },
  hero: {
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1565C0 100%)',
    borderRadius: 24, padding: 40, marginBottom: 24,
    display: 'flex', gap: 32, alignItems: 'center',
    position: 'relative', overflow: 'hidden',
  },
  heroLeft: { flex: 1 },
  greetingBadge: {
    display: 'inline-flex', alignItems: 'center',
    padding: '6px 16px', borderRadius: 20,
    background: 'rgba(74,144,226,0.3)',
    border: '1px solid rgba(74,144,226,0.4)',
    color: '#93C5FD', fontSize: '0.8rem', fontWeight: 600,
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: "'Poppins', sans-serif", fontWeight: 800,
    fontSize: '2rem', color: 'white', marginBottom: 10,
    lineHeight: 1.3,
  },
  heroMsg: { color: '#94A3B8', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.6 },
  heroCta: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  heroRight: { width: 280, flexShrink: 0 },
  levelCard: {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16, padding: 20,
    border: '1px solid rgba(255,255,255,0.12)',
  },
  levelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  levelLabel: { color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600 },
  levelBadge: {
    padding: '4px 12px', borderRadius: 20,
    background: 'linear-gradient(135deg, #4A90E2, #00C9FF)',
    color: 'white', fontSize: '0.75rem', fontWeight: 700,
  },
  levelBarBg: { height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  levelBarFill: { height: '100%', borderRadius: 4, background: 'linear-gradient(135deg, #4A90E2, #00C9FF)', transition: 'width 1s ease' },
  levelFooter: { display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600 },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 12, marginBottom: 24,
  },
  statCard: {
    background: 'white', borderRadius: 16,
    padding: '20px 12px', textAlign: 'center',
    border: '1px solid rgba(74,144,226,0.1)',
    boxShadow: '0 2px 8px rgba(74,144,226,0.05)',
    transition: 'all 0.2s ease',
    position: 'relative', overflow: 'hidden',
  },
  statIcon: { fontSize: '1.5rem', marginBottom: 8 },
  statValue: {
    fontFamily: "'Poppins', sans-serif", fontSize: '1.6rem', fontWeight: 800,
    background: 'linear-gradient(135deg, #1565C0, #0288D1)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  statLabel: { fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '1.15rem', color: '#0F172A' },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  quickCard: {
    borderRadius: 20, padding: '28px 24px',
    color: 'white', cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  },
  badge: {
    position: 'absolute', top: 16, right: 16,
    padding: '4px 10px', borderRadius: 20,
    background: 'rgba(255,255,255,0.25)',
    fontSize: '0.7rem', fontWeight: 800,
    color: 'white', letterSpacing: '0.5px',
  },
  quickIcon: { fontSize: '2.5rem', marginBottom: 14 },
  quickTitle: { fontFamily: "'Poppins', sans-serif", fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 },
  quickDesc: { fontSize: '0.85rem', opacity: 0.85, lineHeight: 1.5, marginBottom: 20 },
  quickArrow: { fontSize: '0.85rem', fontWeight: 700, opacity: 0.9 },
  bottomRow: { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 },
  recentCard: {
    background: 'white', borderRadius: 20,
    padding: 24, border: '1px solid rgba(74,144,226,0.1)',
    boxShadow: '0 4px 16px rgba(74,144,226,0.06)',
  },
  recentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  recentTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0F172A' },
  viewAll: { fontSize: '0.8rem', color: '#4A90E2', fontWeight: 600, textDecoration: 'none' },
  loadingRow: {},
  emptyState: { textAlign: 'center', padding: '32px 16px' },
  emptyIcon: { fontSize: '3rem', marginBottom: 12 },
  emptyText: { color: '#94A3B8', fontSize: '0.875rem' },
  recentItem: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '12px 0',
    borderBottom: '1px solid rgba(74,144,226,0.06)',
  },
  recentIcon: {
    width: 40, height: 40,
    background: '#E8F4FF', borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.1rem', flexShrink: 0,
  },
  recentInfo: { flex: 1, minWidth: 0 },
  recentName: { fontWeight: 600, fontSize: '0.875rem', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  recentMeta: { fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 },
  recentScore: { fontFamily: "'Poppins', sans-serif", fontSize: '1.2rem', fontWeight: 800 },
  langCard: {
    background: 'white', borderRadius: 20,
    padding: 24, border: '1px solid rgba(74,144,226,0.1)',
    boxShadow: '0 4px 16px rgba(74,144,226,0.06)',
  },
  dailyTip: {
    background: 'linear-gradient(135deg, #E8F4FF, #EDE9FE)',
    borderRadius: 12, padding: '14px 16px', marginTop: 16,
    border: '1px solid rgba(74,144,226,0.1)',
  },
  tipHeader: { fontWeight: 700, fontSize: '0.85rem', color: '#1E293B', marginBottom: 6 },
  tipText: { fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, fontStyle: 'italic' },
};

export default Dashboard;
