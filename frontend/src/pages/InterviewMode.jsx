import { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import useVoice from '../hooks/useVoice';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

const JOB_ROLES = [
  { label: '💻 Software Engineer', value: 'Software Engineer' },
  { label: '📊 Product Manager', value: 'Product Manager' },
  { label: '📈 Data Analyst', value: 'Data Analyst' },
  { label: '📣 Marketing Manager', value: 'Marketing Manager' },
  { label: '📚 Teacher / Educator', value: 'Teacher / Educator' },
  { label: '🤝 Sales Executive', value: 'Sales Executive' },
  { label: '👥 HR Manager', value: 'HR Manager' },
  { label: '📋 Business Analyst', value: 'Business Analyst' },
  { label: '🎨 Graphic Designer', value: 'Graphic Designer' },
  { label: '✍️ Content Writer', value: 'Content Writer' },
  { label: '💬 Customer Support', value: 'Customer Support' },
  { label: '💰 Finance Manager', value: 'Finance Manager' },
];

export default function InterviewMode() {
  const { user } = useAuth();
  const { languageMode, isTamilMode } = useLanguage();

  const [phase, setPhase] = useState('SETUP'); // SETUP | ACTIVE | REVIEWING | COMPLETE
  const [jobRole, setJobRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [error, setError] = useState('');
  const [showBetterAnswer, setShowBetterAnswer] = useState(false);

  const answerRef = useRef(''); // always-current answer text for voice callback

  const voice = useVoice({ languageMode });

  // ─── Start Interview ────────────────────────────────────────────
  const startInterview = async () => {
    const role = jobRole === 'custom' ? customRole : jobRole;
    if (!role.trim()) return;
    setError('');
    try {
      const res = await api.post('/interview/start', { jobRole: role });
      setSession(res.data);
      setQuestions(res.data.questions);
      setPhase('ACTIVE');
      setCurrentQIdx(0);
      answerRef.current = '';
      setUserAnswer('');
      setTimeout(() => voice.speak(res.data.questions[0].question), 600);
    } catch (err) {
      setError('Failed to start interview. Make sure the backend is running.');
    }
  };

  // ─── Voice Recording ────────────────────────────────────────────
  const startRecording = () => {
    answerRef.current = userAnswer; // seed with any typed text
    setIsRecording(true);
    setError('');

    voice.startListening((transcript) => {
      if (transcript) {
        const newAnswer = (answerRef.current + ' ' + transcript).trim();
        answerRef.current = newAnswer;
        setUserAnswer(newAnswer);
      }
      setIsRecording(false);
    });
  };

  const stopRecording = () => {
    voice.stopListening();
    // onDone callback fires automatically after recognition ends
  };

  // ─── Submit Answer ───────────────────────────────────────────────
  const submitAnswer = async () => {
    const ans = userAnswer.trim() || answerRef.current.trim();
    if (!ans) { setError('Please say or type your answer first.'); return; }
    if (!session?.sessionId) { setError('Session not found. Please start a new interview.'); return; }

    setIsSubmitting(true);
    setPhase('REVIEWING');
    setError('');

    try {
      const res = await api.post('/interview/answer', {
        sessionId: session.sessionId,
        questionIndex: currentQIdx,
        answer: ans,
      });

      setCurrentFeedback(res.data.feedback);
      setAnswers(prev => [...prev, {
        question: questions[currentQIdx].question,
        answer: ans,
        feedback: res.data.feedback,
      }]);

      if (res.data.isComplete) {
        setSessionSummary(res.data.finalFeedback);
      }
    } catch (err) {
      setError('Error evaluating answer. Please try again.');
      setPhase('ACTIVE');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Next Question ──────────────────────────────────────────────
  const nextQuestion = () => {
    setCurrentFeedback(null);
    setUserAnswer('');
    answerRef.current = '';
    setShowBetterAnswer(false);
    setIsRecording(false);

    if (currentQIdx + 1 >= questions.length) {
      setPhase('COMPLETE');
      return;
    }

    const nextIdx = currentQIdx + 1;
    setCurrentQIdx(nextIdx);
    setPhase('ACTIVE');
    setTimeout(() => voice.speak(questions[nextIdx].question), 400);
  };

  const resetInterview = () => {
    setPhase('SETUP');
    setJobRole('');
    setCustomRole('');
    setAnswers([]);
    setCurrentQIdx(0);
    setQuestions([]);
    setSessionSummary(null);
    setSession(null);
    setUserAnswer('');
    answerRef.current = '';
    setCurrentFeedback(null);
    setError('');
  };

  const diffColor = { EASY: '#10B981', MEDIUM: '#F59E0B', HARD: '#EF4444' };

  const ScoreBar = ({ label, value }) => (
    <div style={sty.sbRow}>
      <div style={sty.sbLabel}>{label}</div>
      <div style={sty.sbTrack}>
        <div style={{
          ...sty.sbFill,
          width: `${value || 0}%`,
          background: (value || 0) >= 70
            ? 'linear-gradient(135deg,#10B981,#34D399)'
            : (value || 0) >= 50
            ? 'linear-gradient(135deg,#F59E0B,#FBBF24)'
            : 'linear-gradient(135deg,#EF4444,#F87171)',
        }} />
      </div>
      <div style={sty.sbNum}>{value || 0}</div>
    </div>
  );

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={sty.main}>
        <div style={sty.container}>

          {/* ── SETUP ──────────────────────────────────────────────── */}
          {phase === 'SETUP' && (
            <div style={sty.setupPage}>
              <div style={sty.setupHero}>
                <div style={sty.setupHeroIcon}>🎤</div>
                <h1 style={sty.pageTitle}>Interview Practice</h1>
                <p style={sty.pageSubtitle}>
                  {isTamilMode
                    ? 'Job role select pannunga. AI real interview questions kekum. Neenga answer pannunga — instant feedback kudukum!'
                    : 'Choose your target role and practice with realistic AI interview questions. Get instant feedback on every answer.'}
                </p>
              </div>

              <div style={sty.setupCard}>
                <h3 style={sty.setupCardTitle}>🎯 Select Your Job Role</h3>
                <div style={sty.roleGrid}>
                  {JOB_ROLES.map(r => (
                    <button key={r.value} onClick={() => setJobRole(r.value)}
                      style={{ ...sty.roleBtn, ...(jobRole === r.value ? sty.roleBtnActive : {}) }}>
                      {r.label}
                    </button>
                  ))}
                  <button onClick={() => setJobRole('custom')}
                    style={{ ...sty.roleBtn, ...(jobRole === 'custom' ? sty.roleBtnActive : {}) }}>
                    ✏️ Custom Role
                  </button>
                </div>

                {jobRole === 'custom' && (
                  <input type="text" style={sty.customInput}
                    placeholder="Enter your job role e.g. UX Designer..."
                    value={customRole} onChange={e => setCustomRole(e.target.value)} autoFocus />
                )}

                {error && <div style={sty.errorBanner}>⚠️ {error}</div>}

                <button id="start-interview-btn" onClick={startInterview}
                  disabled={!jobRole || (jobRole === 'custom' && !customRole.trim())}
                  style={{ ...sty.primaryBtn, marginTop: 24, width: '100%', maxWidth: 280, display: 'block', margin: '24px auto 0' }}>
                  🎤 Begin Interview
                </button>
              </div>
            </div>
          )}

          {/* ── ACTIVE / REVIEWING ─────────────────────────────────── */}
          {(phase === 'ACTIVE' || phase === 'REVIEWING') && questions[currentQIdx] && (
            <div style={sty.activePage}>

              {/* Progress */}
              <div style={sty.progressWrap}>
                <div style={sty.progressTop}>
                  <span style={sty.roleTag}>{session?.jobRole}</span>
                  <span style={sty.progressText}>Question {currentQIdx + 1} of {questions.length}</span>
                </div>
                <div style={sty.progressTrack}>
                  <div style={{ ...sty.progressFill, width: `${((currentQIdx + 1) / questions.length) * 100}%` }} />
                </div>
              </div>

              {/* Question */}
              <div style={sty.questionCard}>
                <div style={sty.questionMeta}>
                  <div style={sty.qNumBadge}>{currentQIdx + 1}</div>
                  <span style={{ ...sty.difBadge, background: diffColor[questions[currentQIdx].difficulty] + '22', color: diffColor[questions[currentQIdx].difficulty] }}>
                    {questions[currentQIdx].difficulty}
                  </span>
                  <span style={sty.catBadge}>{questions[currentQIdx].category?.replace('_', ' ')}</span>
                  <button onClick={() => voice.speak(questions[currentQIdx].question)} style={sty.hearBtn}>
                    🔊 Hear
                  </button>
                </div>
                <div style={sty.questionText}>{questions[currentQIdx].question}</div>
                {isTamilMode && questions[currentQIdx].questionTamil && (
                  <div style={sty.questionTamil}>🌟 {questions[currentQIdx].questionTamil}</div>
                )}
              </div>

              {/* Answer Input — ACTIVE phase */}
              {phase === 'ACTIVE' && (
                <div style={sty.answerCard}>
                  <div style={sty.answerHeader}>
                    <span style={sty.answerLabel}>Your Answer</span>
                    {isRecording && (
                      <span style={sty.recBadge}>🔴 Recording... <em style={{ fontSize: '0.72rem', fontWeight: 400 }}>Auto-stops after silence</em></span>
                    )}
                    {voice.interimTranscript && (
                      <span style={sty.interimBadge}>"{voice.interimTranscript}"</span>
                    )}
                  </div>

                  <textarea id="interview-answer" style={sty.textarea}
                    placeholder={isTamilMode
                      ? 'Type or speak your answer... Tamil la pesina-alum okay!'
                      : 'Type your answer or use the microphone below...'}
                    value={userAnswer}
                    onChange={e => { setUserAnswer(e.target.value); answerRef.current = e.target.value; }}
                    rows={5}
                  />

                  {error && <div style={sty.errorBannerSmall}>⚠️ {error}</div>}

                  <div style={sty.answerActions}>
                    <button onClick={isRecording ? stopRecording : startRecording}
                      style={{ ...sty.micBtn, ...(isRecording ? sty.micBtnActive : {}) }}>
                      {isRecording ? '⏹ Stop Recording' : '🎙️ Voice Answer'}
                    </button>

                    <button id="submit-answer-btn" onClick={submitAnswer}
                      disabled={(!userAnswer.trim() && !answerRef.current.trim()) || isSubmitting}
                      style={sty.primaryBtn}>
                      {isSubmitting ? '⏳ Evaluating...' : '✓ Submit Answer'}
                    </button>
                  </div>

                  <div style={sty.tipRow}>
                    💡 <em>Tip: Tap "Voice Answer", speak your answer naturally, then tap "Stop Recording". Your speech will appear above.</em>
                  </div>
                </div>
              )}

              {/* Feedback — REVIEWING phase */}
              {phase === 'REVIEWING' && currentFeedback && (
                <div style={sty.feedbackCard}>
                  <h3 style={sty.feedbackTitle}>📊 Performance Feedback</h3>

                  <div style={sty.scoresGrid}>
                    <ScoreBar label="Overall"    value={currentFeedback.overallScore} />
                    <ScoreBar label="Content"    value={currentFeedback.contentScore} />
                    <ScoreBar label="Grammar"    value={currentFeedback.grammarScore} />
                    <ScoreBar label="Fluency"    value={currentFeedback.fluencyScore} />
                    <ScoreBar label="Confidence" value={currentFeedback.confidenceScore} />
                  </div>

                  {/* Your answer */}
                  <div style={sty.yourAnswerBox}>
                    <div style={sty.yourAnswerLabel}>🎙️ Your Answer</div>
                    <div style={sty.yourAnswerText}>"{answers[answers.length - 1]?.answer}"</div>
                  </div>

                  {/* Grammar corrections */}
                  {currentFeedback.grammarCorrections?.length > 0 && (
                    <div style={sty.corrBox}>
                      <div style={sty.corrTitle}>✏️ Grammar Improvements</div>
                      {currentFeedback.grammarCorrections.map((c, i) => (
                        <div key={i} style={sty.corrItem}>
                          <span style={sty.wrong}>{c.original}</span>
                          <span style={{ color: '#94A3B8', margin: '0 6px' }}>→</span>
                          <span style={sty.right}>{c.corrected}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Strengths / Improvements */}
                  <div style={sty.strengthsGrid}>
                    <div>
                      <div style={sty.strengthsTitle}>✅ Strengths</div>
                      {currentFeedback.strengths?.map((s, i) => (
                        <div key={i} style={sty.strengthItem}>• {s}</div>
                      ))}
                    </div>
                    <div>
                      <div style={{ ...sty.strengthsTitle, color: '#F59E0B' }}>📈 Improve</div>
                      {currentFeedback.improvements?.map((s, i) => (
                        <div key={i} style={sty.strengthItem}>• {s}</div>
                      ))}
                    </div>
                  </div>

                  {/* Better Answer */}
                  <button onClick={() => setShowBetterAnswer(!showBetterAnswer)} style={sty.ghostBtn}>
                    {showBetterAnswer ? '▲ Hide' : '💡 Show'} Suggested Better Answer
                  </button>

                  {showBetterAnswer && (
                    <div style={sty.betterBox}>
                      <div style={sty.betterTitle}>💡 Suggested Answer</div>
                      <div style={sty.betterText}>{currentFeedback.betterAnswer}</div>
                      {isTamilMode && currentFeedback.betterAnswerTamil && (
                        <div style={sty.betterTamil}>🌟 {currentFeedback.betterAnswerTamil}</div>
                      )}
                      <button onClick={() => voice.speak(currentFeedback.betterAnswer)} style={sty.ghostBtnSmall}>
                        🔊 Listen to Better Answer
                      </button>
                    </div>
                  )}

                  <button id="next-question-btn" onClick={nextQuestion} style={{ ...sty.primaryBtn, width: '100%', marginTop: 20 }}>
                    {currentQIdx + 1 >= questions.length ? '✅ Complete Interview' : `Next Question (${currentQIdx + 2}/${questions.length}) →`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── COMPLETE ────────────────────────────────────────────── */}
          {phase === 'COMPLETE' && (
            <div style={sty.completePage}>
              <div style={sty.completeCard}>
                <div style={sty.completeIcon}>🏆</div>
                <h2 style={sty.completeTitle}>Interview Complete!</h2>
                <div style={sty.completeRole}>{session?.jobRole}</div>

                {sessionSummary && (
                  <>
                    <p style={sty.completeSummary}>{sessionSummary.summary}</p>
                    {isTamilMode && sessionSummary.summaryTamil && (
                      <p style={sty.completeSummaryTamil}>{sessionSummary.summaryTamil}</p>
                    )}
                    <div style={sty.completeGrid}>
                      <div style={sty.completeSection}>
                        <div style={sty.completeSectionTitle}>✅ Strengths</div>
                        {sessionSummary.strengths?.map((s, i) => (
                          <div key={i} style={sty.completeItem}>• {s}</div>
                        ))}
                      </div>
                      <div style={sty.completeSection}>
                        <div style={{ ...sty.completeSectionTitle, color: '#F59E0B' }}>📈 To Improve</div>
                        {sessionSummary.improvements?.map((s, i) => (
                          <div key={i} style={sty.completeItem}>• {s}</div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Per-question summary */}
                <div style={sty.answerSummary}>
                  <div style={sty.summaryTitle}>📋 Answer Review</div>
                  {answers.map((a, i) => (
                    <div key={i} style={sty.summaryItem}>
                      <div style={sty.summaryQ}>Q{i + 1}: {a.question}</div>
                      <div style={sty.summaryScore}>
                        Score: <strong>{a.feedback?.overallScore || 0}/100</strong>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={sty.completeActions}>
                  <button onClick={resetInterview} style={sty.primaryBtn}>🎤 New Interview</button>
                  <button onClick={() => window.location.href = '/analytics'} style={sty.secondaryBtn}>📊 View Analytics</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────
const sty = {
  main: { marginLeft: 260, minHeight: '100vh', background: '#F0F7FF' },
  container: { padding: '32px', maxWidth: 860, margin: '0 auto' },

  // SETUP
  setupPage: {},
  setupHero: { textAlign: 'center', marginBottom: 32 },
  setupHeroIcon: { fontSize: '3.5rem', marginBottom: 12 },
  pageTitle: { fontFamily: "'Poppins',sans-serif", fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg,#1565C0,#4A90E2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  pageSubtitle: { color: '#475569', marginTop: 8, lineHeight: 1.7, maxWidth: 580, margin: '8px auto 0' },
  setupCard: { background: 'white', borderRadius: 24, padding: '32px', boxShadow: '0 12px 40px rgba(74,144,226,0.1)', border: '1px solid rgba(74,144,226,0.1)' },
  setupCardTitle: { fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#0F172A', marginBottom: 20 },
  roleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 10 },
  roleBtn: { padding: '11px 12px', border: '2px solid rgba(74,144,226,0.15)', borderRadius: 12, background: 'white', color: '#475569', fontSize: '0.83rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', lineHeight: 1.3 },
  roleBtnActive: { border: '2px solid #4A90E2', background: '#E8F4FF', color: '#1565C0', fontWeight: 700 },
  customInput: { width: '100%', marginTop: 16, padding: '12px 16px', border: '2px solid rgba(74,144,226,0.3)', borderRadius: 12, fontSize: '0.95rem', fontFamily: "'Inter',sans-serif", outline: 'none', boxSizing: 'border-box' },
  errorBanner: { marginTop: 16, padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, color: '#991B1B', fontSize: '0.85rem' },
  errorBannerSmall: { padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, color: '#EF4444', fontSize: '0.8rem', marginTop: 8 },
  primaryBtn: { padding: '13px 28px', background: 'linear-gradient(135deg,#4A90E2,#00C9FF)', color: 'white', border: 'none', borderRadius: 20, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(74,144,226,0.4)', letterSpacing: '0.3px', transition: 'all 0.2s' },

  // ACTIVE
  activePage: {},
  progressWrap: { marginBottom: 20 },
  progressTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  roleTag: { padding: '5px 14px', background: 'linear-gradient(135deg,#4A90E2,#00C9FF)', color: 'white', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 },
  progressText: { color: '#64748B', fontSize: '0.85rem', fontWeight: 600 },
  progressTrack: { height: 6, background: 'rgba(74,144,226,0.15)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, background: 'linear-gradient(135deg,#4A90E2,#00C9FF)', transition: 'width 0.5s ease' },

  questionCard: { background: 'white', borderRadius: 20, padding: '28px', boxShadow: '0 8px 32px rgba(74,144,226,0.1)', border: '1px solid rgba(74,144,226,0.1)', marginBottom: 20 },
  questionMeta: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' },
  qNumBadge: { width: 34, height: 34, background: 'linear-gradient(135deg,#4A90E2,#00C9FF)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 },
  difBadge: { padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 },
  catBadge: { padding: '4px 12px', borderRadius: 20, background: '#E8F4FF', color: '#1565C0', fontSize: '0.75rem', fontWeight: 600 },
  hearBtn: { marginLeft: 'auto', padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(74,144,226,0.2)', background: 'white', color: '#4A90E2', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' },
  questionText: { fontSize: '1.15rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.65 },
  questionTamil: { marginTop: 14, padding: '12px 16px', background: '#EDE9FE', borderRadius: 10, color: '#5B21B6', fontSize: '0.875rem', lineHeight: 1.6 },

  answerCard: { background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 16px rgba(74,144,226,0.08)', border: '1px solid rgba(74,144,226,0.08)' },
  answerHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  answerLabel: { fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' },
  recBadge: { padding: '4px 12px', background: '#FEE2E2', color: '#DC2626', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 },
  interimBadge: { color: '#4A90E2', fontSize: '0.82rem', fontStyle: 'italic', background: '#EEF6FF', padding: '3px 10px', borderRadius: 12 },
  textarea: { width: '100%', padding: '14px 16px', border: '2px solid rgba(74,144,226,0.2)', borderRadius: 12, fontSize: '0.95rem', lineHeight: 1.65, resize: 'vertical', fontFamily: "'Inter',sans-serif", color: '#0F172A', outline: 'none', boxSizing: 'border-box' },
  answerActions: { display: 'flex', gap: 12, marginTop: 16, justifyContent: 'space-between', flexWrap: 'wrap' },
  micBtn: { padding: '12px 24px', border: '2px solid rgba(74,144,226,0.3)', borderRadius: 20, background: 'white', color: '#4A90E2', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' },
  micBtnActive: { background: '#FEF2F2', borderColor: '#EF4444', color: '#DC2626' },
  tipRow: { fontSize: '0.78rem', color: '#94A3B8', marginTop: 12, padding: '8px 12px', background: '#F8FAFC', borderRadius: 8 },

  // FEEDBACK
  feedbackCard: { background: 'white', borderRadius: 20, padding: '28px', boxShadow: '0 4px 16px rgba(74,144,226,0.08)', border: '1px solid rgba(74,144,226,0.08)' },
  feedbackTitle: { fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: '1.05rem', marginBottom: 20, color: '#0F172A' },
  scoresGrid: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 },
  sbRow: { display: 'flex', alignItems: 'center', gap: 12 },
  sbLabel: { width: 80, fontSize: '0.8rem', fontWeight: 600, color: '#475569' },
  sbTrack: { flex: 1, height: 10, background: '#E2E8F0', borderRadius: 5, overflow: 'hidden' },
  sbFill: { height: '100%', borderRadius: 5, transition: 'width 1.2s ease' },
  sbNum: { width: 28, textAlign: 'right', fontWeight: 800, fontSize: '0.875rem', color: '#0F172A' },

  yourAnswerBox: { background: '#F0F7FF', border: '1px solid rgba(74,144,226,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 },
  yourAnswerLabel: { fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 },
  yourAnswerText: { fontSize: '0.875rem', color: '#1E293B', fontStyle: 'italic', lineHeight: 1.6 },

  corrBox: { background: '#FFF8F8', border: '1px solid #FECACA', borderRadius: 12, padding: '16px', marginBottom: 16 },
  corrTitle: { fontWeight: 700, fontSize: '0.85rem', color: '#991B1B', marginBottom: 10 },
  corrItem: { marginBottom: 8, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4 },
  wrong: { background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 6, textDecoration: 'line-through', fontWeight: 600 },
  right: { background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 6, fontWeight: 700 },

  strengthsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  strengthsTitle: { fontWeight: 700, fontSize: '0.82rem', color: '#10B981', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
  strengthItem: { fontSize: '0.82rem', color: '#475569', padding: '3px 0', lineHeight: 1.5 },

  ghostBtn: { padding: '8px 16px', background: 'transparent', border: '1px solid rgba(74,144,226,0.3)', borderRadius: 20, color: '#4A90E2', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginBottom: 12, transition: 'all 0.2s' },
  ghostBtnSmall: { padding: '6px 14px', background: 'transparent', border: '1px solid rgba(74,144,226,0.3)', borderRadius: 20, color: '#4A90E2', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', marginTop: 10, transition: 'all 0.2s' },
  betterBox: { background: '#F0F7FF', border: '1px solid rgba(74,144,226,0.2)', borderRadius: 12, padding: '16px', marginBottom: 16 },
  betterTitle: { fontWeight: 700, fontSize: '0.85rem', color: '#1565C0', marginBottom: 8 },
  betterText: { color: '#1E293B', lineHeight: 1.75, fontSize: '0.9rem' },
  betterTamil: { color: '#5B21B6', fontSize: '0.85rem', marginTop: 8, background: '#EDE9FE', borderRadius: 8, padding: '8px 12px' },

  // COMPLETE
  completePage: { display: 'flex', justifyContent: 'center', paddingTop: 20 },
  completeCard: { background: 'white', borderRadius: 24, padding: '40px', maxWidth: 640, width: '100%', boxShadow: '0 12px 40px rgba(74,144,226,0.12)', textAlign: 'center' },
  completeIcon: { fontSize: '4rem', marginBottom: 12 },
  completeTitle: { fontFamily: "'Poppins',sans-serif", fontWeight: 800, fontSize: '2rem', color: '#0F172A', marginBottom: 4 },
  completeRole: { color: '#4A90E2', fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 },
  completeSummary: { color: '#475569', lineHeight: 1.7, fontSize: '0.9rem', marginBottom: 8 },
  completeSummaryTamil: { color: '#5B21B6', background: '#EDE9FE', borderRadius: 10, padding: '10px 16px', margin: '8px 0 20px', fontSize: '0.875rem' },
  completeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  completeSection: { textAlign: 'left' },
  completeSectionTitle: { fontWeight: 700, fontSize: '0.82rem', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 },
  completeItem: { fontSize: '0.82rem', color: '#475569', padding: '3px 0', lineHeight: 1.5 },
  answerSummary: { background: '#F8FAFC', borderRadius: 12, padding: '16px', marginBottom: 24, textAlign: 'left' },
  summaryTitle: { fontWeight: 700, fontSize: '0.82rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 },
  summaryItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E2E8F0', fontSize: '0.82rem' },
  summaryQ: { color: '#475569', flex: 1, paddingRight: 12 },
  summaryScore: { color: '#0F172A', flexShrink: 0 },
  completeActions: { display: 'flex', gap: 12, justifyContent: 'center' },
  secondaryBtn: { padding: '13px 24px', background: 'white', border: '2px solid #4A90E2', color: '#4A90E2', borderRadius: 20, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' },
};
