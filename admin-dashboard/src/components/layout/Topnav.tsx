import { Bell, Search, UserCircle } from 'lucide-react';

export default function Topnav() {
  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8">
      <div className="flex-1 flex justify-between">
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-lg lg:max-w-xs relative">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative pointer-events-none">
              {/* Add breadcrumbs or global search here later */}
              <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <Search className="h-4 w-4" /> Global Search (Cmd+K)
              </span>
            </div>
          </div>
        </div>
        <div className="ml-4 flex items-center md:ml-6 gap-4">
          <button 
             onClick={() => alert('No new notifications')}
             className="p-1 rounded-full text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          <div 
             onClick={() => alert('Admin configuration overlay coming soon.')}
             className="relative rounded-full bg-slate-100 p-1 flex items-center gap-2 pr-3 cursor-pointer hover:bg-slate-200 transition-colors"
          >
            <UserCircle className="h-8 w-8 text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
