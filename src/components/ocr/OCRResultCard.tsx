import {
  CheckCircle2,
  Copy,
  FileText,
  Save,
  Highlighter,
  LayoutGrid,
  AlignLeft,
  Columns2,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import type { OCRResponse, ElementoLayout, PalavraSuspeita } from '../../types/ocr';
import { api } from '../../services/api';
import {
  converterElementosParaMarkdown,
  limparMarkdownDocling,
} from '../../utils/markdown-ocr';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

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

const markdownComponents = {
  h1: ({ ...props }) => (
    <h1
      className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mt-4 mb-3 uppercase tracking-wide font-serif text-center"
      {...props}
    />
  ),
  h2: ({ ...props }) => (
    <h2
      className="text-base sm:text-lg font-semibold text-slate-900 border-b border-slate-100 pb-1.5 mt-4 mb-2.5 tracking-wide font-serif"
      {...props}
    />
  ),
  h3: ({ ...props }) => (
    <h3
      className="text-sm sm:text-base font-semibold text-slate-800 mt-3 mb-1.5 font-serif"
      {...props}
    />
  ),
  ul: ({ ...props }) => (
    <ul className="list-disc pl-6 space-y-1.5 text-slate-800 my-2.5 text-sm" {...props} />
  ),
  ol: ({ ...props }) => (
    <ol className="list-decimal pl-6 space-y-1.5 text-slate-800 my-2.5 text-sm" {...props} />
  ),
  li: ({ ...props }) => (
    <li className="text-slate-800 leading-relaxed text-sm" {...props} />
  ),
  p: ({ ...props }) => (
    <p className="text-slate-800 my-2.5 leading-relaxed text-sm text-justify" {...props} />
  ),
};

export function OCRResultCard({ result, onReset }: OCRResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [titulo, setTitulo] = useState(
    result.titulo || result.titulo_documento || result.estrutura?.titulo || 'SEM TÍTULO'
  );

  const [elementos, setElementos] = useState<ElementoLayout[]>([]);
  const [anotacoes, setAnotacoes] = useState(result.anotacoes || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  const [metodoComparacao, setMetodoComparacao] = useState<'booklens' | 'docling' | 'lado-a-lado'>('booklens');

  const [menuCorrecao, setMenuCorrecao] = useState<{
    indexParagrafo: number;
    palavraOriginal: string;
    sugestoes: string[];
    posicao: { top: number; left: number };
  } | null>(null);

  const documentRef = useRef<HTMLDivElement>(null);

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
  }, [elementos, metodoComparacao]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitulo(result.titulo || result.titulo_documento || result.estrutura?.titulo || 'SEM TÍTULO');
    setAnotacoes(result.anotacoes || '');

    const elementosRecebidos =
      result.elementos ||
      result.elementos_formatados ||
      result.estrutura?.elementos;

    if (elementosRecebidos && elementosRecebidos.length > 0) {
      setElementos(elementosRecebidos);
    } else {
      const pLista =
        (result.paragrafos && result.paragrafos.length > 0
          ? result.paragrafos
          : result.estrutura?.paragrafos) ||
        (result.texto_extraido ? result.texto_extraido.split('\n\n') : []) || [
          result.texto_completo_votado || result.texto_completo || '',
        ];

      setElementos(
        pLista.map((p: string, idx: number): ElementoLayout => ({
          id: `p-${idx}`,
          tipo: 'paragraph',
          texto: p,
          alinhamento: 'justify',
        }))
      );
    }
  }, [result]);

  const markdownBooklens = useMemo(() => {
    if (result.texto_markdown) return result.texto_markdown;
    if (result.estrutura?.texto_markdown) return result.estrutura.texto_markdown;
    return converterElementosParaMarkdown(elementos, titulo);
  }, [result.texto_markdown, result.estrutura?.texto_markdown, elementos, titulo]);

  const markdownDocling = useMemo(() => {
    const rawDocling =
      result.docling?.texto_markdown ||
      result.docling_formatado?.texto_markdown;
    return limparMarkdownDocling(rawDocling);
  }, [result.docling?.texto_markdown, result.docling_formatado?.texto_markdown]);

  const palavrasSuspeitas: PalavraSuspeita[] = result.palavras_suspeitas || [];
  const mapaSuspeitas = new Map<string, string[]>();
  palavrasSuspeitas.forEach((item) => {
    mapaSuspeitas.set(item.original.toLowerCase(), item.sugestoes);
  });

  const primeiroElemento = elementos[0];
  const larguraPaginaOrig =
    primeiroElemento?.largura_pagina ||
    result.largura_pagina ||
    result.estrutura?.largura_pagina ||
    1200;

  const alturaPaginaOrig =
    primeiroElemento?.altura_pagina ||
    result.altura_pagina ||
    1600;

  const aspectRatioDocumento = `${larguraPaginaOrig} / ${alturaPaginaOrig}`;

  const handleCopyText = () => {
    const textoFormatado =
      metodoComparacao === 'docling'
        ? (markdownDocling || '')
        : `${titulo}\n\n${elementos.map((e) => e.texto).join('\n\n')}`;

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

  const aplicarSugestao = (
    indexParagrafo: number,
    palavraOriginal: string,
    sugestao: string
  ) => {
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
    const docId = result.id_registro;
    if (!docId) {
      console.warn('ID de registro não encontrado no objeto result:', result);
      alert('Aviso: O identificador do documento não foi encontrado para atualização.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        titulo: titulo?.trim() || 'Documento sem título',
        elementos,
        paragrafos: elementos.map((e) => e.texto),
        docling_formatado: result.docling || result.docling_formatado || null,
        anotacoes: anotacoes?.trim() || null,
        motor_preferido: metodoComparacao,
      };

      console.log(`Enviando PUT /ocr/documentos/${docId}:`, payload);
      const res = await api.put(`/ocr/documentos/${docId}`, payload);
      console.log('Resposta de sucesso ao salvar:', res.data);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: unknown) {
      console.error('Erro ao salvar documento:', error);
      let detalhe = 'Erro desconhecido ao salvar o documento.';
      if (axios.isAxiosError(error)) {
        detalhe = error.response?.data?.detail || error.response?.data?.message || error.message || detalhe;
        console.error('Detalhes do erro na API:', error.response?.data);
      } else if (error instanceof Error) {
        detalhe = error.message;
      }
      alert(`Falha ao salvar o documento: ${detalhe}`);
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
            className="cursor-pointer hover:underline hover:text-brand-600 transition-colors inline"
            title="Clique para ver sugestões de correção de OCR"
          >
            {token}
          </span>
        );
      }

      return <span key={tIdx}>{token}</span>;
    });
  };

  return (
    <div
      className="space-y-6 text-left max-w-5xl mx-auto"
      onClick={() => setMenuCorrecao(null)}
    >
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Documento Processado</h3>
            <p className="text-xs text-slate-400">
              {result.tempo_processamento_segundos
                ? `Concluído em ${result.tempo_processamento_segundos}s • `
                : ''}
              Registro #{result.id_registro || 'N/A'}
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 mr-1">
            <button
              type="button"
              onClick={() => setMetodoComparacao('booklens')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                metodoComparacao === 'booklens'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> BookLens (Autoral)
            </button>

            <button
              type="button"
              onClick={() => setMetodoComparacao('docling')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                metodoComparacao === 'docling'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" /> Docling (IBM)
            </button>

            <button
              type="button"
              onClick={() => setMetodoComparacao('lado-a-lado')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                metodoComparacao === 'lado-a-lado'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" /> Lado a Lado
            </button>
          </div>

          <button
            type="button"
            onClick={handleGrifarSelecao}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors px-3 py-2 rounded-lg border border-slate-700"
            title="Selecione um trecho de texto e clique para grifar"
          >
            <Highlighter className="w-4 h-4 text-amber-400" /> Grifar
          </button>

          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg border border-slate-700 transition-all"
          >
            <Copy className="w-4 h-4" /> {copied ? 'Copiado!' : 'Copiar Texto'}
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
            {saving ? 'Salvando...' : saveSuccess ? 'Salvo!' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Renderização do Resultado */}
      {metodoComparacao === 'booklens' && (
        <div className="space-y-3">
          <div
            ref={documentRef}
            style={{ aspectRatio: aspectRatioDocumento }}
            className="bg-white text-slate-900 rounded-sm shadow-2xl p-[5%] font-serif border border-slate-200 relative w-full flex flex-col justify-start overflow-hidden"
          >
            <div className="border-b border-slate-300 pb-[2%] text-center mb-[3%]">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Documento Processado por OCR (Overlay PDI)
              </p>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full text-center font-bold uppercase tracking-wide bg-transparent focus:outline-none focus:bg-amber-50 rounded px-2 text-slate-900"
                style={{
                  fontSize:
                    containerHeight > 0
                      ? `${Math.max(14, containerHeight * 0.024)}px`
                      : '1.25rem',
                }}
              />
            </div>

            <div className="relative w-full h-full">
              {elementos.map((item, index) => {
                const alinhamentoClass =
                  ALINHAMENTO_CLASS[item.alinhamento || 'left'] || 'text-left';
                const hasCoords =
                  item.x_relativo !== undefined && item.y_relativo !== undefined;

                let fontSizePx: number;
                if (item.altura_fonte_relativa && containerHeight > 0) {
                  fontSizePx = Math.round(item.altura_fonte_relativa * containerHeight);
                  fontSizePx = Math.max(10, Math.min(fontSizePx, 40));
                } else {
                  fontSizePx =
                    item.tipo === 'title' ? 20 : item.tipo === 'heading' ? 16 : 13;
                }

                const stylePosicao: React.CSSProperties = hasCoords
                  ? {
                      position: 'absolute',
                      left: `${(item.x_relativo! * 100).toFixed(2)}%`,
                      top: `${(item.y_relativo! * 100).toFixed(2)}%`,
                      width: `${(item.width_relativo! * 100).toFixed(2)}%`,
                      fontSize: `${fontSizePx}px`,
                      lineHeight: 1.25,
                      fontWeight:
                        item.tipo === 'title' ? 700 : item.tipo === 'heading' ? 600 : 400,
                    }
                  : { fontSize: `${fontSizePx}px`, lineHeight: 1.35 };

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
        </div>
      )}

      {metodoComparacao === 'docling' && (
        <div className="space-y-3">
          <div
            contentEditable
            suppressContentEditableWarning
            className="bg-white text-slate-900 rounded-sm shadow-2xl p-8 sm:p-12 font-serif border border-slate-200 min-h-[500px] focus:outline-none"
          >
            <div className="max-w-3xl mx-auto prose prose-slate">
              <ReactMarkdown components={markdownComponents}>
                {markdownDocling || 'Nenhum texto extraído pelo Docling.'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {metodoComparacao === 'lado-a-lado' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 block px-1">
              BookLens (Autoral)
            </span>
            <div
              contentEditable
              suppressContentEditableWarning
              className="bg-white text-slate-900 rounded-sm shadow-xl p-6 sm:p-8 font-serif border border-slate-200 max-h-[750px] overflow-y-auto focus:outline-none"
            >
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {markdownBooklens || '# Nenhum texto disponível.'}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block px-1">
              Docling (IBM)
            </span>
            <div
              contentEditable
              suppressContentEditableWarning
              className="bg-white text-slate-900 rounded-sm shadow-xl p-6 sm:p-8 font-serif border border-slate-200 max-h-[750px] overflow-y-auto focus:outline-none"
            >
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {markdownDocling || 'Nenhum texto extraído pelo Docling.'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Observações / Anotações do Revisor */}
      <div className="p-4 bg-dark-900 border border-slate-800 rounded-xl space-y-2">
        <label className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-amber-400" /> Anotações do Revisor / Observações
        </label>
        <textarea
          rows={3}
          value={anotacoes}
          onChange={(e) => setAnotacoes(e.target.value)}
          placeholder="Escreva aqui observações do revisor sobre o documento..."
          className="w-full bg-dark-850 border border-slate-700/60 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-brand-500 resize-none"
        />
      </div>
    </div>
  );
}