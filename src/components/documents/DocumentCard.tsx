import { FileText, Calendar, Trash2, ArrowRight } from 'lucide-react';
import type { DocumentoSalvo } from '../../types/ocr';

interface DocumentCardProps {
  documento: DocumentoSalvo;
  onSelect: (doc: DocumentoSalvo) => void;
  onDelete: (id: number) => void;
}

export function DocumentCard({ documento, onSelect, onDelete }: DocumentCardProps) {
  const dataOrig = documento?.criado_em || documento?.data_processamento;
  let dataFormatada = 'Data não registrada';

  if (dataOrig) {
    const parsed = new Date(dataOrig);
    if (!isNaN(parsed.getTime())) {
      dataFormatada = parsed.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  const tituloDoc =
    documento?.titulo ||
    documento?.titulo_documento ||
    documento?.nome_arquivo ||
    'Documento sem título';

  const previaTexto =
    documento?.texto_completo ||
    documento?.texto_extraido ||
    (Array.isArray(documento?.paragrafos) ? documento.paragrafos.join(' ') : '') ||
    'Sem prévia de texto disponível.';

  return (
    <div
      onClick={() => onSelect(documento)}
      className="bg-dark-850 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-lg group cursor-pointer"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg border border-brand-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white truncate group-hover:text-brand-400 transition-colors">
              {tituloDoc}
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(documento.id);
            }}
            className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Excluir documento"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-serif">
          {previaTexto}
        </p>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{dataFormatada}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(documento);
          }}
          className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold group-hover:translate-x-0.5 transition-all"
        >
          <span>Abrir</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}