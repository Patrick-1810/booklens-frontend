import { useState, type ReactNode } from 'react';
import { Menu, FileText } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-dark-900 text-slate-100 flex-col lg:flex-row">
      <header className="lg:hidden flex items-center justify-between p-4 bg-dark-850 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 border border-slate-700/60 text-white rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white">BookLens</span>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2.5 text-slate-400 hover:text-white bg-dark-900 border border-slate-800 rounded-xl transition-colors"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Desktop & Mobile*/}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onCloseMobile={() => setIsMobileMenuOpen(false)} />
      </div>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}