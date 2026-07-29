import { Scan, BookOpen, User, LogOut, FileText, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    { label: 'Scanner', path: '/scanner', icon: Scan },
    { label: 'Documentos', path: '/documents', icon: BookOpen },
    { label: 'Conta', path: '/account', icon: User },
  ];

  return (
    <aside className="w-64 bg-dark-850 border-r border-slate-800 flex flex-col justify-between h-full p-4">
      <div className="space-y-8">
        {/* Logo BookLens */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800/80 border border-slate-700/60 text-white rounded-xl shadow-inner flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-none">
                BookLens
              </h1>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Extração & Gestão OCR
              </p>
            </div>
          </div>

          {/* Botão fechar (apenas visível em mobile quando ativado) */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
              title="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Links de Navegação */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Card Informativo Inferior */}
      <div className="space-y-4">
        <div className="p-4 bg-dark-900/60 border border-slate-800/80 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-2 text-brand-400">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Acervo Pessoal
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Seus documentos extraídos ficam salvos para consulta e busca rápida.
          </p>
        </div>

        {/* Botão de Sair */}
        <button
          onClick={() => {
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}