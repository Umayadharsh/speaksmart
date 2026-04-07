// SpeakSmart Chrome Extension Popup JS
const APP_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5001/api';

let currentUser = null;
let currentLangMode = 'ENGLISH';

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadUserFromStorage();
  await checkOnlineStatus();
});

async function loadUserFromStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['ss_token', 'ss_user', 'ss_lang_mode'], async (result) => {
      const token = result.ss_token;
      const savedUser = result.ss_user;
      currentLangMode = result.ss_lang_mode || 'ENGLISH';

      if (token && savedUser) {
        currentUser = savedUser;
        showLoggedInUI(savedUser);
        // Verify token is still valid
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            currentUser = data.user;
            chrome.storage.local.set({ ss_user: data.user });
            showLoggedInUI(data.user);
          } else {
            showLoggedOutUI();
          }
        } catch (e) {
          // Network error, show cached user
          showLoggedInUI(savedUser);
        }
      } else {
        showLoggedOutUI();
      }
      resolve();
    });
  });
}

async function checkOnlineStatus() {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      document.getElementById('status-badge').textContent = 'Online';
      document.getElementById('status-badge').className = 'badge badge-online';
    }
  } catch (e) {
    document.getElementById('status-badge').textContent = 'Offline';
    document.getElementById('status-badge').className = 'badge badge-offline';
  }
}

function showLoggedInUI(user) {
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('user-section').classList.remove('hidden');
  document.getElementById('actions-section').classList.remove('hidden');
  document.getElementById('lang-toggle-section').classList.remove('hidden');
  document.getElementById('streak-section').classList.remove('hidden');

  // Update user info
  document.getElementById('user-name').textContent = user.name || 'User';
  document.getElementById('user-avatar').textContent = (user.name || 'U').charAt(0).toUpperCase();
  document.getElementById('user-level').textContent = user.level || 'Beginner';
  document.getElementById('user-xp').textContent = `⚡ ${(user.xp || 0).toLocaleString()}`;
  document.getElementById('streak-text').textContent = `${user.streak?.current || 0} day streak • Best: ${user.streak?.longest || 0}`;

  // Language Mode
  const mode = user.languageMode || currentLangMode;
  updateLangUI(mode);
  document.getElementById('footer-mode').textContent = mode === 'TAMIL_ASSISTED' ? '🌟 Tamil-Assisted' : '🇬🇧 English Mode';
}

function showLoggedOutUI() {
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('user-section').classList.add('hidden');
  document.getElementById('actions-section').classList.add('hidden');
  document.getElementById('lang-toggle-section').classList.add('hidden');
  document.getElementById('streak-section').classList.add('hidden');
}

function updateLangUI(mode) {
  currentLangMode = mode;
  const enBtn = document.getElementById('lang-en');
  const taBtn = document.getElementById('lang-ta');
  if (mode === 'TAMIL_ASSISTED') {
    enBtn.classList.remove('active');
    taBtn.classList.add('active');
  } else {
    taBtn.classList.remove('active');
    enBtn.classList.add('active');
  }
}

async function setLanguage(mode) {
  updateLangUI(mode);
  chrome.storage.local.set({ ss_lang_mode: mode });
  document.getElementById('footer-mode').textContent = mode === 'TAMIL_ASSISTED' ? '🌟 Tamil-Assisted' : '🇬🇧 English Mode';

  // Update on server
  chrome.storage.local.get(['ss_token'], async (result) => {
    if (result.ss_token) {
      try {
        await fetch(`${API_URL}/user/language-mode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${result.ss_token}` },
          body: JSON.stringify({ languageMode: mode })
        });
      } catch (e) {}
    }
  });
}

function openApp(path) {
  chrome.tabs.create({ url: `${APP_URL}${path}` });
  window.close();
}

// Send daily reminders
chrome.runtime?.onMessage?.addListener((msg) => {
  if (msg.type === 'STREAK_REMINDER') {
    if (Notification.permission === 'granted') {
      new Notification('SpeakSmart — Practice Today! 🎯', {
        body: msg.body || 'Keep your streak alive! Speak for 5 minutes today.',
        icon: '../icons/icon48.png',
      });
    }
  }
});

// Make functions available globally for onclick
window.openApp = openApp;
window.setLanguage = setLanguage;
