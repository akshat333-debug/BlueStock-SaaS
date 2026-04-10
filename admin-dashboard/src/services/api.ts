/**
 * Live API Service for Admin Dashboard
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Analytics is largely mock frontend data since the scope of Phase 1 is DB provisioning
export const getAnalyticsData = async () => {
   return {
     totalRequests: '124,592',
     activeKeys: '342',
     totalVillages: '644,124', // Roughly accurate to DB dataset
     uptime: '99.99%',
     requestsTimeline: Array.from({ length: 7 }).map((_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        requests: Math.floor(Math.random() * 20000) + 5000,
     })),
     planDistribution: [
        { name: 'Free', value: 450 },
        { name: 'Premium', value: 210 },
        { name: 'Pro', value: 80 },
        { name: 'Unlimited', value: 12 },
     ]
   };
};

export const getApiClients = async () => {
   // Use the real B2B keys endpoint to list users' API keys as "clients"
   const res = await apiClient.get('/keys');
   
   // Map them to the admin dashboard expected format
   return res.data.data.map((k: any) => ({
     id: k.id,
     companyName: k.name, // Using key name as company proxy for demo
     adminEmail: 'admin' + k.id + '@company.com',
     plan: 'Premium',
     status: k.isActive ? 'Active' : 'Suspended',
     requestsToday: Math.floor(Math.random() * 5000),
     createdAt: k.createdAt
   }));
};

// Data Browser live integrations
export const getStates = async () => {
   const res = await apiClient.get('/states');
   return res.data.data;
}

export const getDistricts = async (stateId: number | string) => {
   const res = await apiClient.get(`/states/${stateId}/districts`);
   return res.data.data;
}

export const getSubDistricts = async (districtId: number | string) => {
   const res = await apiClient.get(`/districts/${districtId}/subdistricts`);
   return res.data.data;
}

export const getVillages = async (subDistrictId: number | string) => {
   const res = await apiClient.get(`/subdistricts/${subDistrictId}/villages`);
   return res.data.data;
}
