import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
}

export function DropZone({ onFileSelect }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
        isDragging
          ? 'border-brand-500 bg-brand-500/5'
          : 'border-slate-800 hover:border-slate-700 bg-dark-900/40 hover:bg-dark-900/70'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />

      <div className="p-4 bg-dark-800/80 border border-slate-700/50 rounded-full text-brand-400 shadow-inner">
        <Upload className="w-7 h-7" />
      </div>

      <div className="space-y-1 max-w-sm">
        <p className="text-base font-medium text-slate-200">
          Arraste uma imagem aqui ou{' '}
          <span className="text-brand-400 underline decoration-brand-400/30 underline-offset-4">
            clique para buscar
          </span>
        </p>
        <p className="text-xs text-slate-500">
          Suporta arquivos PNG, JPG ou WEBP de até 10MB
        </p>
      </div>
    </div>
  );
}