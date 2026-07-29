import { CheckCircle2, Copy, FileText, Save, Highlighter } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { OCRResponse, PalavraSuspeita } from '../../types/ocr';
import { api } from '../../services/api';

interface OCRResultCardProps {
  result: OCRResponse;
  onReset: () => void;
}

export function OCRResultCard({ result, onReset }: OCRResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [titulo, setTitulo] = useState(result.estrutura.titulo || 'SEM TÍTULO');
  const [paragrafos, setParagrafos] = useState<string[]>(
    result.estrutura.paragrafos.length > 0 ? result.estrutura.paragrafos : [result.texto_completo]
  );
  const [anotacoes, setAnotacoes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [menuCorrecao, setMenuCorrecao] = useState<{
    indexParagrafo: number;
    palavraOriginal: string;
    sugestoes: string[];
    posicao: { top: number; left: number };
  } | null>(null);

  const documentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitulo(result.estrutura.titulo || 'SEM TÍTULO');
    setParagrafos(
      result.estrutura.paragrafos.length > 0 ? result.estrutura.paragrafos : [result.texto_completo]
    );
  }, [result]);

  const palavrasSuspeitas: PalavraSuspeita[] = result.palavras_suspeitas || [];

  const mapaSuspeitas = new Map<string, string[]>();
  palavrasSuspeitas.forEach((item) => {
    mapaSuspeitas.set(item.original.toLowerCase(), item.sugestoes);
  });

  const handleCopyText = () => {
    const textoFormatado = `${titulo}\n\n${paragrafos.join('\n\n')}`;
    navigator.clipboard.writeText(textoFormatado);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleParagrafoChange = (index: number, novoTexto: string) => {
    const novos = [...paragrafos];
    novos[index] = novoTexto;
    setParagrafos(novos);
  };

  const aplicarSugestao = (indexParagrafo: number, palavraOriginal: string, sugestao: string) => {
    const pAtual = paragrafos[indexParagrafo];
    const regex = new RegExp(`\\b${palavraOriginal}\\b`, 'g');
    const novoTexto = pAtual.replace(regex, sugestao);

    handleParagrafoChange(indexParagrafo, novoTexto);
    setMenuCorrecao(null);
  };

  const handlePalavraClick = (
    e: React.MouseEvent<HTMLSpanElement>,
    pIndex: number,
    palavraLimpa: string,
    sugestoes: string[]
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    setMenuCorrecao({
      indexParagrafo: pIndex,
      palavraOriginal: palavraLimpa,
      sugestoes,
      posicao: {
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
      },
    });
  };

  const handleGrifarSelecao = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    document.execCommand('hiliteColor', false, '#fef08a');
  };

  const handleSalvarDocumento = async () => {
    try {
      setSaving(true);
      await api.put(`/ocr/documentos/${result.id_registro}`, {
        titulo,
        paragrafos,
        anotacoes,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Erro ao salvar o documento.');
    } finally {
      setSaving(false);
    }
  };

  const renderizarParagrafoInterativo = (texto: string, pIndex: number) => {
    const tokens = texto.split(/(\s+)/);

    return tokens.map((token, tIdx) => {
      const palavraLimpa = token.replace(/[^\wáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/g, '');
      const sugestoes = mapaSuspeitas.get(palavraLimpa.toLowerCase());

      if (sugestoes && sugestoes.length > 0) {
        return (
          <span
            key={tIdx}
            onClick={(e) => handlePalavraClick(e, pIndex, palavraLimpa, sugestoes)}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 border-b-2 border-amber-500 cursor-pointer font-semibold px-0.5 rounded transition-colors"
            title="Clique para ver sugestões de correção"
          >
            {token}
          </span>
        );
      }

      return <span key={tIdx}>{token}</span>;
    });
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto" onClick={() => setMenuCorrecao(null)}>
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Documento Processado</h3>
            <p className="text-xs text-slate-400">
              Concluído em {result.tempo_processamento_segundos}s • Registro #{result.id_registro}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGrifarSelecao}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors px-3 py-2 rounded-lg border border-slate-700"
            title="Selecione um texto e clique para grifar"
          >
            <Highlighter className="w-4 h-4 text-amber-400" /> Grifar Trecho
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition-all"
          >
            <Copy className="w-4 h-4" /> {copied ? 'Copiado!' : 'Copiar'}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg border border-slate-800 hover:bg-slate-800"
          >
            Escanear outro
          </button>

          <button
            type="button"
            onClick={handleSalvarDocumento}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-semibold bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-all shadow-md shadow-brand-500/20"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : saveSuccess ? 'Salvo!' : 'Salvar e Publicar'}
          </button>
        </div>
      </div>

      {/* Folha do Documento */}
      <div
        ref={documentRef}
        className="bg-white text-slate-900 rounded-sm shadow-2xl p-10 md:p-14 min-h-[700px] font-serif border border-slate-200 space-y-6 relative"
      >
        {/* Cabeçalho */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
            Processado por BookLens
          </p>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full text-center text-xl md:text-2xl font-bold uppercase tracking-wide bg-transparent focus:outline-none focus:bg-amber-50 rounded px-2 text-slate-900"
          />
        </div>

        {/* Parágrafos */}
        <div className="space-y-4 text-justify leading-relaxed text-base md:text-lg">
          {paragrafos.map((p, index) => (
            <div
              key={index}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => handleParagrafoChange(index, e.currentTarget.innerText)}
              className="focus:outline-none focus:bg-amber-50/50 p-1 rounded transition-colors"
            >
              {renderizarParagrafoInterativo(p, index)}
            </div>
          ))}
        </div>
      </div>

      {menuCorrecao && (
        <div
          style={{ top: `${menuCorrecao.posicao.top}px`, left: `${menuCorrecao.posicao.left}px` }}
          className="fixed z-50 bg-slate-900 border border-slate-700 text-white rounded-lg shadow-xl p-2 w-56 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100"
        >
          <p className="text-[10px] text-slate-400 font-sans uppercase tracking-wider px-2 py-1 border-b border-slate-800">
            Sugestões ({menuCorrecao.palavraOriginal}):
          </p>
          <div className="flex flex-col gap-0.5">
            {menuCorrecao.sugestoes.map((sugestao, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  aplicarSugestao(
                    menuCorrecao.indexParagrafo,
                    menuCorrecao.palavraOriginal,
                    sugestao
                  )
                }
                className="text-left px-2 py-1.5 hover:bg-brand-500/20 hover:text-brand-300 rounded text-slate-200 transition-colors font-mono"
              >
                ➔ {sugestao}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Campo de Anotações*/}
      <div className="p-4 bg-dark-900 border border-slate-800 rounded-xl space-y-2">
        <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-amber-400" /> Anotações
        </label>
        <textarea
          rows={3}
          value={anotacoes}
          onChange={(e) => setAnotacoes(e.target.value)}
          placeholder="Escreva aqui observações do revisor, notas de rodapé ou instruções de publicação..."
          className="w-full bg-dark-850 border border-slate-700/60 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-brand-500 resize-none"
        />
      </div>
    </div>
  );
}