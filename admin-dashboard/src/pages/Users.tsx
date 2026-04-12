import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, Filter, MoreVertical, ShieldCheck, Mail, Building, ChevronRight, ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';

type SortKey = 'businessName' | 'status' | 'planType' | 'requests';
type SortDir = 'asc' | 'desc';

export default function Users() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('businessName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const { data: response, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const users = response?.data || [];

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = [...users];
    if (search) list = list.filter((u: any) => u.businessName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'ALL') list = list.filter((u: any) => u.status === statusFilter);
    if (planFilter !== 'ALL') list = list.filter((u: any) => u.planType === planFilter);
    list.sort((a: any, b: any) => {
      const aV = a[sortKey]; const bV = b[sortKey];
      if (typeof aV === 'number') return sortDir === 'asc' ? aV - bV : bV - aV;
      return sortDir === 'asc' ? String(aV).localeCompare(String(bV)) : String(bV).localeCompare(String(aV));
    });
    return list;
  }, [users, search, statusFilter, planFilter, sortKey, sortDir]);

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th scope="col" className="px-6 py-3.5 text-left text-sm font-semibold text-slate-900 cursor-pointer select-none hover:bg-slate-100 transition-colors" onClick={() => toggleSort(field)}>
      <span className="flex items-center gap-1">{label} <ArrowUpDown className={clsx('w-3 h-3', sortKey === field ? 'text-blue-600' : 'text-slate-300')} /></span>
    </th>
  );

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-slate-400 mb-4">
        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/')}>Dashboard</span>
        <ChevronRight className="w-3 h-3 mx-2" />
        <span className="text-slate-700 font-medium">User Management</span>
      </nav>

      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage B2B API clients, subscriptions, and access.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="block w-full rounded-lg border-0 py-2 pl-9 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 sm:text-sm" placeholder="Search by email or business..." />
          </div>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500">
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_APPROVAL">Pending</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500">
              <option value="ALL">All Plans</option>
              <option value="FREE">Free</option>
              <option value="PREMIUM">Premium</option>
              <option value="PRO">Pro</option>
              <option value="UNLIMITED">Unlimited</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <SortHeader label="Client / Email" field="businessName" />
                <SortHeader label="Status" field="status" />
                <SortHeader label="Plan" field="planType" />
                <SortHeader label="Requests (24h)" field="requests" />
                <th scope="col" className="relative px-6 py-3.5"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No users match your filters.</td></tr>
              ) : filtered.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/users/${user.id}`)}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center">
                        <Building className="h-5 w-5 text-slate-500" />
                      </div>
                      <div className="ml-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          {user.businessName}
                          {user.role === 'ADMIN' && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={clsx('inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                      user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                      user.status === 'PENDING_APPROVAL' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                      'bg-red-50 text-red-700 ring-red-600/20'
                    )}>{user.status.replace('_', ' ')}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={clsx('font-medium',
                      user.planType === 'UNLIMITED' ? 'text-indigo-600' :
                      user.planType === 'PRO' ? 'text-purple-600' :
                      user.planType === 'PREMIUM' ? 'text-blue-600' : 'text-slate-500'
                    )}>{user.planType}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900 font-medium text-right tabular-nums">{user.requests.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    {user.status === 'PENDING_APPROVAL' ? (
                      <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => alert('User Approved.')} className="text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded">Approve</button>
                        <button onClick={() => alert('User Rejected.')} className="text-rose-600 hover:text-rose-700 font-medium bg-rose-50 px-2 py-1 rounded">Reject</button>
                      </div>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); navigate(`/users/${user.id}`); }} className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
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
