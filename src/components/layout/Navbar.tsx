import { FileText, LogOut, Scan } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="w-full border-b border-slate-800/80 bg-dark-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="bg-slate-800 border border-slate-700/60 p-2 rounded-xl text-brand-400">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-white">
              BookLens
            </span>
          </div>
        </Link>

        {/* Ações */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 hidden sm:inline-block">
                Olá, <strong className="text-slate-200 font-medium">{user.nome.split(' ')[0]}</strong>
              </span>

              <Link
                to="/scanner"
                className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 px-4 py-2 rounded-full transition-all shadow-sm"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Scanner</span>
              </Link>

              <button
                onClick={logout}
                className="text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors p-2 rounded-lg flex items-center gap-1.5"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-slate-800/50"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 px-5 py-2 rounded-full transition-all shadow-sm"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}