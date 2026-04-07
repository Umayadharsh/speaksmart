import { useLanguage } from '../context/LanguageContext';

const LanguageToggle = ({ compact = false }) => {
  const { languageMode, setLanguageMode, tamilAssistLevel } = useLanguage();

  const handleToggle = async (mode) => {
    if (mode === languageMode) return;
    await setLanguageMode(mode);
  };

  if (compact) {
    return (
      <div style={styles.compact}>
        <div style={styles.compactLabel}>Language Mode</div>
        <div style={styles.toggleRow}>
          <button
            onClick={() => handleToggle('ENGLISH')}
            style={{
              ...styles.compactBtn,
              ...(languageMode === 'ENGLISH' ? styles.compactBtnActive : {}),
            }}
          >
            🇬🇧 EN
          </button>
          <button
            onClick={() => handleToggle('TAMIL_ASSISTED')}
            style={{
              ...styles.compactBtn,
              ...(languageMode === 'TAMIL_ASSISTED' ? styles.compactBtnActiveTamil : {}),
            }}
          >
            🌟 தமிழ்
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🌐 Language Mode</div>
        <div style={styles.subtitle}>Choose your learning preference</div>
      </div>

      <div style={styles.options}>
        <button
          onClick={() => handleToggle('ENGLISH')}
          style={{
            ...styles.option,
            ...(languageMode === 'ENGLISH' ? styles.optionActive : {}),
          }}
        >
          <span style={styles.optionIcon}>🇬🇧</span>
          <div>
            <div style={styles.optionTitle}>English Only</div>
            <div style={styles.optionDesc}>Full English coaching</div>
          </div>
          {languageMode === 'ENGLISH' && <span style={styles.check}>✓</span>}
        </button>

        <button
          onClick={() => handleToggle('TAMIL_ASSISTED')}
          style={{
            ...styles.option,
            ...(languageMode === 'TAMIL_ASSISTED' ? styles.optionActiveTamil : {}),
          }}
        >
          <span style={styles.optionIcon}>🌟</span>
          <div>
            <div style={styles.optionTitle}>Tamil-Assisted</div>
            <div style={styles.optionDesc}>Tanglish support • தமிழ்</div>
          </div>
          {languageMode === 'TAMIL_ASSISTED' && <span style={styles.check}>✓</span>}
        </button>
      </div>

      {languageMode === 'TAMIL_ASSISTED' && (
        <div style={styles.levelSection}>
          <div style={styles.levelLabel}>Assistance Level</div>
          <div style={styles.levelButtons}>
            {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(level => (
              <button
                key={level}
                onClick={() => setLanguageMode('TAMIL_ASSISTED', level)}
                style={{
                  ...styles.levelBtn,
                  ...(tamilAssistLevel === level ? styles.levelBtnActive : {}),
                }}
              >
                {level === 'BEGINNER' ? '🌱' : level === 'INTERMEDIATE' ? '🌿' : '🌳'}
                {' '}{level.charAt(0) + level.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    border: '1px solid rgba(74,144,226,0.15)',
    borderRadius: 16, padding: 20,
  },
  header: { marginBottom: 16 },
  title: { fontWeight: 700, fontSize: '1rem', color: '#0F172A' },
  subtitle: { fontSize: '0.8rem', color: '#94A3B8', marginTop: 2 },
  options: { display: 'flex', gap: 12, marginBottom: 16 },
  option: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12,
    border: '2px solid rgba(74,144,226,0.15)',
    background: 'white', cursor: 'pointer',
    transition: 'all 0.2s ease', textAlign: 'left',
  },
  optionActive: {
    border: '2px solid #4A90E2',
    background: '#E8F4FF',
    boxShadow: '0 0 0 4px rgba(74,144,226,0.1)',
  },
  optionActiveTamil: {
    border: '2px solid #7C3AED',
    background: '#EDE9FE',
    boxShadow: '0 0 0 4px rgba(124,58,237,0.1)',
  },
  optionIcon: { fontSize: '1.5rem' },
  optionTitle: { fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' },
  optionDesc: { fontSize: '0.75rem', color: '#94A3B8' },
  check: { marginLeft: 'auto', color: '#4A90E2', fontWeight: 700, fontSize: '1.1rem' },
  levelSection: { borderTop: '1px solid rgba(74,144,226,0.1)', paddingTop: 16 },
  levelLabel: { fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: 8 },
  levelButtons: { display: 'flex', gap: 8 },
  levelBtn: {
    flex: 1, padding: '8px 4px',
    border: '1px solid rgba(124,58,237,0.2)',
    borderRadius: 8, background: 'white',
    color: '#475569', fontSize: '0.75rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s ease',
  },
  levelBtnActive: {
    background: '#7C3AED', color: 'white',
    border: '1px solid #7C3AED',
  },
  // Compact (sidebar) styles
  compact: { padding: '12px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 12 },
  compactLabel: { fontSize: '0.7rem', color: '#64748B', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
  toggleRow: { display: 'flex', gap: 6 },
  compactBtn: {
    flex: 1, padding: '7px 4px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, background: 'transparent',
    color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s ease',
  },
  compactBtnActive: { background: 'rgba(74,144,226,0.3)', color: '#93C5FD', border: '1px solid rgba(74,144,226,0.4)' },
  compactBtnActiveTamil: { background: 'rgba(124,58,237,0.3)', color: '#C4B5FD', border: '1px solid rgba(124,58,237,0.4)' },
};

export default LanguageToggle;
