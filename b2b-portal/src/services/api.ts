import axios from 'axios';

/**
 * Live API Service for B2B Portal
 */

export interface UserContext {
  id: number;
  email: string;
  businessName: string;
  planType: 'FREE' | 'PREMIUM' | 'PRO' | 'UNLIMITED';
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED';
}

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Since auth is mocked for the demo, we simulate the login returning context
export const loginMock = async (email: string, _password: string): Promise<UserContext> => {
  return {
    id: 1,
    email: email || 'dev@startup.io',
    businessName: 'Startup Solutions Inc',
    planType: 'PREMIUM',
    status: 'ACTIVE',
  };
};

export const getQuotaData = async () => {
   // Assuming a real endpoint would be /telemetry/quota we return a fake one for now 
   // because quota tracking goes beyond the DB scope of Phase 1
   return {
     limit: 50000,
     used: 42350,
     requestsTimeline: Array.from({ length: 7 }).map((_, i) => ({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        requests: Math.floor(Math.random() * 8000) + 2000,
     })),
   };
};

export const getApiKeys = async () => {
   const res = await apiClient.get('/keys');
   return res.data.data;
};

export const createApiKey = async (name: string) => {
   const res = await apiClient.post('/keys', { name });
   return res.data.data;
};
