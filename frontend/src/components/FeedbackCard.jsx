const FeedbackCard = ({ feedback, scores, languageMode }) => {
  if (!feedback) return null;

  const { corrections = [], vocabulary = [], pronunciationTips = [], summary } = feedback;
  const isTamil = languageMode === 'TAMIL_ASSISTED';

  const scoreColor = (val) => {
    if (val >= 80) return '#10B981';
    if (val >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div style={styles.container}>
      {/* Scores */}
      {scores && (
        <div style={styles.scoresSection}>
          <div style={styles.sectionTitle}>📊 Performance Scores</div>
          <div style={styles.scoresGrid}>
            {[
              { label: 'Fluency', key: 'fluency', icon: '🗣️' },
              { label: 'Grammar', key: 'grammar', icon: '✏️' },
              { label: 'Vocab', key: 'vocabulary', icon: '📚' },
              { label: 'Confidence', key: 'confidence', icon: '💪' },
              { label: 'Overall', key: 'overall', icon: '⭐' },
            ].map(({ label, key, icon }) => (
              <div key={key} style={styles.scoreItem}>
                <div style={styles.scoreIcon}>{icon}</div>
                <div style={{ ...styles.scoreValue, color: scoreColor(scores[key]) }}>
                  {scores[key] || 0}
                </div>
                <div style={styles.scoreLabel}>{label}</div>
                <div style={styles.scoreBar}>
                  <div style={{
                    ...styles.scoreBarFill,
                    width: `${scores[key] || 0}%`,
                    background: `linear-gradient(135deg, ${scoreColor(scores[key])}, ${scoreColor(scores[key])}88)`,
                  }} />
                </div>
              </div>
            ))}
          </div>
          {scores.xpEarned > 0 && (
            <div style={styles.xpEarned}>⚡ +{scores.xpEarned} XP earned!</div>
          )}
        </div>
      )}

      {/* Grammar Corrections */}
      {corrections.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>✏️ Grammar Corrections</div>
          {corrections.map((c, i) => (
            <div key={i} style={styles.correction}>
              <div style={styles.correctionRow}>
                <span style={styles.wrong}>{c.original}</span>
                <span style={styles.arrow}>→</span>
                <span style={styles.right}>{c.corrected}</span>
              </div>
              <div style={styles.explanation}>{c.explanation}</div>
              {isTamil && c.explanationTamil && (
                <div style={styles.tamilExplanation}>🌟 {c.explanationTamil}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Vocabulary */}
      {vocabulary.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>📚 New Vocabulary</div>
          {vocabulary.slice(0, 2).map((v, i) => (
            <div key={i} style={styles.vocabItem}>
              <span style={styles.vocabWord}>{v.word}</span>
              <span style={styles.vocabMeaning}> — {v.meaning}</span>
              {isTamil && v.meaningTamil && (
                <span style={styles.vocabTamil}> ({v.meaningTamil})</span>
              )}
              {v.example && <div style={styles.vocabExample}>e.g. "{v.example}"</div>}
            </div>
          ))}
        </div>
      )}

      {/* Pronunciation Tips */}
      {pronunciationTips.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>🎙️ Pronunciation Tips</div>
          {pronunciationTips.map((tip, i) => (
            <div key={i} style={styles.tip}>💡 {tip}</div>
          ))}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div style={styles.summary}>
          {corrections.length === 0 ? '✅' : '📝'} {summary}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: '#F0F7FF',
    border: '1px solid rgba(74,144,226,0.2)',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  scoresSection: { marginBottom: 20 },
  scoresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 12,
    marginTop: 12,
  },
  scoreItem: {
    background: 'white',
    borderRadius: 12,
    padding: '12px 8px',
    textAlign: 'center',
    border: '1px solid rgba(74,144,226,0.1)',
  },
  scoreIcon: { fontSize: '1.1rem', marginBottom: 4 },
  scoreValue: { fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Poppins', sans-serif" },
  scoreLabel: { fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 },
  scoreBar: { height: 4, background: '#E2E8F0', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: 2, transition: 'width 1s ease' },
  xpEarned: {
    textAlign: 'center', marginTop: 12,
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #4A90E2, #00C9FF)',
    borderRadius: 20, color: 'white',
    fontSize: '0.85rem', fontWeight: 700,
    display: 'inline-block',
  },
  section: { marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(74,144,226,0.1)' },
  sectionTitle: { fontWeight: 700, fontSize: '0.875rem', color: '#1E293B', marginBottom: 10 },
  correction: {
    background: 'white',
    border: '1px solid #FEE2E2',
    borderRadius: 10,
    padding: '10px 12px',
    marginBottom: 8,
  },
  correctionRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  wrong: { background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'line-through' },
  arrow: { color: '#94A3B8', fontWeight: 700 },
  right: { background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600 },
  explanation: { fontSize: '0.8rem', color: '#475569', marginTop: 4 },
  tamilExplanation: { fontSize: '0.8rem', color: '#7C3AED', marginTop: 4, background: '#EDE9FE', padding: '4px 8px', borderRadius: 6 },
  vocabItem: {
    background: 'white',
    border: '1px solid rgba(74,144,226,0.15)',
    borderRadius: 10,
    padding: '10px 12px',
    marginBottom: 8,
    fontSize: '0.875rem',
  },
  vocabWord: { fontWeight: 700, color: '#4A90E2' },
  vocabMeaning: { color: '#475569' },
  vocabTamil: { color: '#7C3AED', fontSize: '0.8rem' },
  vocabExample: { color: '#94A3B8', fontSize: '0.8rem', marginTop: 4, fontStyle: 'italic' },
  tip: {
    fontSize: '0.875rem',
    color: '#475569',
    padding: '6px 0',
    borderBottom: '1px solid rgba(74,144,226,0.08)',
  },
  summary: {
    background: 'white',
    border: '1px solid rgba(74,144,226,0.2)',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: '0.875rem',
    color: '#1E293B',
    fontWeight: 500,
  },
};

export default FeedbackCard;
