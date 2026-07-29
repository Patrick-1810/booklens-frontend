import { Image as ImageIcon, X, ArrowRight } from 'lucide-react';

interface FilePreviewCardProps {
  fileName: string;
  fileSize: number;
  previewUrl: string;
  uploading: boolean;
  onRemove: () => void;
  onProcess: () => void;
}

export function FilePreviewCard({
  fileName,
  fileSize,
  previewUrl,
  uploading,
  onRemove,
  onProcess,
}: FilePreviewCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-lg">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white max-w-50 sm:max-w-xs truncate">
              {fileName}
            </p>
            <p className="text-xs text-slate-400">
              {(fileSize / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>

        <button
          onClick={onRemove}
          disabled={uploading}
          className="p-2 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
          title="Remover imagem"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden bg-dark-900 border border-slate-800 max-h-105 flex items-center justify-center p-2">
        <img
          src={previewUrl}
          alt="Preview do Documento"
          className="max-h-95 w-auto object-contain rounded-lg"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onProcess}
          disabled={uploading}
          className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 text-sm"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Extraindo texto...
            </>
          ) : (
            <>
              Iniciar Processamento 
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}