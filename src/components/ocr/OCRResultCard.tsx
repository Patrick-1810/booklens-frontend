import { CheckCircle2, Copy, FileText, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { OCRResponse } from '../../types/ocr';

interface OCRResultCardProps {
  result: OCRResponse;
  onReset: () => void;
}

export function OCRResultCard({ result, onReset }: OCRResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyText = () => {
    navigator.clipboard.writeText(result.texto_completo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Processamento Concluído</h3>
            <p className="text-xs text-slate-400">
              Concluído em {result.tempo_processamento_segundos}s • ID #{result.id_registro}
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors px-3 py-1.5 rounded-lg border border-brand-500/20 hover:bg-brand-500/10"
        >
          Escanear outro documento
        </button>
      </div>

      {/* Título Extraído */}
      <div className="p-4 bg-dark-900/80 border border-slate-800 rounded-xl space-y-1">
        <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Título Detectado
        </span>
        <h4 className="text-base font-semibold text-white">
          {result.estrutura.titulo || "Sem título identificado"}
        </h4>
      </div>

      {/* Parágrafos Extraídos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Parágrafos do Documento
          </span>
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-dark-800 hover:bg-dark-750 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copiado!' : 'Copiar Texto Completo'}
          </button>
        </div>

        <div className="p-5 bg-dark-900 border border-slate-800/90 rounded-2xl max-h-80 overflow-y-auto space-y-3 font-mono text-sm leading-relaxed text-slate-300 scrollbar-thin">
          {result.estrutura.paragrafos.length > 0 ? (
            result.estrutura.paragrafos.map((p, index) => (
              <p key={index} className="bg-dark-850/50 p-3 rounded-lg border border-slate-800/40">
                {p}
              </p>
            ))
          ) : (
            <p className="text-slate-500 italic">{result.texto_completo}</p>
          )}
        </div>
      </div>
    </div>
  );
}