import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topnav from './Topnav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 md:pl-64">
        <Topnav />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
