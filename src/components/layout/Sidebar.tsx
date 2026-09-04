import { Scan, BookOpen, User as UserIcon, LogOut, FileText, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Scanner', path: '/scanner', icon: Scan },
    { label: 'Documentos', path: '/documents', icon: BookOpen },
    { label: 'Conta', path: '/account', icon: UserIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-dark-850 border-r border-slate-800 flex flex-col justify-between h-full p-4">
      <div className="space-y-8">
        {/* Logo BookLens */}
        <div className="flex items-center justify-between px-2 pt-2">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
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
          </Link>

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

      {/* Card Informativo e Perfil no Rodapé */}
      <div className="space-y-3">
        {/* Card do Usuário Logado */}
        {user && (
          <div className="p-3 bg-dark-900/60 border border-slate-800/80 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-semibold text-xs shrink-0">
              {user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.nome}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Botão de Sair */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}