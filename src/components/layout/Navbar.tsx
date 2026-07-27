import { FileText } from 'lucide-react';

export function Navbar() {
  return (
    <header className="w-full border-b border-slate-800/80 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 border border-slate-700/60 p-2 rounded-xl text-brand-400">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-white">
              BookLens
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-slate-800/50"
          >
            Entrar
          </a>
          <a
            href="/register"
            className="text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 px-5 py-2 rounded-full transition-all shadow-sm"
          >
            Criar conta
          </a>
        </div>
      </div>
    </header>
  );
}