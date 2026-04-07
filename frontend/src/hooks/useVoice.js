import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useVoice - Production-grade Web Speech API hook
 * 
 * Key design:
 * - startListening(onDone) accepts a FRESH callback each time → NO stale closure bugs
 * - continuous: true + silence detection (2.5s auto-stop) → natural UX
 * - transcriptRef always holds the latest text for reliable capture
 * - Voices loaded with proper fallback chain
 */
const useVoice = ({ languageMode = 'ENGLISH', onError } = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const transcriptRef = useRef('');       // Always-current accumulated text
  const silenceTimerRef = useRef(null);
  const onDoneRef = useRef(null);         // Fresh callback, set each startListening call
  const isListeningRef = useRef(false);   // Sync ref to avoid stale closure checks
  const langModeRef = useRef(languageMode);

  // Keep langMode ref current
  useEffect(() => { langModeRef.current = languageMode; }, [languageMode]);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SR);
    return () => {
      clearTimeout(silenceTimerRef.current);
      try { recognitionRef.current?.abort(); } catch (e) {}
      synthRef.current?.cancel();
    };
  }, []);

  // ─── Start Listening ──────────────────────────────────────────
  const startListening = useCallback((onDone) => {
    // If already listening, stop and let onend deliver the transcript
    if (isListeningRef.current) {
      clearTimeout(silenceTimerRef.current);
      try { recognitionRef.current?.stop(); } catch (e) {}
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      if (onDone) onDone('');
      return;
    }

    // Cancel any ongoing TTS
    synthRef.current?.cancel();
    setIsSpeaking(false);

    // Reset transcript accumulator
    transcriptRef.current = '';
    setInterimTranscript('');

    // Store the FRESH callback — this is the key fix for stale closures
    onDoneRef.current = onDone || null;

    const recognition = new SR();
    recognition.lang = langModeRef.current === 'TAMIL_ASSISTED' ? 'ta-IN' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
    };

    recognition.onresult = (event) => {
      // Any speech detected → reset silence timer
      clearTimeout(silenceTimerRef.current);

      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          transcriptRef.current = (transcriptRef.current + ' ' + res[0].transcript).trim();
        } else {
          interim += res[0].transcript;
        }
      }
      setInterimTranscript(interim);

      // Auto-stop after 2.5s of silence
      silenceTimerRef.current = setTimeout(() => {
        if (isListeningRef.current) {
          try { recognition.stop(); } catch (e) {}
        }
      }, 2500);
    };

    recognition.onspeechend = () => {
      // Speech ended → tight 1s timer before stopping
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (isListeningRef.current) {
          try { recognition.stop(); } catch (e) {}
        }
      }, 1000);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      isListeningRef.current = false;
      clearTimeout(silenceTimerRef.current);

      const finalText = transcriptRef.current.trim();
      transcriptRef.current = '';

      // Deliver transcript via fresh callback — no stale values!
      if (onDoneRef.current) {
        const cb = onDoneRef.current;
        onDoneRef.current = null;
        if (finalText) cb(finalText);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setInterimTranscript('');
      isListeningRef.current = false;
      clearTimeout(silenceTimerRef.current);

      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        if (onError) onError(event.error);
      }

      // Deliver any partial transcript on error
      const finalText = transcriptRef.current.trim();
      transcriptRef.current = '';
      if (finalText && onDoneRef.current) {
        const cb = onDoneRef.current;
        onDoneRef.current = null;
        cb(finalText);
      } else {
        onDoneRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (err) {
      console.error('Recognition start failed:', err);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, []); // No deps — fully ref-based, no stale closures possible

  // ─── Stop Listening (manual) ──────────────────────────────────
  const stopListening = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current && isListeningRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  }, []);

  // ─── Text-to-Speech ───────────────────────────────────────────
  const speak = useCallback((text, onEnd) => {
    if (!synthRef.current || !text) {
      if (onEnd) onEnd();
      return;
    }
    synthRef.current.cancel();

    // Strip markdown formatting and emoji for clean TTS
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
      .replace(/[→←↑↓✓●▲▼►◄]/g, '')
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .trim();

    if (!clean) { if (onEnd) onEnd(); return; }

    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(clean);
      const voices = synthRef.current.getVoices();

      if (langModeRef.current === 'TAMIL_ASSISTED') {
        utterance.voice =
          voices.find(v => v.lang === 'ta-IN') ||
          voices.find(v => v.lang.startsWith('ta')) ||
          voices.find(v => v.lang === 'en-IN') ||
          voices.find(v => v.name.toLowerCase().includes('indian')) ||
          voices.find(v => v.lang.startsWith('en')) ||
          null;
        utterance.rate = 0.88;
        utterance.pitch = 1.0;
        utterance.lang = utterance.voice?.lang || 'en-IN';
      } else {
        utterance.voice =
          voices.find(v => v.name === 'Google UK English Female') ||
          voices.find(v => v.name === 'Google UK English Male') ||
          voices.find(v => v.name === 'Google US English') ||
          voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
          voices.find(v => v.lang === 'en-GB') ||
          voices.find(v => v.lang === 'en-US') ||
          voices.find(v => v.lang.startsWith('en')) ||
          null;
        utterance.rate = 0.95;
        utterance.pitch = 1.02;
        utterance.lang = 'en-US';
      }

      utterance.volume = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); if (onEnd) onEnd(); };
      utterance.onerror = () => { setIsSpeaking(false); if (onEnd) onEnd(); };

      synthRef.current.speak(utterance);
    };

    const voices = synthRef.current.getVoices();
    if (voices.length === 0) {
      const handler = () => {
        synthRef.current.removeEventListener('voiceschanged', handler);
        doSpeak();
      };
      synthRef.current.addEventListener('voiceschanged', handler);
      // Fallback if event never fires
      setTimeout(() => {
        synthRef.current.removeEventListener('voiceschanged', handler);
        if (!synthRef.current.speaking) doSpeak();
      }, 1000);
    } else {
      doSpeak();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
};

export default useVoice;
