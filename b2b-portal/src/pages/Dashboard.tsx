import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getQuotaData } from '../services/api';
import type { UserContext } from '../services/api';
import PortalLayout from '../components/layout/PortalLayout';
import { Activity, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

import { useNavigate } from 'react-router-dom';

// We mock the user context for the UI purposes right now
const DUMMY_USER: UserContext = {
   id: 1, email: 'admin@startup.com', businessName: 'Startup Solutions', planType: 'PREMIUM', status: 'ACTIVE'
};

export default function Dashboard() {
   const navigate = useNavigate();
   const { data: qData, isLoading } = useQuery({
      queryKey: ['quota'],
      queryFn: getQuotaData
   });

   if (isLoading || !qData) {
      return (
         <PortalLayout>
            <div className="flex justify-center mt-32"><div className="animate-spin h-8 w-8 rounded-full border-t-2 border-brand-500"></div></div>
         </PortalLayout>
      );
   }

   const pctUsed = Math.min(100, Math.round((qData.used / qData.limit) * 100));

   return (
      <PortalLayout>
         <div className="flex items-center justify-between mb-8">
            <div>
               <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
               <p className="mt-1 text-sm text-slate-400">Monitor your API consumption and network telemetry.</p>
            </div>
            <div className="flex items-center gap-2 bg-surface-950 border border-surface-800 rounded-full px-4 py-1.5 shadow-xs">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <span className="text-xs font-medium text-slate-300">All Systems Operational</span>
            </div>
         </div>

         {/* Plan & Quota Container */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 bg-surface-950 border border-surface-800 rounded-xl p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
                  <Activity className="w-48 h-48 text-brand-500 rotate-12" />
               </div>
               
               <div className="relative z-10 flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Current Cycle Usage</h3>
                  <span className="text-xs text-slate-400">Resets in 11 days</span>
               </div>
               <div className="relative z-10 flex items-end gap-2 mb-6">
                  <span className="text-4xl font-bold text-white tracking-tight">{qData.used.toLocaleString()}</span>
                  <span className="text-slate-400 pb-1">/ {qData.limit.toLocaleString()} reqs</span>
               </div>
               
               {/* Progress Bar Track */}
               <div className="relative z-10 w-full h-2 bg-surface-800 rounded-full overflow-hidden">
                  <div 
                     className={clsx("h-full bg-brand-500 transition-all duration-1000 ease-out", pctUsed > 90 ? 'bg-red-500' : 'bg-brand-500')} 
                     style={{ width: `${pctUsed}%` }}
                  ></div>
               </div>
               <p className="mt-3 text-xs text-slate-400 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                  Your usage is well within your {DUMMY_USER.planType} plan limits.
               </p>
            </div>

            <div className="bg-gradient-to-br from-surface-950 to-surface-900 border border-surface-800 rounded-xl p-6 flex flex-col justify-between">
               <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Subscription</h3>
                  <div className="inline-flex items-center px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-bold rounded-lg uppercase tracking-widest mt-1">
                     {DUMMY_USER.planType}
                  </div>
               </div>
               <div>
                  <p className="text-sm text-slate-400 mb-4">Need higher limits or dedicated support?</p>
                  <button 
                     onClick={() => navigate('/billing')}
                     className="w-full py-2 bg-white text-surface-950 hover:bg-slate-200 transition-colors rounded-lg text-sm font-bold"
                  >
                     Upgrade Plan
                  </button>
               </div>
            </div>
         </div>

         {/* Telemetry Chart */}
         <div className="bg-surface-950 border border-surface-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-6">Request Volume (Last 7 Days)</h3>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={qData.requestsTimeline} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                     <defs>
                        <linearGradient id="reqGrade" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                           <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                        itemStyle={{ color: '#818cf8' }}
                        formatter={(val: any) => [val.toLocaleString(), 'Requests']} 
                     />
                     <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#reqGrade)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </PortalLayout>
   );
}
