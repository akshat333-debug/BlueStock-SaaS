import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface-950 text-slate-300">
      <Sidebar />
      <div className="flex-1 flex flex-col w-0 relative overflow-hidden bg-surface-900 border-l border-surface-800/50 rounded-tl-2xl mt-4 ml-[-1px] shadow-2xl">
         <main className="flex-1 overflow-y-auto px-8 py-10 focus:outline-none">
            <div className="max-w-6xl mx-auto">
               {children}
            </div>
         </main>
      </div>
    </div>
  );
}
