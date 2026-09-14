import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Search, Loader2, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import type { DocumentoSalvo, OCRResponse } from '../types/ocr';
import { documentosService } from '../services/api';
import { DocumentCard } from '../components/documents/DocumentCard';
import { OCRResultCard } from '../components/ocr/OCRResultCard';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import axios from 'axios';

export function SavedDocuments() {
  const [documentos, setDocumentos] = useState<DocumentoSalvo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [documentoSelecionado, setDocumentoSelecionado] = useState<DocumentoSalvo | null>(null);

  const carregarDocumentos = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await documentosService.listar();
      console.log('Documentos recebidos da API:', data);

      if (Array.isArray(data)) {
        setDocumentos(data);
      } else {
        console.warn('A API não retornou uma lista válida de documentos:', data);
        setDocumentos([]);
      }
    } catch (err: unknown) {
      console.error('Erro ao carregar documentos salvos:', err);
      let msg = 'Não foi possível conectar ao servidor para carregar seus documentos.';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.detail || err.response?.data?.message || err.message || msg;
        console.error('Detalhes do erro retornado:', err.response?.data);
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarDocumentos();
  }, [carregarDocumentos]);

  const handleExcluir = async (id: number) => {
    if (!confirm('Deseja realmente excluir este documento?')) return;
    try {
      await documentosService.excluir(id);
      setDocumentos((prev) => (Array.isArray(prev) ? prev.filter((doc) => doc?.id !== id) : []));
      if (documentoSelecionado?.id === id) {
        setDocumentoSelecionado(null);
      }
    } catch (err: unknown) {
      console.error('Erro ao excluir documento:', err);
      let msg = 'Erro ao excluir o documento.';
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.detail || msg;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      alert(msg);
    }
  };

  const listaSegura = Array.isArray(documentos) ? documentos : [];
  const termoBusca = (busca || '').toLowerCase().trim();

  const documentosFiltrados = listaSegura.filter((doc) => {
    if (!doc) return false;
    if (!termoBusca) return true;

    const titulo = (doc.titulo || doc.titulo_documento || doc.nome_arquivo || '').toLowerCase();
    const texto = (doc.texto_completo || doc.texto_extraido || '').toLowerCase();
    const anotacoes = (doc.anotacoes || '').toLowerCase();

    return titulo.includes(termoBusca) || texto.includes(termoBusca) || anotacoes.includes(termoBusca);
  });

  // Adapta o DocumentoSalvo para a estrutura OCRResponse esperada pelo OCRResultCard
  const ocrResultAdaptado: OCRResponse | null = documentoSelecionado
    ? {
        id_registro: documentoSelecionado.id,
        arquivo: documentoSelecionado.nome_arquivo || documentoSelecionado.caminho_imagem || 'documento.png',
        titulo: documentoSelecionado.titulo || documentoSelecionado.titulo_documento || 'Documento sem título',
        texto_completo: documentoSelecionado.texto_completo || documentoSelecionado.texto_extraido || '',
        texto_markdown: documentoSelecionado.texto_markdown,
        elementos:
          documentoSelecionado.elementos ||
          documentoSelecionado.elementos_formatados ||
          [],
        paragrafos:
          documentoSelecionado.paragrafos ||
          (documentoSelecionado.texto_extraido
            ? documentoSelecionado.texto_extraido.split('\n\n')
            : []),
        docling:
          documentoSelecionado.docling ||
          documentoSelecionado.docling_formatado,
        anotacoes: documentoSelecionado.anotacoes || '',
        motor_preferido: documentoSelecionado.motor_preferido || 'booklens',
      }
    : null;

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-10 space-y-8 max-w-6xl mx-auto">
        {/* Visualização detalhada do documento selecionado */}
        {documentoSelecionado && ocrResultAdaptado ? (
          <div className="space-y-6">
            <button
              onClick={() => setDocumentoSelecionado(null)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-dark-850 border border-slate-800 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar para lista de documentos
            </button>

            <OCRResultCard
              result={ocrResultAdaptado}
              onReset={() => setDocumentoSelecionado(null)}
            />
          </div>
        ) : (
          <>
            {/* Header da Galeria */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-brand-400" /> Documentos Salvos
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Gerencie, consulte e revise todos os seus documentos processados no BookLens.
                </p>
              </div>

              {/* Campo de Busca */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por título, conteúdo ou anotações..."
                  className="w-full bg-dark-850 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Alerta de erro caso ocorra falha */}
            {errorMessage && (
              <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
                <button
                  onClick={carregarDocumentos}
                  className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
                </button>
              </div>
            )}

            {/* Conteúdo da Listagem */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
                <p className="text-xs">Carregando acervo de documentos...</p>
              </div>
            ) : documentosFiltrados.length === 0 ? (
              <div className="text-center py-20 bg-dark-850/50 border border-slate-800/80 rounded-2xl p-8">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-300">Nenhum documento encontrado</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {busca
                    ? 'Nenhum documento corresponde à sua pesquisa.'
                    : 'Você ainda não possui documentos salvos. Envie uma imagem no Scanner para começar.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentosFiltrados.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    documento={doc}
                    onSelect={(selectedDoc) => setDocumentoSelecionado(selectedDoc)}
                    onDelete={handleExcluir}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}