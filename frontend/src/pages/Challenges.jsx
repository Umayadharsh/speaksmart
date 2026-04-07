import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import WaveAnimation from '../components/WaveAnimation';
import useVoice from '../hooks/useVoice';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const Challenges = () => {
  const { user } = useAuth();
  const { languageMode, isTamilMode } = useLanguage();
  const [phase, setPhase] = useState('LIST'); // LIST | READY | RECORDING | PROCESSING | RESULT
  const [challenges, setChallenges] = useState([]);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [capturedText, setCapturedText] = useState(''); // finalized speech
  const [evaluation, setEvaluation] = useState(null);
  const [totalXP, setTotalXP] = useState(user?.xp || 0);
  const [completedIds, setCompletedIds] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const timerRef   = useRef(null);
  const selectedRef = useRef(null); // always-current selected challenge for timer closure
  const timeLeftRef = useRef(0);
  const capturedRef = useRef('');   // always-current captured text

  const voice = useVoice({ languageMode });

  useEffect(() => {
    fetchChallenges();
    return () => {
      clearInterval(timerRef.current);
      voice.stopListening();
      voice.stopSpeaking();
    };
  }, []);

  // Keep refs current
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/conversation/challenges');
      setChallenges(res.data.challenges || []);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    }
  };

  const startChallenge = (challenge) => {
    setSelected(challenge);
    selectedRef.current = challenge;
    setCapturedText('');
    capturedRef.current = '';
    setEvaluation(null);
    setTimeLeft(challenge.timeSeconds);
    timeLeftRef.current = challenge.timeSeconds;
    setPhase('READY');
    voice.speak(
      `Your topic is: "${challenge.topic}". You have ${challenge.timeSeconds} seconds. Click Begin Speaking when ready.`
    );
  };

  // ─── Begin Recording ──────────────────────────────────────────
  const beginRecording = () => {
    setCapturedText('');
    capturedRef.current = '';
    setPhase('RECORDING');

    // Start recognition — callback fires when silence detected or user stops
    // We restart on each silence so the user can speak in multiple bursts
    startListeningCycle();

    // Start countdown timer
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(timerRef.current);
        handleTimerEnd();
      }
    }, 1000);
  };

  // Keep restarting recognition during recording phase so user can speak in bursts
  const startListeningCycle = () => {
    if (timeLeftRef.current <= 0) return;
    voice.startListening((text) => {
      if (text) {
        capturedRef.current = (capturedRef.current + ' ' + text).trim();
        setCapturedText(capturedRef.current);
      }
      // Restart if time still remaining and phase is RECORDING
      if (timeLeftRef.current > 0) {
        setTimeout(() => startListeningCycle(), 300);
      }
    });
  };

  // ─── Timer ends automatically ─────────────────────────────────
  const handleTimerEnd = () => {
    voice.stopListening();
    setPhase('PROCESSING');
    submitResponse(capturedRef.current, selectedRef.current);
  };

  // ─── User manually stops ──────────────────────────────────────
  const handleManualStop = () => {
    clearInterval(timerRef.current);
    voice.stopListening();
    voice.stopSpeaking();
    const timeSpent = (selectedRef.current?.timeSeconds || 60) - timeLeftRef.current;
    timeLeftRef.current = 0;
    setTimeLeft(0);
    setPhase('PROCESSING');
    submitResponse(capturedRef.current, selectedRef.current, timeSpent);
  };

  // ─── Submit to AI ─────────────────────────────────────────────
  const submitResponse = async (text, challenge, timeSpent) => {
    const finalText = text?.trim();
    const ch = challenge || selectedRef.current;

    if (!finalText) {
      setEvaluation({
        scores: { overall: 0, fluency: 0, vocabulary: 0, grammar: 0, confidence: 0, xpEarned: 0 },
        summary: 'No speech detected. Make sure your microphone is allowed and try again!',
        vocabularySuggestions: [],
      });
      setPhase('RESULT');
      return;
    }

    try {
      const res = await api.post('/conversation/challenge/submit', {
        topic: ch.topic,
        response: finalText,
        topicId: ch.id,
        durationSeconds: timeSpent || ch.timeSeconds,
      });
      const ev = res.data.evaluation;
      setEvaluation(ev);
      setTotalXP(prev => prev + (ev.scores?.xpEarned || 0));
      setCompletedIds(prev => [...prev, ch.id]);
    } catch (err) {
      setEvaluation({
        scores: { overall: 0, xpEarned: 0 },
        summary: 'Evaluation failed. Please check your connection and try again.',
        vocabularySuggestions: [],
      });
    }
    setPhase('RESULT');
  };

  // ─── Helpers ──────────────────────────────────────────────────
  const diffColors = {
    BEGINNER: { bg: '#D1FAE5', text: '#065F46', icon: '🌱' },
    INTERMEDIATE: { bg: '#FEF3C7', text: '#92400E', icon: '⚡' },
    ADVANCED: { bg: '#FEE2E2', text: '#991B1B', icon: '🔥' },
  };

  const filteredChallenges = filter === 'ALL'
    ? challenges
    : challenges.filter(c => c.difficulty === filter);

  const CircularTimer = ({ value, max }) => {
    const radius = 40;
    const circ   = 2 * Math.PI * radius;
    const dash   = circ * (value / max);
    const color  = value <= 10 ? '#EF4444' : value <= 20 ? '#F59E0B' : '#4A90E2';
    return (
      <svg width={96} height={96} style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}>
        <circle cx={48} cy={48} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
        <circle cx={48} cy={48} r={radius} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '48px 48px', transition: 'stroke-dasharray 1s linear' }} />
        <text x={48} y={44} textAnchor="middle" fill="white" fontSize={22} fontWeight={900}
          fontFamily="'Poppins', sans-serif">{value}</text>
        <text x={48} y={62} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={10}
          fontFamily="'Inter', sans-serif">sec</text>
      </svg>
    );
  };

  const ScoreBar = ({ label, value, color }) => (
    <div style={styles.scoreBarRow}>
      <div style={styles.scoreBarLabel}>{label}</div>
      <div style={styles.scoreBarTrack}>
        <div style={{ ...styles.scoreBarFill, width: `${value}%`, background: color }} />
      </div>
      <div style={{ ...styles.scoreBarNum, color }}>{value}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.container}>

          {/* ── LIST ─────────────────────────────────────────────── */}
          {phase === 'LIST' && (
            <>
              <div style={styles.pageHeader}>
                <div>
                  <h1 style={styles.pageTitle}>🧠 Speaking Challenges</h1>
                  <p style={styles.pageSubtitle}>
                    {isTamilMode
                      ? 'Topic choose pannunga → Timer start → Speak freely → XP earn pannunga!'
                      : 'Pick a topic, speak for the timer, get instant AI feedback & earn XP!'}
                  </p>
                </div>
                <div style={styles.xpBadge}>⚡ {totalXP.toLocaleString()} XP</div>
              </div>

              {/* Filter tabs */}
              <div style={styles.filterRow}>
                {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}>
                    {f === 'ALL' ? '🌐 All' : { BEGINNER: '🌱 Beginner', INTERMEDIATE: '⚡ Intermediate', ADVANCED: '🔥 Advanced' }[f]}
                  </button>
                ))}
              </div>

              {/* Challenge cards */}
              <div style={styles.challengeGrid}>
                {filteredChallenges.map(ch => {
                  const done = completedIds.includes(ch.id);
                  const dc = diffColors[ch.difficulty] || diffColors.BEGINNER;
                  const xpEstimate = Math.floor(ch.timeSeconds * 0.8);
                  return (
                    <div key={ch.id} style={{ ...styles.challengeCard, ...(done ? { opacity: 0.65 } : {}) }}
                      className="challenge-card">
                      {done && <div style={styles.doneBadge}>✅ Done</div>}
                      <div style={styles.cardTop}>
                        <span style={{ ...styles.diffTag, background: dc.bg, color: dc.text }}>
                          {dc.icon} {ch.difficulty}
                        </span>
                        <span style={styles.timeTag}>⏱ {ch.timeSeconds}s</span>
                      </div>
                      <div style={styles.topicText}>{ch.topic}</div>
                      {isTamilMode && ch.topicTamil && (
                        <div style={styles.topicTamil}>{ch.topicTamil}</div>
                      )}
                      <div style={styles.cardFooter}>
                        <span style={styles.xpPreview}>~{xpEstimate} XP</span>
                        <button id={`ch-${ch.id}`} onClick={() => startChallenge(ch)}
                          disabled={done} style={styles.startBtn}>
                          {done ? '✅ Done' : '▶ Start'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── READY ────────────────────────────────────────────── */}
          {phase === 'READY' && selected && (
            <div style={styles.centeredWrapper}>
              <div style={styles.readyCard}>
                <div style={styles.readyPulse}>🎯</div>
                <h2 style={styles.readyTitle}>Ready to Speak?</h2>
                <div style={styles.topicBox}>
                  <div style={styles.topicBoxLabel}>YOUR TOPIC</div>
                  <div style={styles.topicBoxText}>{selected.topic}</div>
                  {isTamilMode && selected.topicTamil && (
                    <div style={styles.topicBoxTamil}>🌟 {selected.topicTamil}</div>
                  )}
                </div>
                <div style={styles.readyMeta}>
                  <span>⏱ {selected.timeSeconds} seconds</span>
                  <span>•</span>
                  <span style={{ color: diffColors[selected.difficulty]?.text }}>
                    {selected.difficulty}
                  </span>
                </div>
                <div style={styles.tips}>
                  {[
                    '💡 Speak clearly at a natural pace',
                    '📋 Support your ideas with examples',
                    isTamilMode ? '🌟 Tamil words OK — try to use English!' : '🎯 Aim for complete sentences',
                    '⏱  Don\'t stop — keep talking!',
                  ].map((tip, i) => <div key={i} style={styles.tipRow}>{tip}</div>)}
                </div>
                <div style={styles.readyBtns}>
                  <button onClick={() => setPhase('LIST')} style={styles.cancelBtn}>← Back</button>
                  <button id="begin-btn" onClick={beginRecording} style={styles.beginBtn}>
                    🎙️ Begin Speaking
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── RECORDING ────────────────────────────────────────── */}
          {phase === 'RECORDING' && selected && (
            <div style={styles.recordingWrapper}>
              <div style={styles.recordingCard}>

                {/* Timer + status */}
                <div style={styles.timerRow}>
                  <CircularTimer value={timeLeft} max={selected.timeSeconds} />
                  <div style={styles.recStatus}>
                    <div style={styles.recDot} />
                    <span style={styles.recLabel}>
                      {voice.isListening ? 'Listening...' : 'Pause detected, resuming...'}
                    </span>
                  </div>
                </div>

                {/* Topic */}
                <div style={styles.recTopic}>
                  <div style={styles.recTopicLabel}>Speaking about:</div>
                  <div style={styles.recTopicText}>{selected.topic}</div>
                </div>

                {/* Wave animation */}
                <div style={styles.waveWrapper}>
                  <WaveAnimation active={voice.isListening} color="#00C9FF" bars={14} height={80} />
                </div>

                {/* Live transcript */}
                <div style={styles.transcriptBox}>
                  <div style={styles.transcriptHeader}>
                    📝 Live Transcript
                    {capturedText && <span style={styles.wordCount}>{capturedText.split(' ').filter(Boolean).length} words</span>}
                  </div>
                  <div style={styles.transcriptBody}>
                    {capturedText && <span style={styles.finalText}>{capturedText}</span>}
                    {voice.interimTranscript && (
                      <span style={styles.interimText}> {voice.interimTranscript}</span>
                    )}
                    {!capturedText && !voice.interimTranscript && (
                      <span style={styles.placeholderText}>Start speaking... the microphone is active.</span>
                    )}
                  </div>
                </div>

                <button id="stop-btn" onClick={handleManualStop} style={styles.stopBtn}>
                  ⏹ Stop & Submit
                </button>
              </div>
            </div>
          )}

          {/* ── PROCESSING ───────────────────────────────────────── */}
          {phase === 'PROCESSING' && (
            <div style={styles.centeredWrapper}>
              <div style={styles.processingCard}>
                <div className="spinner" style={{ width: 64, height: 64, margin: '0 auto 20px' }} />
                <div style={styles.processingTitle}>🤖 AI is analyzing your speech...</div>
                <div style={styles.processingWord}>
                  {capturedText
                    ? `"${capturedText.slice(0, 80)}${capturedText.length > 80 ? '...' : ''}"`
                    : 'Processing...'}
                </div>
                <div style={styles.processingTips}>Evaluating fluency • grammar • vocabulary • confidence</div>
              </div>
            </div>
          )}

          {/* ── RESULT ───────────────────────────────────────────── */}
          {phase === 'RESULT' && evaluation && (
            <div style={styles.resultWrapper}>
              <div style={styles.resultCard}>

                {/* Score header */}
                <div style={styles.resultHeaderRow}>
                  <div>
                    <div style={styles.resultEmoji}>
                      {(evaluation.scores?.overall || 0) >= 80 ? '🌟' : (evaluation.scores?.overall || 0) >= 60 ? '👍' : '💪'}
                    </div>
                    <div style={styles.resultLabel}>
                      {(evaluation.scores?.overall || 0) >= 80 ? 'Outstanding!' : (evaluation.scores?.overall || 0) >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                    </div>
                  </div>
                  <div style={styles.bigScore}>
                    <span style={styles.bigScoreNum}>{evaluation.scores?.overall || 0}</span>
                    <span style={styles.bigScoreSub}>/100</span>
                  </div>
                </div>

                {/* XP earned */}
                {(evaluation.scores?.xpEarned || 0) > 0 && (
                  <div style={styles.xpEarned}>
                    ⚡ +{evaluation.scores.xpEarned} XP earned!
                  </div>
                )}

                {/* Skill bars */}
                <div style={styles.skillsSection}>
                  <ScoreBar label="🗣️ Fluency"    value={evaluation.scores?.fluency    || 0} color="#4A90E2" />
                  <ScoreBar label="📚 Vocabulary" value={evaluation.scores?.vocabulary || 0} color="#7C3AED" />
                  <ScoreBar label="✏️ Grammar"    value={evaluation.scores?.grammar    || 0} color="#10B981" />
                  <ScoreBar label="💪 Confidence" value={evaluation.scores?.confidence || 0} color="#F59E0B" />
                </div>

                {/* AI Summary */}
                <div style={styles.summaryBox}>
                  <div style={styles.summaryLabel}>💬 AI Feedback</div>
                  {evaluation.summary}
                  {isTamilMode && evaluation.summaryTamil && (
                    <div style={styles.summaryTamil}>{evaluation.summaryTamil}</div>
                  )}
                </div>

                {/* What you said */}
                {capturedText && (
                  <div style={styles.transcriptResult}>
                    <div style={styles.summaryLabel}>🎙️ What you said</div>
                    <div style={styles.transcriptResultText}>"{capturedText}"</div>
                  </div>
                )}

                {/* Vocabulary suggestions */}
                {(evaluation.vocabularySuggestions?.length || 0) > 0 && (
                  <div style={styles.vocabSection}>
                    <div style={styles.summaryLabel}>📚 New Words to Learn</div>
                    {evaluation.vocabularySuggestions.slice(0, 3).map((v, i) => (
                      <div key={i} style={styles.vocabRow}>
                        <span style={styles.vocabWord}>{v.word}</span>
                        <span style={styles.vocabMeaning}>— {v.meaning}</span>
                        {isTamilMode && v.meaningTamil && (
                          <span style={styles.vocabTamil}> ({v.meaningTamil})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={styles.resultActions}>
                  <button style={styles.backToListBtn}
                    onClick={() => { setPhase('LIST'); setCapturedText(''); capturedRef.current = ''; }}>
                    🧠 More Challenges
                  </button>
                  <button style={styles.retryBtn} onClick={() => startChallenge(selected)}>
                    🔄 Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .challenge-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(74,144,226,0.18) !important;
        }
        @keyframes pulseBig {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes recBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

// ─── Styles ────────────────────────────────────────────────────────
const styles = {
  main: { marginLeft: 260, minHeight: '100vh', background: '#F0F7FF' },
  container: { padding: '32px', maxWidth: 1100, margin: '0 auto' },

  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pageTitle: { fontFamily: "'Poppins', sans-serif", fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #1565C0, #4A90E2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  pageSubtitle: { color: '#475569', marginTop: 6, lineHeight: 1.6, maxWidth: 550 },
  xpBadge: { padding: '10px 22px', background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', color: 'white', borderRadius: 20, fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '1rem', boxShadow: '0 4px 12px rgba(245,158,11,0.4)', flexShrink: 0 },

  filterRow: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: { padding: '8px 18px', borderRadius: 20, border: '1px solid rgba(74,144,226,0.2)', background: 'white', color: '#64748B', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  filterBtnActive: { background: 'linear-gradient(135deg, #4A90E2, #00C9FF)', color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(74,144,226,0.3)' },

  challengeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  challengeCard: { background: 'white', borderRadius: 20, padding: 20, border: '1px solid rgba(74,144,226,0.1)', boxShadow: '0 4px 16px rgba(74,144,226,0.06)', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden', cursor: 'default' },
  doneBadge: { position: 'absolute', top: 12, right: 12, background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  diffTag: { padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700 },
  timeTag: { fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 },
  topicText: { fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', lineHeight: 1.5, marginBottom: 8 },
  topicTamil: { fontSize: '0.8rem', color: '#5B21B6', background: '#EDE9FE', borderRadius: 8, padding: '6px 10px', marginBottom: 8 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' },
  xpPreview: { fontSize: '0.78rem', color: '#F59E0B', fontWeight: 700 },
  startBtn: { padding: '8px 18px', background: 'linear-gradient(135deg, #4A90E2, #00C9FF)', color: 'white', border: 'none', borderRadius: 20, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(74,144,226,0.3)', transition: 'all 0.2s' },

  centeredWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },

  readyCard: { background: 'white', borderRadius: 28, padding: '48px 40px', maxWidth: 500, width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(74,144,226,0.15)' },
  readyPulse: { fontSize: '4rem', marginBottom: 12, animation: 'pulseBig 2s ease-in-out infinite', display: 'inline-block' },
  readyTitle: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#0F172A', marginBottom: 24 },
  topicBox: { background: 'linear-gradient(135deg, #F0F7FF, #E8F4FF)', borderRadius: 16, padding: '20px', marginBottom: 16, border: '2px solid rgba(74,144,226,0.25)' },
  topicBoxLabel: { fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 },
  topicBoxText: { fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.4 },
  topicBoxTamil: { fontSize: '0.875rem', color: '#5B21B6', marginTop: 10, background: '#EDE9FE', padding: '8px 12px', borderRadius: 8 },
  readyMeta: { display: 'flex', justifyContent: 'center', gap: 12, color: '#64748B', fontSize: '0.875rem', fontWeight: 600, marginBottom: 20 },
  tips: { background: '#F8FAFC', borderRadius: 12, padding: '12px 16px', marginBottom: 28, textAlign: 'left' },
  tipRow: { fontSize: '0.82rem', color: '#475569', padding: '5px 0', borderBottom: '1px solid #F1F5F9' },
  readyBtns: { display: 'flex', gap: 12, justifyContent: 'center' },
  cancelBtn: { padding: '12px 20px', background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 20, color: '#64748B', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  beginBtn: { padding: '14px 32px', background: 'linear-gradient(135deg, #4A90E2, #00C9FF)', color: 'white', border: 'none', borderRadius: 24, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(74,144,226,0.5)', letterSpacing: '0.3px' },

  recordingWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: 40 },
  recordingCard: { background: 'linear-gradient(160deg, #0A0E1A, #0F1E35)', borderRadius: 28, padding: '40px 48px', maxWidth: 640, width: '100%', textAlign: 'center', boxShadow: '0 0 80px rgba(74,144,226,0.25), 0 0 0 1px rgba(74,144,226,0.1)' },
  timerRow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 24 },
  recStatus: { display: 'flex', alignItems: 'center', gap: 8 },
  recDot: { width: 10, height: 10, borderRadius: '50%', background: '#EF4444', animation: 'recBlink 1s ease-in-out infinite', boxShadow: '0 0 8px #EF4444' },
  recLabel: { color: '#94A3B8', fontSize: '0.875rem', fontWeight: 600 },
  recTopic: { marginBottom: 20 },
  recTopicLabel: { fontSize: '0.7rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 },
  recTopicText: { fontSize: '1.1rem', fontWeight: 700, color: 'white', lineHeight: 1.4 },
  waveWrapper: { margin: '0 auto 20px', display: 'flex', justifyContent: 'center' },
  transcriptBox: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px 20px', marginBottom: 24, minHeight: 80, maxHeight: 160, overflowY: 'auto', textAlign: 'left' },
  transcriptHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 },
  wordCount: { color: '#4A90E2', fontWeight: 700 },
  transcriptBody: { fontSize: '0.95rem', lineHeight: 1.7, minHeight: 40 },
  finalText: { color: '#E2E8F0' },
  interimText: { color: '#93C5FD', fontStyle: 'italic' },
  placeholderText: { color: '#475569', fontStyle: 'italic', fontSize: '0.875rem' },
  stopBtn: { padding: '14px 36px', background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)', borderRadius: 20, color: '#FCA5A5', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.3px' },

  processingCard: { background: 'white', borderRadius: 24, padding: '60px 48px', textAlign: 'center', boxShadow: '0 20px 60px rgba(74,144,226,0.12)', maxWidth: 480, width: '100%' },
  processingTitle: { fontFamily: "'Poppins', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: 16 },
  processingWord: { fontSize: '0.875rem', color: '#64748B', fontStyle: 'italic', margin: '0 auto 16px', maxWidth: 360 },
  processingTips: { fontSize: '0.78rem', color: '#94A3B8', letterSpacing: '0.3px' },

  resultWrapper: { display: 'flex', justifyContent: 'center', paddingTop: 20, paddingBottom: 40 },
  resultCard: { background: 'white', borderRadius: 28, padding: '40px', maxWidth: 600, width: '100%', boxShadow: '0 20px 60px rgba(74,144,226,0.12)' },
  resultHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #F1F5F9' },
  resultEmoji: { fontSize: '3rem', marginBottom: 4 },
  resultLabel: { fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: '#0F172A' },
  bigScore: { textAlign: 'right' },
  bigScoreNum: { fontFamily: "'Poppins', sans-serif", fontSize: '4.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #4A90E2, #00C9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1 },
  bigScoreSub: { fontSize: '1rem', color: '#94A3B8', fontWeight: 600 },
  xpEarned: { background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', color: 'white', padding: '10px 20px', borderRadius: 12, fontFamily: "'Poppins', sans-serif", fontWeight: 800, textAlign: 'center', marginBottom: 20, boxShadow: '0 4px 16px rgba(245,158,11,0.3)' },
  skillsSection: { marginBottom: 20 },
  scoreBarRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  scoreBarLabel: { width: 110, fontSize: '0.8rem', fontWeight: 600, color: '#475569', flexShrink: 0 },
  scoreBarTrack: { flex: 1, height: 10, background: '#F1F5F9', borderRadius: 5, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 5, transition: 'width 1s ease' },
  scoreBarNum: { width: 32, textAlign: 'right', fontWeight: 800, fontSize: '0.875rem' },
  summaryBox: { background: '#F0F7FF', border: '1px solid rgba(74,144,226,0.2)', borderRadius: 12, padding: '14px 18px', fontSize: '0.9rem', color: '#0F172A', lineHeight: 1.7, marginBottom: 16 },
  summaryLabel: { fontWeight: 700, fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 },
  summaryTamil: { color: '#5B21B6', fontStyle: 'italic', fontSize: '0.85rem', marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(124,58,237,0.15)' },
  transcriptResult: { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 18px', marginBottom: 16 },
  transcriptResultText: { fontSize: '0.875rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.6, marginTop: 6 },
  vocabSection: { background: '#F8F5FF', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 },
  vocabRow: { fontSize: '0.875rem', color: '#475569', padding: '6px 0', borderBottom: '1px solid #EDE9FE' },
  vocabWord: { fontWeight: 700, color: '#4A90E2' },
  vocabMeaning: { color: '#475569' },
  vocabTamil: { color: '#7C3AED', fontSize: '0.8rem' },
  resultActions: { display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 },
  backToListBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #4A90E2, #00C9FF)', color: 'white', border: 'none', borderRadius: 20, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(74,144,226,0.3)', fontSize: '0.9rem' },
  retryBtn: { padding: '12px 24px', background: 'white', border: '2px solid #4A90E2', color: '#4A90E2', borderRadius: 20, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
};

export default Challenges;
