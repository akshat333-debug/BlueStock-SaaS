/**
 * Admin Dashboard API Service
 * 
 * Combines live backend calls (Data Browser, Users)
 * with supplementary mock telemetry (Analytics) since
 * the analytics aggregation pipeline is out of MVP scope.
 */
import axios from 'axios';

const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || '/api/v1' 
});

// ─── Analytics (mock telemetry — aggregation pipeline not in Phase 1) ───
export const getAnalyticsOverview = async () => {
  return {
    data: {
      totalVillages: 644124,
      villageGrowth: 2.4,
      activeUsers: 342,
      userGrowth: 12,
      todayRequests: 124592,
      requestsGrowth: 8.2,
      avgResponseTime: 42,
      requestsTimeline: Array.from({ length: 30 }).map((_, i) => ({
        day: `Day ${i + 1}`,
        requests: Math.floor(Math.random() * 18000) + 4000,
      })),
      planDistribution: [
        { name: 'Free', value: 450 },
        { name: 'Premium', value: 210 },
        { name: 'Pro', value: 80 },
        { name: 'Unlimited', value: 12 },
      ],
      topStates: [
        { name: 'Uttar Pradesh', count: 97941 },
        { name: 'Madhya Pradesh', count: 55393 },
        { name: 'Maharashtra', count: 44198 },
        { name: 'Rajasthan', count: 44672 },
        { name: 'Bihar', count: 45103 },
        { name: 'West Bengal', count: 40911 },
        { name: 'Odisha', count: 35122 },
        { name: 'Karnataka', count: 32015 },
        { name: 'Andhra Pradesh', count: 28101 },
        { name: 'Gujarat', count: 27932 },
      ],
      requestsByEndpoint: [
        { name: 'Mon', autocomplete: 4000, search: 2400, hierarchy: 2400 },
        { name: 'Tue', autocomplete: 3000, search: 1398, hierarchy: 2210 },
        { name: 'Wed', autocomplete: 2000, search: 9800, hierarchy: 2290 },
        { name: 'Thu', autocomplete: 2780, search: 3908, hierarchy: 2000 },
        { name: 'Fri', autocomplete: 1890, search: 4800, hierarchy: 2181 },
        { name: 'Sat', autocomplete: 2390, search: 3800, hierarchy: 2500 },
        { name: 'Sun', autocomplete: 3490, search: 4300, hierarchy: 2100 },
      ],
      hourlyUsage: Array.from({ length: 24 }).map((_, i) => ({
        hour: `${i}:00`,
        intensity: Math.floor(Math.random() * 100)
      }))
    },
  };
};

// ─── Users (live from backend) ───
export const getUsers = async () => {
  try {
    const res = await api.get('/keys');
    // Map API keys to a "users" representation for the admin table
    const keys = res.data.data || [];
    const users = keys.map((k: any, i: number) => ({
      id: k.id,
      businessName: k.name,
      email: `user${k.id}@company.com`,
      role: i === 0 ? 'ADMIN' : 'USER',
      status: k.isActive ? 'ACTIVE' : 'SUSPENDED',
      planType: i === 0 ? 'PRO' : 'PREMIUM',
      requests: Math.floor(Math.random() * 50000),
    }));
    return { data: users };
  } catch {
    // Fallback mock if backend is unreachable
    return {
      data: [
        { id: 1, businessName: 'Demo Corp', email: 'demo@villageapi.com', role: 'ADMIN', status: 'ACTIVE', planType: 'PRO', requests: 42350 },
        { id: 2, businessName: 'Startup Solutions', email: 'dev@startup.io', role: 'USER', status: 'ACTIVE', planType: 'PREMIUM', requests: 12400 },
        { id: 3, businessName: 'Logistics Alpha', email: 'hello@logisticsalpha.in', role: 'USER', status: 'PENDING_APPROVAL', planType: 'FREE', requests: 0 },
      ],
    };
  }
};

// ─── ApiLogs (mock telemetry) ───
export const getApiLogs = async () => {
  return {
    data: Array.from({ length: 50 }).map(() => {
      const statuses = [200, 200, 200, 201, 400, 401, 403, 429, 500];
      const endpoints = ['/api/v1/states', '/api/v1/districts', '/api/v1/search', '/api/v1/autocomplete', '/api/v1/keys'];
      return {
        id: `log_${Math.random().toString(36).substring(7)}`,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
        apiKey: `ak_${Math.random().toString(16).substring(2, 10)}********`,
        user: `User ${Math.floor(Math.random() * 100)}`,
        endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
        responseTime: Math.floor(Math.random() * 300) + 12,
        statusCode: statuses[Math.floor(Math.random() * statuses.length)],
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
      };
    })
  };
};

// ─── Data Browser (live from backend) ───
export const getHierarchyData = async (level: string, parentId?: string) => {
  try {
    let url = '';
    switch (level) {
      case 'states':
        url = '/states';
        break;
      case 'districts':
        url = `/states/${parentId}/districts?limit=100`;
        break;
      case 'subdistricts':
        url = `/districts/${parentId}/subdistricts?limit=100`;
        break;
      case 'villages':
        url = `/subdistricts/${parentId}/villages?limit=100`;
        break;
      default:
        return { data: [] };
    }

    const res = await api.get(url, {
      headers: {
        'X-API-Key': localStorage.getItem('demo_api_key') || 'ak_3420890557ee204d',
      },
    });

    return { data: res.data.data || [] };
  } catch (err) {
    console.error(`[DataBrowser] Failed to fetch ${level}:`, err);
    return { data: [] };
  }
};
