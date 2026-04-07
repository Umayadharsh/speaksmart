import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend
} from 'recharts';

const Analytics = () => {
  const { user } = useAuth();
  const { isTamilMode } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/user/stats');
      setStats(res.data.stats);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const TABS = ['OVERVIEW', 'CHARTS', 'LEADERBOARD', 'HISTORY'];

  const StatCard = ({ icon, label, value, sub, gradient }) => (
    <div style={{ ...styles.statCard, background: gradient || 'white' }}>
      <div style={styles.statTop}>
        <span style={styles.statIcon}>{icon}</span>
        <span style={styles.statLabel}>{label}</span>
      </div>
      <div style={styles.statValue}>{value}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );

  const RadarData = stats ? [
    { subject: 'Fluency', A: stats.user.speakingStats?.fluencyScore || 0 },
    { subject: 'Grammar', A: stats.user.speakingStats?.grammarScore || 0 },
    { subject: 'Vocabulary', A: stats.user.speakingStats?.vocabularyScore || 0 },
    { subject: 'Confidence', A: stats.user.speakingStats?.confidenceScore || 0 },
    { subject: 'Pronunciation', A: 72 }, // simulated
  ] : [];

  if (loading) {
    return (
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh', flexDirection: 'column', gap: 16 }}>
              <div className="spinner" style={{ width: 60, height: 60 }} />
              <div style={{ color: '#94A3B8' }}>Loading your analytics...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>📊 Analytics Dashboard</h1>
              <p style={styles.pageSubtitle}>
                {isTamilMode
                  ? 'Neenga panna progress paarunga. Scores, streaks, enna ellam இருக்கு!'
                  : 'Track your English improvement journey with detailed performance insights.'}
              </p>
            </div>
            <div style={styles.rankBadge}>
              <div style={styles.rankLabel}>Global Rank</div>
              <div style={styles.rankValue}>#{stats?.user?.rank || '—'}</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabRow}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
              >
                {{ OVERVIEW: '🏠', CHARTS: '📈', LEADERBOARD: '🏆', HISTORY: '📋' }[tab]} {tab}
              </button>
            ))}
          </div>

          {/* OVERVIEW Tab */}
          {activeTab === 'OVERVIEW' && (
            <>
              {/* Stats Grid */}
              <div style={styles.statsGrid}>
                <StatCard icon="⭐" label="Avg Score" value={`${stats?.user?.speakingStats?.averageScore || 0}%`} sub="Overall performance" gradient="linear-gradient(135deg, #4A90E2 0%, #00C9FF 100%)" />
                <StatCard icon="🔥" label="Current Streak" value={`${stats?.user?.streak?.current || 0} days`} sub={`Best: ${stats?.user?.streak?.longest || 0} days`} />
                <StatCard icon="⚡" label="Total XP" value={stats?.user?.xp || 0} sub={`Level: ${stats?.user?.level}`} />
                <StatCard icon="📞" label="Sessions" value={stats?.user?.speakingStats?.totalSessions || 0} sub={`${stats?.user?.speakingStats?.totalMinutes || 0} min total`} />
                <StatCard icon="🎤" label="Interviews" value={stats?.interviewStats?.total || 0} sub="Completed" />
                <StatCard icon="📝" label="Total Practices" value={stats?.totalScores || 0} sub="Speaking scored" />
              </div>

              {/* Skills Spider Chart + Activity */}
              <div style={styles.twoCol}>
                {/* Radar Chart */}
                <div style={styles.chartCard}>
                  <div style={styles.chartTitle}>🕸️ Skill Radar</div>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={RadarData}>
                      <PolarGrid stroke="rgba(74,144,226,0.2)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                      <Radar name="Skills" dataKey="A" stroke="#4A90E2" fill="#4A90E2" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Activity Heatmap */}
                <div style={styles.chartCard}>
                  <div style={styles.chartTitle}>📅 7-Day Activity</div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats?.activityData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,144,226,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid rgba(74,144,226,0.2)', fontSize: 12 }} />
                      <Bar dataKey="sessions" fill="url(#blueGrad)" radius={4} />
                      <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4A90E2" />
                          <stop offset="100%" stopColor="#00C9FF" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Session Breakdown */}
              <div style={styles.breakdownCard}>
                <div style={styles.chartTitle}>📊 Sessions by Type</div>
                <div style={styles.breakdownGrid}>
                  {[
                    { type: 'CALL', icon: '📞', label: 'AI Calls', color: '#4A90E2' },
                    { type: 'INTERVIEW', icon: '🎤', label: 'Interviews', color: '#7C3AED' },
                    { type: 'CHALLENGE', icon: '🧠', label: 'Challenges', color: '#0891B2' },
                    { type: 'FREE_TALK', icon: '💬', label: 'Free Talk', color: '#10B981' },
                  ].map(({ type, icon, label, color }) => {
                    const count = stats?.sessionBreakdown?.[type] || 0;
                    return (
                      <div key={type} style={styles.breakdownItem}>
                        <div style={{ ...styles.breakdownIcon, background: color + '22', color }}>{icon}</div>
                        <div style={styles.breakdownInfo}>
                          <div style={styles.breakdownLabel}>{label}</div>
                          <div style={styles.breakdownCount}>{count} sessions</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* CHARTS Tab */}
          {activeTab === 'CHARTS' && (
            <>
              {/* Line Chart: Score over time */}
              <div style={styles.chartCard} className="mb-24">
                <div style={styles.chartTitle}>📈 Overall Score Over Time</div>
                {(stats?.chartData?.length || 0) === 0 ? (
                  <div style={styles.noData}>No data yet. Start practicing to see your progress!</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={stats.chartData}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#4A90E2" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,144,226,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(val) => [`${val}`, 'Score']} />
                      <Area type="monotone" dataKey="overall" stroke="#4A90E2" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: '#4A90E2', r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Multi-line: Skills over time */}
              <div style={styles.chartCard}>
                <div style={styles.chartTitle}>🎯 Skills Breakdown Over Time</div>
                {(stats?.chartData?.length || 0) === 0 ? (
                  <div style={styles.noData}>No data yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,144,226,0.1)" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                      <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                      <Legend />
                      <Line type="monotone" dataKey="fluency" stroke="#4A90E2" strokeWidth={2} name="Fluency" dot={false} />
                      <Line type="monotone" dataKey="grammar" stroke="#7C3AED" strokeWidth={2} name="Grammar" dot={false} />
                      <Line type="monotone" dataKey="vocabulary" stroke="#10B981" strokeWidth={2} name="Vocab" dot={false} />
                      <Line type="monotone" dataKey="confidence" stroke="#F59E0B" strokeWidth={2} name="Confidence" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}

          {/* LEADERBOARD Tab */}
          {activeTab === 'LEADERBOARD' && (
            <div style={styles.leaderboardCard}>
              <div style={styles.chartTitle}>🏆 Global Leaderboard (Top XP)</div>
              {(stats?.leaderboard || []).map((u, i) => (
                <div key={i} style={{ ...styles.leaderRow, ...(u.isCurrentUser ? styles.leaderRowCurrent : {}) }}>
                  <div style={styles.leaderRank}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${u.rank}`}
                  </div>
                  <div style={styles.leaderAvatar}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.leaderInfo}>
                    <div style={styles.leaderName}>{u.name} {u.isCurrentUser && <span style={styles.youTag}>You</span>}</div>
                    <div style={styles.leaderLevel}>{u.level} • 🔥 {u.streak} streak</div>
                  </div>
                  <div style={styles.leaderXP}>⚡ {u.xp.toLocaleString()} XP</div>
                </div>
              ))}
              {(stats?.leaderboard?.length || 0) === 0 && (
                <div style={styles.noData}>Leaderboard is empty. Be the first to practice and claim #1! 🚀</div>
              )}
            </div>
          )}

          {/* HISTORY Tab */}
          {activeTab === 'HISTORY' && (
            <div style={styles.historyCard}>
              <div style={styles.chartTitle}>📋 Recent Interview Sessions</div>
              {(stats?.interviewStats?.scores || []).length === 0 ? (
                <div style={styles.noData}>No interview sessions yet. Go practice! 🎤</div>
              ) : (
                stats.interviewStats.scores.map((s, i) => (
                  <div key={i} style={styles.historyRow}>
                    <div style={styles.historyLabel}>{s.jobRole}</div>
                    <div style={styles.historyDate}>{new Date(s.createdAt).toLocaleDateString('en-IN')}</div>
                    <div style={{ ...styles.historyScore, color: s.overallScore >= 70 ? '#10B981' : '#F59E0B' }}>
                      {s.overallScore}/100
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  main: { marginLeft: 260, minHeight: '100vh', background: '#F0F7FF' },
  container: { padding: 32, maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle: { fontFamily: "'Poppins', sans-serif", fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #1565C0, #4A90E2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  pageSubtitle: { color: '#475569', marginTop: 6, lineHeight: 1.6 },
  rankBadge: { background: 'linear-gradient(135deg, #4A90E2, #00C9FF)', borderRadius: 16, padding: '12px 20px', textAlign: 'center', boxShadow: '0 4px 16px rgba(74,144,226,0.4)' },
  rankLabel: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  rankValue: { fontFamily: "'Poppins', sans-serif", fontSize: '1.8rem', fontWeight: 900, color: 'white' },
  tabRow: { display: 'flex', gap: 8, marginBottom: 24, background: 'white', padding: 6, borderRadius: 16, boxShadow: '0 2px 8px rgba(74,144,226,0.08)' },
  tab: { flex: 1, padding: '10px 16px', border: 'none', borderRadius: 12, background: 'transparent', color: '#94A3B8', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s ease' },
  tabActive: { background: 'linear-gradient(135deg, #4A90E2, #00C9FF)', color: 'white', boxShadow: '0 4px 12px rgba(74,144,226,0.3)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 },
  statCard: { borderRadius: 16, padding: '18px 16px', border: '1px solid rgba(74,144,226,0.1)', boxShadow: '0 2px 8px rgba(74,144,226,0.06)', position: 'relative', overflow: 'hidden' },
  statTop: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  statIcon: { fontSize: '1.2rem' },
  statLabel: { fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: { fontFamily: "'Poppins', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#0F172A' },
  statSub: { fontSize: '0.75rem', color: '#94A3B8', marginTop: 4 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 },
  chartCard: { background: 'white', borderRadius: 20, padding: 24, border: '1px solid rgba(74,144,226,0.1)', boxShadow: '0 4px 16px rgba(74,144,226,0.06)', marginBottom: 20 },
  chartTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0F172A', marginBottom: 16 },
  noData: { textAlign: 'center', color: '#94A3B8', padding: '40px 20px', fontSize: '0.9rem' },
  breakdownCard: { background: 'white', borderRadius: 20, padding: 24, border: '1px solid rgba(74,144,226,0.1)', boxShadow: '0 4px 16px rgba(74,144,226,0.06)' },
  breakdownGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  breakdownItem: { display: 'flex', alignItems: 'center', gap: 14, padding: 14, background: '#F8FAFC', borderRadius: 12 },
  breakdownIcon: { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 },
  breakdownInfo: {},
  breakdownLabel: { fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' },
  breakdownCount: { fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 },
  leaderboardCard: { background: 'white', borderRadius: 20, padding: 24, border: '1px solid rgba(74,144,226,0.1)', boxShadow: '0 4px 16px rgba(74,144,226,0.06)' },
  leaderRow: { display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid #F1F5F9' },
  leaderRowCurrent: { background: '#E8F4FF', borderRadius: 12, padding: '14px 16px', margin: '4px -16px' },
  leaderRank: { width: 36, textAlign: 'center', fontSize: '1.2rem', fontWeight: 800 },
  leaderAvatar: { width: 40, height: 40, background: 'linear-gradient(135deg, #4A90E2, #7C3AED)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0 },
  leaderInfo: { flex: 1 },
  leaderName: { fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' },
  leaderLevel: { fontSize: '0.75rem', color: '#94A3B8', marginTop: 2 },
  youTag: { display: 'inline-block', padding: '2px 8px', background: '#4A90E2', color: 'white', borderRadius: 10, fontSize: '0.65rem', fontWeight: 700, marginLeft: 6 },
  leaderXP: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: '#F59E0B' },
  historyCard: { background: 'white', borderRadius: 20, padding: 24, border: '1px solid rgba(74,144,226,0.1)', boxShadow: '0 4px 16px rgba(74,144,226,0.06)' },
  historyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #F1F5F9' },
  historyLabel: { fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' },
  historyDate: { fontSize: '0.8rem', color: '#94A3B8' },
  historyScore: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '1rem' },
};

export default Analytics;
