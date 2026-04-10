/**
 * Mock API Service for B2B Portal
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface UserContext {
  id: number;
  email: string;
  businessName: string;
  planType: 'FREE' | 'PREMIUM' | 'PRO' | 'UNLIMITED';
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED';
}

export const loginMock = async (email: string, _password: string): Promise<UserContext> => {
  await delay(800);
  return {
    id: 1,
    email: email || 'dev@startup.io',
    businessName: 'Startup Solutions Inc',
    planType: 'PREMIUM',
    status: 'ACTIVE',
  };
};

export const getQuotaData = async () => {
   await delay(500);
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
   await delay(600);
   return [
     { id: 1, name: 'Production Server', key: 'ak_a8f9c21b4...ee8', createdAt: '2023-11-20', lastUsedAt: '10 mins ago', isActive: true },
     { id: 2, name: 'Staging Environment', key: 'ak_b292x11f4...x9a', createdAt: '2024-01-15', lastUsedAt: '2 days ago', isActive: true },
     { id: 3, name: 'Local Dev (Alice)', key: 'ak_m94l982g1...z33', createdAt: '2024-02-01', lastUsedAt: 'Never', isActive: false },
   ];
};

// Generates a mock "reveal once" secret
export const createApiKey = async (name: string) => {
   await delay(1200);
   return {
      id: Math.floor(Math.random() * 1000),
      name,
      key: `ak_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
      secret: `as_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`, // Only visible once
      createdAt: new Date().toISOString().split('T')[0],
      lastUsedAt: 'Never',
      isActive: true,
   };
};
