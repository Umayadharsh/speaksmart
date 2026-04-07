import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [languageMode, setLanguageModeState] = useState('ENGLISH');
  const [tamilAssistLevel, setTamilAssistLevelState] = useState('BEGINNER');

  useEffect(() => {
    if (user) {
      setLanguageModeState(user.languageMode || 'ENGLISH');
      setTamilAssistLevelState(user.tamilAssistLevel || 'BEGINNER');
    }
  }, [user]);

  const setLanguageMode = async (mode, level) => {
    try {
      const res = await api.post('/user/language-mode', {
        languageMode: mode,
        tamilAssistLevel: level || tamilAssistLevel
      });
      setLanguageModeState(mode);
      if (level) setTamilAssistLevelState(level);
      updateUser({ languageMode: mode, tamilAssistLevel: level || tamilAssistLevel });
      return res.data;
    } catch (err) {
      console.error('Failed to update language mode:', err);
      throw err;
    }
  };

  const isTamilMode = languageMode === 'TAMIL_ASSISTED';

  const t = (enText, taText) => {
    if (isTamilMode && taText) return taText;
    return enText;
  };

  return (
    <LanguageContext.Provider value={{
      languageMode,
      tamilAssistLevel,
      setLanguageMode,
      isTamilMode,
      t,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
