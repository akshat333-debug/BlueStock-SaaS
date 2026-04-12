import { Link, useLocation } from 'react-router-dom';
import { Activity, Key, CreditCard, LogOut, TerminalSquare, BookOpen } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Activity },
  { name: 'API Keys', href: '/keys', icon: Key },
  { name: 'Billing', href: '/billing', icon: CreditCard },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-surface-950 border-r border-surface-800 min-h-screen relative z-10 flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-surface-800">
        <TerminalSquare className="w-6 h-6 text-brand-400" />
        <span className="ml-3 font-semibold text-lg text-white tracking-tight">Bluestock<span className="text-brand-500">API</span></span>
      </div>
      
      <div className="flex-1 py-6 px-4 flex flex-col gap-1">
         {navItems.map((item) => {
           const isActive = location.pathname.startsWith(item.href);
           return (
             <Link
               key={item.name}
               to={item.href}
               className={clsx(
                 'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                 isActive ? 'bg-surface-800 text-brand-400' : 'text-slate-400 hover:text-slate-200 hover:bg-surface-800/50'
               )}
             >
               <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
               {item.name}
             </Link>
           );
         })}

         <a
           href="/api-docs"
           target="_blank"
           rel="noopener noreferrer"
           className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-surface-800/50 transition-all duration-200"
         >
           <BookOpen className="w-5 h-5 mr-3 flex-shrink-0" />
           API Docs
           <span className="ml-auto text-xs text-slate-600">↗</span>
         </a>
      </div>

      <div className="p-4 border-t border-surface-800">
         <button 
            onClick={() => {
               if(window.confirm('Are you sure you want to sign out?')) {
                  window.location.href = '/login';
               }
            }}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-surface-800/50 transition-colors"
         >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
         </button>
      </div>
    </div>
  );
}
