import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { DropZone } from '../components/ocr/DropZone';
import { FilePreviewCard } from '../components/ocr/FilePreviewCard';
import { ScanHistory } from '../components/ocr/ScanHistory';
import { OCRResultCard } from '../components/ocr/OCRResultCard';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';
import type { OCRResponse, SelectedFileState } from '../types/ocr';

export function Scanner() {
  const [selectedFile, setSelectedFile] = useState<SelectedFileState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResponse | null>(null);

  const [historyItems, setHistoryItems] = useState([
    { id: '1', title: 'Edital de Concurso Público 2026.pdf', date: 'Há 2 horas' },
    { id: '2', title: 'Plano Diretor Municipal.pdf', date: 'Ontem' },
  ]);

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido (PNG, JPG ou WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('O arquivo deve ter no máximo 10MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedFile({ file, previewUrl });
    setOcrResult(null);
  };

  const handleRemoveFile = () => {
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    setSelectedFile(null);
    setOcrResult(null);
  };

  const handleProcessDocument = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!selectedFile) {
      console.warn('Processamento cancelado: Nenhum arquivo selecionado.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile.file);

    try {
      setUploading(true);
      setErrorMessage(null);

      console.log('Iniciando envio do arquivo para FastAPI:', selectedFile.file.name);

      const response = await api.post<OCRResponse>('/ocr/extrair-texto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Resposta recebida do servidor:', response.data);

      const data = response.data;
      setOcrResult(data);

      setHistoryItems((prev) => [
        {
          id: String(data.id_registro),
          title: data.estrutura.titulo || data.arquivo,
          date: 'Agora mesmo',
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error('Erro na requisição OCR:', err);
      setErrorMessage(
        err.response?.data?.detail || err.message || 'Erro ao comunicar com o servidor OCR. Tente novamente.'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 sm:p-10 space-y-8 max-w-6xl mx-auto">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Digitalizar Documento
          </h1>
          <p className="text-sm text-slate-400">
            Envie a imagem do documento para iniciar a extração OCR avançada.
          </p>
        </header>

        <main className="space-y-8">
          {errorMessage && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          <section className="bg-dark-850 border border-slate-800 rounded-2xl p-6 sm:p-10 transition-all">
            {ocrResult ? (
              <OCRResultCard result={ocrResult} onReset={handleRemoveFile} />
            ) : !selectedFile ? (
              <DropZone onFileSelect={handleFileSelect} />
            ) : (
              <FilePreviewCard
                fileName={selectedFile.file.name}
                fileSize={selectedFile.file.size}
                previewUrl={selectedFile.previewUrl}
                uploading={uploading}
                onRemove={handleRemoveFile}
                onProcess={handleProcessDocument}
              />
            )}
          </section>

          <ScanHistory items={historyItems} />
        </main>
      </div>
    </DashboardLayout>
  );
}