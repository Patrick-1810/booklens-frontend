import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { DropZone } from '../components/ocr/DropZone';
import { FilePreviewCard } from '../components/ocr/FilePreviewCard';
import { ScanHistory } from '../components/ocr/ScanHistory';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { api } from '../services/api';

interface SelectedFileState {
  file: File;
  previewUrl: string;
}

export function Scanner() {
  const [selectedFile, setSelectedFile] = useState<SelectedFileState | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const historyItems = [
    { id: '1', title: 'Edital de Concurso Público 2026.pdf', date: 'Há 2 horas' },
    { id: '2', title: 'Plano Diretor Municipal.pdf', date: 'Ontem' },
    { id: '3', title: 'Relatório Anual de Transparência.pdf', date: 'Há 3 dias' },
    { id: '4', title: 'Diário Oficial da União.pdf', date: 'Semana passada' },
  ];

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
  };

  const handleRemoveFile = () => {
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile.previewUrl);
    }
    setSelectedFile(null);
  };

  const handleProcessDocument = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile.file);

    try {
      setUploading(true);
      setErrorMessage(null);

      const response = await api.post('/ocr/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Documento processado com sucesso:', response.data);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail || 'Erro ao processar a imagem. Tente novamente.'
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
            Envie a imagem do documento para iniciar a extração.
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
            {!selectedFile ? (
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