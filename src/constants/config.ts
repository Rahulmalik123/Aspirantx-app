// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'AspirantHub',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,
  
  // API Configuration
  // ⚠️ IMPORTANT: This is the SINGLE SOURCE OF TRUTH for all API URLs
  // All API calls automatically use this base URL via src/api/client.ts
  // Do NOT hardcode API URLs anywhere else in the app
  API_BASE_URL: 'https://backend.aspirantx.com', // Always use HTTP for now (works on both emulator and real device)
  
  API_TIMEOUT: 30000,
  
  // Socket Configuration
  // Uses same base URL as API for consistency
  SOCKET_URL: 'https://backend.aspirantx.com', // Always use HTTP for now
  
  // Pagination
  PAGE_SIZE: 20,
  
  // Quiz Configuration
  QUIZ_TIME_LIMIT: 60, // seconds per question
  BATTLE_TIME_LIMIT: 30, // seconds per question in battle
  TOURNAMENT_TIME_LIMIT: 45, // seconds per question in tournament
  
  // Wallet
  MIN_WITHDRAWAL: 100,
  REFERRAL_BONUS: 50,
  
  // Cache
  CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
};

// Feature Flags
export const FEATURES = {
  TOURNAMENTS: true,
  BATTLES: true,
  SOCIAL_FEED: true,
  CONTENT_STORE: true,
  CREATOR_MARKETPLACE: true,
  PYQ: true,
  OFFLINE_MODE: true,
};
