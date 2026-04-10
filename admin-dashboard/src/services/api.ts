/**
 * Mock API Service for Admin Dashboard
 * Simulates latency and returns placeholder data based on Phase 2 schemas.
 */

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAnalyticsOverview = async () => {
  await delay(600);
  return {
    success: true,
    data: {
      totalVillages: 597464,
      villageGrowth: 0.12,
      activeUsers: 142,
      userGrowth: 15.4,
      todayRequests: 143500,
      requestsGrowth: 8.2,
      avgResponseTime: 42,
      slaStatus: 'healthy',
      topStates: [
        { name: 'Uttar Pradesh', count: 97814 },
        { name: 'Madhya Pradesh', count: 51929 },
        { name: 'Odisha', count: 47675 },
        { name: 'Bihar', count: 39073 },
        { name: 'Maharashtra', count: 40959 },
      ],
      requestsTimeline: Array.from({ length: 30 }).map((_, i) => ({
        day: `Day ${i + 1}`,
        requests: Math.floor(Math.random() * 50000) + 100000,
      })),
      planDistribution: [
        { name: 'Free', value: 85 },
        { name: 'Premium', value: 40 },
        { name: 'Pro', value: 15 },
        { name: 'Unlimited', value: 2 },
      ]
    }
  };
};

export const getUsers = async () => {
  await delay(800);
  return {
    success: true,
    data: [
      { id: 1, email: 'admin@villageapi.com', businessName: 'Internal', planType: 'UNLIMITED', status: 'ACTIVE', role: 'ADMIN', requests: 15000 },
      { id: 2, email: 'tech@agritech-startup.in', businessName: 'AgriTech Solutions', planType: 'PRO', status: 'ACTIVE', role: 'USER', requests: 43200 },
      { id: 3, email: 'data@logistics-co.com', businessName: 'FastMove Logistics', planType: 'PREMIUM', status: 'SUSPENDED', role: 'USER', requests: 51000 },
      { id: 4, email: 'research@policy-inst.org', businessName: 'Policy Institute', planType: 'FREE', status: 'PENDING_APPROVAL', role: 'USER', requests: 0 },
      { id: 5, email: 'dev@rural-fintech.net', businessName: 'RuralPay', planType: 'FREE', status: 'ACTIVE', role: 'USER', requests: 4500 },
    ]
  };
};

export const getHierarchyData = async (level: string, _parentId?: string) => {
  await delay(400);
  // Mock subset for exploratory cascade
  if (level === 'states') {
    return { data: [{ id: '1', name: 'Maharashtra', code: '27' }, { id: '2', name: 'Gujarat', code: '24' }] };
  } else if (level === 'districts') {
    return { data: [{ id: '1', name: 'Nandurbar', code: '01' }, { id: '2', name: 'Dhule', code: '02' }] };
  } else if (level === 'subdistricts') {
    return { data: [{ id: '1', name: 'Akkalkuwa', code: '001' }, { id: '2', name: 'Navapur', code: '002' }] };
  } else if (level === 'villages') {
    return { data: [
      { id: '1', code: '525002', name: 'Manibeli', subDistrict: { name: 'Akkalkuwa' } },
      { id: '2', code: '525003', name: 'Danel', subDistrict: { name: 'Akkalkuwa' } },
      { id: '3', code: '525004', name: 'Mokh', subDistrict: { name: 'Akkalkuwa' } },
    ]};
  }
  return { data: [] };
};
