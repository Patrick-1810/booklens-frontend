import { CheckCircle2, Copy, FileText, Save, Highlighter, LayoutGrid, AlignLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { OCRResponse, PalavraSuspeita } from '../../types/ocr';
import { api } from '../../services/api';

export interface ElementoFormatado {
  id?: string;
  texto: string;
  alinhamento?: 'left' | 'center' | 'justify' | 'right';
  estilo?: 'titulo' | 'subtitulo' | 'normal';
  altura_fonte_px?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  x_relativo?: number;
  y_relativo?: number;
  width_relativo?: number;
  height_relativo?: number;
  altura_fonte_relativa?: number;
  largura_pagina?: number;
  altura_pagina?: number;
}

interface OCRResultCardProps {
  result: OCRResponse;
  onReset: () => void;
}

const ALINHAMENTO_CLASS: Record<string, string> = {
  center: 'text-center',
  justify: 'text-justify',
  left: 'text-left',
  right: 'text-right',
};

export function OCRResultCard({ result, onReset }: OCRResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [titulo, setTitulo] = useState(result.estrutura?.titulo || 'SEM TÍTULO');

  const [elementos, setElementos] = useState<ElementoFormatado[]>([]);
  const [anotacoes, setAnotacoes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [modoLayout, setModoLayout] = useState<'fluxo' | 'overlay'>('fluxo');

  const [menuCorrecao, setMenuCorrecao] = useState<{
    indexParagrafo: number;
    palavraOriginal: string;
    sugestoes: string[];
    posicao: { top: number; left: number };
  } | null>(null);

  const documentRef = useRef<HTMLDivElement>(null);

  // Monitora a altura e largura do container para recálculo dinâmico da escala tipográfica
  useEffect(() => {
    if (!documentRef.current) return;

    const updateHeight = () => {
      if (documentRef.current) {
        setContainerHeight(documentRef.current.clientHeight);
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(documentRef.current);

    return () => observer.disconnect();
  }, [elementos]);

  useEffect(() => {
    setTitulo(result.estrutura?.titulo || 'SEM TÍTULO');

    const elementosRecebidos = (result.estrutura as any)?.elementos;
    if (elementosRecebidos && elementosRecebidos.length > 0) {
      setElementos(elementosRecebidos);
    } else {
      const pLista =
        result.estrutura?.paragrafos && result.estrutura.paragrafos.length > 0
          ? result.estrutura.paragrafos
          : [result.texto_completo || ''];

      setElementos(
        pLista.map((p, idx) => ({
          id: `p-${idx}`,
          texto: p,
          alinhamento: 'justify',
          estilo: 'normal',
        }))
      );
    }
  }, [result]);

  const palavrasSuspeitas: PalavraSuspeita[] = result.palavras_suspeitas || [];
  const mapaSuspeitas = new Map<string, string[]>();
  palavrasSuspeitas.forEach((item) => {
    mapaSuspeitas.set(item.original.toLowerCase(), item.sugestoes);
  });

  // Dimensões de referência para cálculo da folha
  const primeiroElemento = elementos[0];
  const larguraPaginaOrig =
    primeiroElemento?.largura_pagina ||
    (result.estrutura as any)?.largura_pagina ||
    result.largura_pagina ||
    1200;
  const alturaPaginaOrig =
    primeiroElemento?.altura_pagina ||
    (result.estrutura as any)?.altura_pagina ||
    result.altura_pagina ||
    1600;
  const aspectRatioDocumento = `${larguraPaginaOrig} / ${alturaPaginaOrig}`;

  const handleCopyText = () => {
    const textoFormatado = `${titulo}\n\n${elementos.map((e) => e.texto).join('\n\n')}`;
    navigator.clipboard.writeText(textoFormatado);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleElementoChange = (index: number, novoTexto: string) => {
    setElementos((prev) => {
      const novos = [...prev];
      novos[index] = { ...novos[index], texto: novoTexto };
      return novos;
    });
  };

  const aplicarSugestao = (indexParagrafo: number, palavraOriginal: string, sugestao: string) => {
    const elAtual = elementos[indexParagrafo];
    if (!elAtual) return;

    const regex = new RegExp(`\\b${palavraOriginal}\\b`, 'g');
    const novoTexto = elAtual.texto.replace(regex, sugestao);

    handleElementoChange(indexParagrafo, novoTexto);
    setMenuCorrecao(null);
  };

  const handlePalavraClick = (
    e: React.MouseEvent<HTMLSpanElement>,
    pIndex: number,
    palavraLimpa: string,
    sugestoes: string[]
  ) => {
    e.stopPropagation();
    if (!documentRef.current) return;

    const containerRect = documentRef.current.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();

    setMenuCorrecao({
      indexParagrafo: pIndex,
      palavraOriginal: palavraLimpa,
      sugestoes,
      posicao: {
        top: targetRect.bottom - containerRect.top + 4,
        left: targetRect.left - containerRect.left,
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
        elementos,
        paragrafos: elementos.map((e) => e.texto),
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
      const palavraLimpa = token.replace(/[^\wáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ-]/g, '');
      const termoLower = palavraLimpa.toLowerCase();

      const possuiSuspeita = mapaSuspeitas.has(termoLower);
      const sugestoes = mapaSuspeitas.get(termoLower) || [];

      if (possuiSuspeita) {
        return (
          <span
            key={tIdx}
            onClick={(e) =>
              handlePalavraClick(
                e,
                pIndex,
                palavraLimpa,
                sugestoes.length > 0 ? sugestoes : ['(Editar manualmente)']
              )
            }
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 border-b-2 border-amber-500 cursor-pointer font-semibold px-0.5 rounded transition-colors inline-block"
            title="Clique para corrigir esta falha de OCR"
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
      {/* Barra de Ferramentas / Header */}
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
          {/* Alternador de Modo de Layout */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 mr-1">
            <button
              type="button"
              onClick={() => setModoLayout('fluxo')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md font-medium transition-all ${
                modoLayout === 'fluxo'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Layout Fluido Adaptativo"
            >
              <AlignLeft className="w-3.5 h-3.5" /> Fluxo
            </button>
            <button
              type="button"
              onClick={() => setModoLayout('overlay')}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md font-medium transition-all ${
                modoLayout === 'overlay'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Layout com Posição Absoluta (Coordenadas da Imagem)"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Overlay (PDI)
            </button>
          </div>

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

      {/* Folha do Documento Adaptativa */}
      <div
        ref={documentRef}
        style={{ aspectRatio: aspectRatioDocumento }}
        className="bg-white text-slate-900 rounded-sm shadow-2xl p-[5%] font-serif border border-slate-200 relative w-full flex flex-col justify-start overflow-hidden"
      >
        {/* Topo / Cabeçalho do Documento */}
        <div className="border-b border-slate-300 pb-[2%] text-center mb-[3%]">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
            Documento Público Processado por OCR
          </p>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full text-center font-bold uppercase tracking-wide bg-transparent focus:outline-none focus:bg-amber-50 rounded px-2 text-slate-900"
            style={{
              fontSize: containerHeight > 0 ? `${Math.max(14, containerHeight * 0.024)}px` : '1.25rem',
            }}
          />
        </div>

        {/* MODO 1: RENDERIZAÇÃO EM FLUXO CONTÍNUO */}
        {modoLayout === 'fluxo' && (
          <div className="space-y-[1.5%] font-serif w-full">
            {elementos.map((item, index) => {
              const alinhamentoClass = ALINHAMENTO_CLASS[item.alinhamento || 'left'] || 'text-left';

              let fontSizePx: number;
              if (item.altura_fonte_relativa && containerHeight > 0) {
                fontSizePx = Math.round(item.altura_fonte_relativa * containerHeight);
                fontSizePx = Math.max(11, Math.min(fontSizePx, 48));
              } else {
                fontSizePx = item.estilo === 'titulo' ? 22 : item.estilo === 'subtitulo' ? 17 : 14;
              }

              const isTitle = item.estilo === 'titulo';
              const isSub = item.estilo === 'subtitulo';

              return (
                <div
                  key={item.id || index}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleElementoChange(index, e.currentTarget.innerText)}
                  style={{
                    fontSize: `${fontSizePx}px`,
                    lineHeight: 1.35,
                    fontWeight: isTitle ? 700 : isSub ? 600 : 400,
                  }}
                  className={`focus:outline-none focus:bg-amber-50/50 p-0.5 rounded transition-colors text-slate-800 ${alinhamentoClass}`}
                >
                  {renderizarParagrafoInterativo(item.texto, index)}
                </div>
              );
            })}
          </div>
        )}

        {/* MODO 2: RENDERIZAÇÃO ABSOLUTA POR COORDENADAS RELATIVAS (PDI) */}
        {modoLayout === 'overlay' && (
          <div className="relative w-full h-full">
            {elementos.map((item, index) => {
              const alinhamentoClass = ALINHAMENTO_CLASS[item.alinhamento || 'left'] || 'text-left';

              const hasCoords = item.x_relativo !== undefined && item.y_relativo !== undefined;
              let fontSizePx: number;

              if (item.altura_fonte_relativa && containerHeight > 0) {
                fontSizePx = Math.round(item.altura_fonte_relativa * containerHeight);
                fontSizePx = Math.max(10, Math.min(fontSizePx, 40));
              } else {
                fontSizePx = item.estilo === 'titulo' ? 20 : item.estilo === 'subtitulo' ? 16 : 13;
              }

              const stylePosicao: React.CSSProperties = hasCoords
                ? {
                    position: 'absolute',
                    left: `${(item.x_relativo! * 100).toFixed(2)}%`,
                    top: `${(item.y_relativo! * 100).toFixed(2)}%`,
                    width: `${(item.width_relativo! * 100).toFixed(2)}%`,
                    fontSize: `${fontSizePx}px`,
                    lineHeight: 1.25,
                    fontWeight: item.estilo === 'titulo' ? 700 : item.estilo === 'subtitulo' ? 600 : 400,
                  }
                : {
                    fontSize: `${fontSizePx}px`,
                    lineHeight: 1.35,
                  };

              return (
                <div
                  key={item.id || index}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleElementoChange(index, e.currentTarget.innerText)}
                  style={stylePosicao}
                  className={`focus:outline-none focus:bg-amber-50/50 p-0.5 rounded transition-colors text-slate-800 ${alinhamentoClass}`}
                >
                  {renderizarParagrafoInterativo(item.texto, index)}
                </div>
              );
            })}
          </div>
        )}

        {/* Menu Flutuante de Correção Ortográfica / Sugestões */}
        {menuCorrecao && (
          <div
            style={{
              top: `${menuCorrecao.posicao.top}px`,
              left: `${menuCorrecao.posicao.left}px`,
            }}
            className="absolute z-50 bg-slate-900 border border-slate-700 text-white rounded-lg shadow-2xl p-2 w-56 text-xs space-y-1 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[10px] text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800">
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
                  {sugestao}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seção de Anotações do Revisor */}
      <div className="p-4 bg-dark-900 border border-slate-800 rounded-xl space-y-2">
        <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-amber-400" /> Anotações do Revisor / Observações
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