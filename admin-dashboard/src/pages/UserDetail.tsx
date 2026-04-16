import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ArrowLeft, Mail, Building, ShieldCheck, Key, MapPin, Clock } from 'lucide-react';
import clsx from 'clsx';

// Mock user detail data (in production, fetch from /api/admin/users/:id)
const getUserDetail = (id: string) => ({
  id: parseInt(id),
  email: 'dev@startup.io',
  businessName: 'Startup Solutions Inc',
  phone: '+91 9876543210',
  gstNumber: 'GST29ABCDE1234F1Z5',
  role: 'USER' as string,
  status: 'ACTIVE' as string,
  planType: 'PREMIUM' as string,
  createdAt: '2024-08-15',
  lastActive: '2025-04-12',
  totalRequests: 142500,
  avgResponseTime: 38,
  apiKeys: [
    { id: 1, name: 'Production', key: 'ak_3420890557ee204d', isActive: true, created: '2024-08-15', lastUsed: '2025-04-12' },
    { id: 2, name: 'Staging', key: 'ak_9f1b2c3d4e5f6a7b', isActive: true, created: '2024-09-01', lastUsed: '2025-04-10' },
    { id: 3, name: 'Old Key', key: 'ak_aaabbbccc000ddd1', isActive: false, created: '2024-07-01', lastUsed: '2024-12-01' },
  ],
  stateAccess: [
    { id: 1, name: 'Maharashtra' },
    { id: 2, name: 'Gujarat' },
    { id: 5, name: 'Karnataka' },
  ],
  recentRequests: [
    { endpoint: '/api/v1/search', status: 200, time: 32, at: '2025-04-12T10:30:00Z' },
    { endpoint: '/api/v1/autocomplete', status: 200, time: 18, at: '2025-04-12T10:28:00Z' },
    { endpoint: '/api/v1/states', status: 200, time: 45, at: '2025-04-12T10:25:00Z' },
    { endpoint: '/api/v1/search', status: 429, time: 0, at: '2025-04-12T10:20:00Z' },
    { endpoint: '/api/v1/districts', status: 200, time: 52, at: '2025-04-12T10:15:00Z' },
  ]
});

const ALL_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Goa', 'Jammu & Kashmir',
  'Ladakh', 'Puducherry', 'Chandigarh', 'Andaman & Nicobar', 'Lakshadweep'
];

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const user = getUserDetail(id || '1');
  const [notes, setNotes] = useState('');

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to="/users" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to User Management
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
              <Building className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                {user.businessName}
                {user.role === 'ADMIN' && <ShieldCheck className="w-5 h-5 text-blue-500" />}
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className={clsx('px-3 py-1 rounded-full text-xs font-medium border',
              user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              user.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-red-50 text-red-700 border-red-200'
            )}>{user.status}</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">{user.planType}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Profile Information</h3>
          <dl className="space-y-4 text-sm">
            <div><dt className="text-slate-500">Phone</dt><dd className="font-medium text-slate-900">{user.phone}</dd></div>
            <div><dt className="text-slate-500">GST Number</dt><dd className="font-medium text-slate-900">{user.gstNumber}</dd></div>
            <div><dt className="text-slate-500">Registered</dt><dd className="font-medium text-slate-900">{user.createdAt}</dd></div>
            <div><dt className="text-slate-500">Last Active</dt><dd className="font-medium text-slate-900">{user.lastActive}</dd></div>
            <div><dt className="text-slate-500">Total Requests</dt><dd className="font-medium text-slate-900">{user.totalRequests.toLocaleString()}</dd></div>
            <div><dt className="text-slate-500">Avg Response Time</dt><dd className="font-medium text-slate-900">{user.avgResponseTime}ms</dd></div>
          </dl>
        </div>

        {/* API Keys */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Key className="w-4 h-4" /> API Keys ({user.apiKeys.length})</h3>
          <div className="space-y-3">
            {user.apiKeys.map(k => (
              <div key={k.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-slate-900">{k.name}</span>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full', k.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500')}>{k.isActive ? 'Active' : 'Revoked'}</span>
                </div>
                <code className="text-xs text-slate-500 font-mono">{k.key}</code>
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>Created: {k.created}</span>
                  <span>Last used: {k.lastUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* State Access Matrix */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> State Access</h3>
          {user.planType === 'PRO' || user.planType === 'UNLIMITED' ? (
            <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">Full India access granted with {user.planType} plan.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {user.stateAccess.map(s => (
                  <span key={s.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-200">{s.name}</span>
                ))}
              </div>
              <select className="w-full p-2 text-sm border border-slate-300 rounded-lg" onChange={e => { if(e.target.value) alert(`Grant access to ${e.target.value} – would call API`); e.target.value=''; }}>
                <option value="">+ Grant state access...</option>
                {ALL_STATES.filter(s => !user.stateAccess.find(sa => sa.name === s)).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Request History */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Recent Request History</h3>
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead><tr>
            <th className="text-left py-2 text-slate-500 font-medium">Endpoint</th>
            <th className="text-left py-2 text-slate-500 font-medium">Status</th>
            <th className="text-left py-2 text-slate-500 font-medium">Latency</th>
            <th className="text-right py-2 text-slate-500 font-medium">Time</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {user.recentRequests.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="py-2 font-mono text-slate-700">{r.endpoint}</td>
                <td className="py-2"><span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', r.status < 400 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>{r.status}</span></td>
                <td className="py-2 text-slate-600">{r.time}ms</td>
                <td className="py-2 text-right text-slate-400">{new Date(r.at).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Admin Notes */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Admin Notes</h3>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add internal notes about this user..." className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        <button onClick={() => alert('Notes saved.')} className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500">Save Notes</button>
      </div>
    </DashboardLayout>
  );
}
