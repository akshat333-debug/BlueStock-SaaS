import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getApiLogs } from '../services/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, Download, FileJson, ChevronRight } from 'lucide-react';

export default function ApiLogs() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: response, isLoading } = useQuery({
    queryKey: ['apilogs'],
    queryFn: getApiLogs,
  });

  const logs = response?.data || [];

  const filteredLogs = useMemo(() => {
    let list = logs.filter((log: any) =>
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.user.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Date range filter
    if (dateRange !== 'all') {
      const now = Date.now();
      const msMap: Record<string, number> = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
      const cutoff = now - (msMap[dateRange] || 0);
      list = list.filter((log: any) => new Date(log.timestamp).getTime() > cutoff);
    }
    // Status code filter
    if (statusFilter !== 'all') {
      const prefix = parseInt(statusFilter);
      list = list.filter((log: any) => Math.floor(log.statusCode / 100) === prefix / 100);
    }
    return list;
  }, [logs, searchTerm, dateRange, statusFilter]);

  const downloadCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = Object.keys(filteredLogs[0]).join(',');
    const rows = filteredLogs.map((log: any) => Object.values(log).join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api_logs_export.csv';
    a.click();
  };

  const downloadJSON = () => {
    if (filteredLogs.length === 0) return;
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api_logs_export.json';
    a.click();
  };

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-slate-400 mb-4">
        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/')}>Dashboard</span>
        <ChevronRight className="w-3 h-3 mx-2" />
        <span className="text-slate-700 font-medium">API Logs</span>
      </nav>

      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API Logs Viewer</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor and debug live API telemetry traffic.</p>
        </div>
        <div className="mt-4 sm:flex sm:gap-3 sm:mt-0">
          <button onClick={downloadJSON} className="inline-flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm">
            <FileJson className="w-4 h-4 mr-2" /> Export JSON
          </button>
          <button onClick={downloadCSV} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm border border-transparent">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by Endpoint or User..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700">
              <option value="all">All Time</option>
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700">
              <option value="all">All Status</option>
              <option value="200">2xx Success</option>
              <option value="400">4xx Client Error</option>
              <option value="500">5xx Server Error</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">API Key</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Endpoint</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lat</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                      {log.apiKey}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                      {log.endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.statusCode === 200 || log.statusCode === 201 ? 'bg-emerald-100 text-emerald-800' : 
                        log.statusCode === 429 ? 'bg-amber-100 text-amber-800' :
                        log.statusCode >= 400 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {log.responseTime}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No logs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
