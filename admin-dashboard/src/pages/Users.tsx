import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, Filter, MoreVertical, ShieldCheck, Mail, Building } from 'lucide-react';
import clsx from 'clsx';

export default function Users() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const users = response?.data || [];

  return (
    <DashboardLayout>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage B2B API clients, subscriptions, and access.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
             type="button" 
             onClick={() => alert('Invite functionality scheduled for v2.0 update.')}
             className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
          >
            Invite User
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border-0 py-2 pl-9 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Search by email, business, or API key..."
            />
          </div>
          <button 
             onClick={() => alert('Advanced filtering options coming soon!')}
             className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-slate-900">Client / Email</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-slate-900">Plan</th>
                  <th scope="col" className="px-6 py-3.5 text-right text-sm font-semibold text-slate-900">Requests (24h)</th>
                  <th scope="col" className="relative px-6 py-3.5"><span className="sr-only">Actions</span></th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading users...</td>
                  </tr>
                ) : users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center">
                           <Building className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                             {user.businessName}
                             {user.role === 'ADMIN' && <span title="Admin"><ShieldCheck className="w-4 h-4 text-blue-500" /></span>}
                          </div>
                          <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                             <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={clsx(
                        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                         user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 
                         user.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                         'bg-red-50 text-red-700 ring-red-600/20'
                      )}>
                        {user.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      <span className={clsx(
                        'font-medium',
                        user.planType === 'UNLIMITED' ? 'text-indigo-600' :
                        user.planType === 'PRO' ? 'text-purple-600' :
                        user.planType === 'PREMIUM' ? 'text-blue-600' : 'text-slate-500'
                      )}>
                        {user.planType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900 font-medium text-right tabular-nums">
                      {user.requests.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      {user.status === 'PENDING_APPROVAL' ? (
                        <div className="flex justify-end gap-2">
                           <button onClick={(e) => { e.stopPropagation(); alert('User Approved. They can now generate API keys.'); }} className="text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded">Approve</button>
                           <button onClick={(e) => { e.stopPropagation(); alert('User Rejected.'); }} className="text-rose-600 hover:text-rose-700 font-medium bg-rose-50 px-2 py-1 rounded">Reject</button>
                        </div>
                      ) : (
                        <button 
                           onClick={(e) => { e.stopPropagation(); alert('User administration actions are restricted to Super Admins.'); }}
                           className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                           <MoreVertical className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
