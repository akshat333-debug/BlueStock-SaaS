import axios from 'axios';

// --------------------------------------------------------------------------
// BLUESTOCK SAAS API CONFIGURATION
// --------------------------------------------------------------------------
// To test this locally with the real backend, replace these with:
// export const BASE_URL = 'http://localhost:3000/api/v1';
// export const API_KEY = 'your_test_key_here';

export const BASE_URL = 'http://localhost:3000/api/v1';
export const API_KEY = 'ak_1996551b6f99bb84';

/**
 * Configure Axios client with the required X-API-Key header.
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

// --------------------------------------------------------------------------
// MOCK INTERCEPTOR (FOR DEMO PURPOSES ONLY)
// --------------------------------------------------------------------------
// Removed: Real server requests now pass through natively.
