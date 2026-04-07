// SpeakSmart Chrome Extension — Background Service Worker (MV3)

const APP_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:5000/api';

// Install event
self.addEventListener('install', (event) => {
  console.log('SpeakSmart Service Worker installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('SpeakSmart Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Schedule daily streak reminder
function scheduleDailyReminder() {
  const now = new Date();
  const reminderHour = 19; // 7 PM
  let reminderTime = new Date(now);
  reminderTime.setHours(reminderHour, 0, 0, 0);
  
  if (now > reminderTime) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }
  
  const msUntilReminder = reminderTime - now;
  
  setTimeout(() => {
    sendStreakReminder();
    scheduleDailyReminder(); // Reschedule
  }, msUntilReminder);
}

async function sendStreakReminder() {
  const clients = await self.clients.matchAll({ type: 'window' });
  
  // Show notification
  if (self.Notification && Notification.permission === 'granted') {
    self.registration.showNotification('SpeakSmart — Time to Practice! 🎯', {
      body: "Don't break your streak! Speak for just 5 minutes today.",
      icon: '/icons/icon48.png',
      badge: '/icons/icon16.png',
      tag: 'streak-reminder',
      actions: [
        { action: 'open', title: '🎤 Start Practice' },
        { action: 'dismiss', title: 'Later' },
      ]
    });
  }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.openWindow(`${APP_URL}/call`)
    );
  }
});

// Handle messages from popup
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SAVE_TOKEN':
      // Store token securely
      chrome.storage.local.set({ ss_token: data.token, ss_user: data.user });
      break;
    case 'CLEAR_AUTH':
      chrome.storage.local.remove(['ss_token', 'ss_user']);
      break;
    case 'REQUEST_STATUS':
      event.source?.postMessage({ type: 'STATUS', online: navigator.onLine });
      break;
    default:
      break;
  }
});

// Listen for token updates from website (cross-origin message)
self.addEventListener('message', (event) => {
  if (event.origin === new URL(APP_URL).origin) {
    if (event.data?.type === 'SS_LOGIN') {
      chrome.storage.local.set({
        ss_token: event.data.token,
        ss_user: event.data.user,
      });
    }
  }
});

// Start the daily reminder schedule
scheduleDailyReminder();

console.log('🎯 SpeakSmart background service worker running');
