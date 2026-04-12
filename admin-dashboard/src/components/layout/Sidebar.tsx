import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Database, Settings, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Analytics', href: '/', icon: LayoutDashboard },
  { name: 'User Management', href: '/users', icon: Users },
  { name: 'Data Browser', href: '/data-browser', icon: Database },
  { name: 'API Logs', href: '/api-logs', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={clsx(
      "hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-slate-900 border-r border-slate-800 transition-all duration-300",
      collapsed ? 'md:w-20' : 'md:w-64'
    )}>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-slate-950 justify-between">
          <div className="flex items-center">
            <Database className="h-8 w-8 text-blue-500 flex-shrink-0" />
            {!collapsed && <span className="ml-3 text-xl font-bold text-white tracking-tight">Bluestock<span className="text-blue-500">Admin</span></span>}
          </div>
          <button onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-white transition-colors p-1 rounded">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-2 flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={(e) => {
                     if (item.href === '/settings') {
                        e.preventDefault();
                        alert('Global platform settings interface is currently under construction.');
                     }
                  }}
                  title={collapsed ? item.name : undefined}
                  className={clsx(
                    isActive ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                    collapsed && 'justify-center'
                  )}
                >
                  <item.icon
                    className={clsx(
                      isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300',
                      'flex-shrink-0 h-5 w-5 transition-colors duration-200',
                      !collapsed && '-ml-1 mr-3'
                    )}
                    aria-hidden="true"
                  />
                  {!collapsed && item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
