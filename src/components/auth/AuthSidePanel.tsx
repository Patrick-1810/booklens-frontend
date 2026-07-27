import { FileText, ShieldCheck, BookSearch } from 'lucide-react';

export function AuthSidePanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 border-r border-slate-800 p-12 flex-col justify-between overflow-hidden">
      {/* Textura de fundo */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" className="text-brand-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Glow*/}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Logo superior */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="bg-slate-800 border border-slate-700/60 p-2 rounded-xl text-brand-400">
          <FileText className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">
          BookLens
        </span>
      </div>

      {/* Mensagem Principal */}
      <div className="relative z-10 max-w-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
          Todo documento público, legível e pesquisável.
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Reconhecimento óptico de caracteres com estruturação automática de título e parágrafos.
        </p>
      </div>

      {/* Rodapé  */}
      <div className="relative z-10 space-y-3 pt-6 border-t border-slate-800/80">
        <div className="flex items-center gap-2.5 text-xs font-medium text-slate-400">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>Acesso aberto e auditável</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-medium text-slate-400">
          <BookSearch className="w-4 h-4 text-brand-400" />
          <span>Dicionário integrado com autocompletar</span>
        </div>
      </div>
    </div>
  );
}