import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-dark-900 text-slate-100">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}