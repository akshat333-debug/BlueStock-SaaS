import axios from 'axios';

// --------------------------------------------------------------------------
// BLUESTOCK SAAS API CONFIGURATION
// --------------------------------------------------------------------------
// To test this locally with the real backend, replace these with:
// export const BASE_URL = 'http://localhost:3000/api/v1';
// export const API_KEY = 'your_test_key_here';

export const BASE_URL = 'https://api.villageapi.com/v1';
export const API_KEY = 'ak_sample123';

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
// This intercepts requests to simulate API responses for the live demo.
// Developers implementing this in production should DELETE this interceptor.
apiClient.interceptors.request.use((config) => {
   // We bypass real network requests and return mock data locally.
   // Returning a rejected promise that we immediately catch to fake a response.
   return Promise.reject({ config, isMock: true });
});

apiClient.interceptors.response.use(
   (res) => res,
   async (error) => {
      if (error.isMock) {
         const { url } = error.config;
         const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
         await delay(400);

         // Simulate /states
         if (url === '/states') {
            return { data: { success: true, data: [{ id: 1, name: 'Maharashtra', code: 'MH' }, { id: 2, name: 'Karnataka', code: 'KA' }] } };
         }
         
         // Simulate /states/:id/districts
         if (url?.includes('/districts')) {
            return { data: { success: true, data: [{ id: 101, name: 'Mumbai', code: 'MUM' }, { id: 102, name: 'Pune', code: 'PUN' }] } };
         }
         
         // Simulate /districts/:id/subdistricts
         if (url?.includes('/subdistricts')) {
            return { data: { success: true, data: [{ id: 201, name: 'Andheri', code: 'AND' }, { id: 202, name: 'Bandra', code: 'BAN' }] } };
         }
         
         // Simulate /subdistricts/:id/villages
         if (url?.includes('/villages')) {
            return { data: { success: true, data: [{ id: 301, name: 'Juhu', code: 'JUH' }, { id: 302, name: 'Versova', code: 'VER' }] } };
         }
         
         // Simulate /autocomplete?q=...
         if (url?.includes('/autocomplete')) {
            const query = new URLSearchParams(url.split('?')[1]).get('q') || '';
            const mocks = [
               { label: 'Juhu, Andheri, Mumbai, Maharashtra', value: '301' },
               { label: 'Juhu Tara, Andheri, Mumbai, Maharashtra', value: '305' }
            ];
            const filtered = query.length > 1 ? mocks : [];
            return { data: { success: true, data: filtered } };
         }
      }
      return Promise.reject(error);
   }
);
