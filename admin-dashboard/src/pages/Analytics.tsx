import { useQuery } from '@tanstack/react-query';
import { getAnalyticsOverview } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, MapPin, Users, Activity, Clock } from 'lucide-react';

const COLORS = ['#3b82f6', '#2563eb', '#1e3a8a', '#93c5fd'];

export default function Analytics() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalyticsOverview,
  });

  const data = response?.data;

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { name: 'Total Villages', stat: data.totalVillages.toLocaleString(), icon: MapPin, change: `${data.villageGrowth}%`, changeType: 'increase' },
    { name: 'Active Users', stat: data.activeUsers, icon: Users, change: `${data.userGrowth}%`, changeType: 'increase' },
    { name: 'Requests (24h)', stat: data.todayRequests.toLocaleString(), icon: Activity, change: `${data.requestsGrowth}%`, changeType: 'increase' },
    { name: 'Avg Latency', stat: `${data.avgResponseTime}ms`, icon: Clock, change: 'healthy', changeType: 'neutral' },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of API usage and geographical data.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 bg-blue-50/50 rounded-full h-24 w-24 group-hover:scale-125 transition-transform duration-500 ease-out pointer-events-none"></div>
            <div className="p-5 relative z-10">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100/50 rounded-xl p-3">
                  <item.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-slate-500 whitespace-nowrap">{item.name}</dt>
                    <dd className="flex items-baseline flex-wrap">
                      <div className="text-xl font-bold text-slate-900">{item.stat}</div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-emerald-600">
                        {item.changeType === 'increase' && <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4 text-emerald-500" aria-hidden="true" />}
                        <span className="ml-1">{item.change}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-6">API Requests (30 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.requestsTimeline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [value.toLocaleString(), 'Requests']} 
                />
                <Area type="monotone" dataKey="requests" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorReq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Subscription Plans</h3>
          <div className="h-48 relative">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.planDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-800">{data.activeUsers}</span>
             </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
             {data.planDistribution.map((plan, i) => (
                <div key={plan.name} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                   <span className="text-sm text-slate-600 font-medium">{plan.name}</span>
                </div>
             ))}
          </div>
        </div>

        {/* Top States */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Top 5 States by Dataset Coverage</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topStates} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontWeight: 500 }} width={120} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
