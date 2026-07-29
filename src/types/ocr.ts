export interface PalavraSuspeita {
  original: string;
  sugestoes: string[];
}

export interface OCRResponse {
  sucesso: boolean;
  id_registro: number;
  arquivo: string;
  tempo_processamento_segundos: number;
  estrutura: {
    titulo: string;
    paragrafos: string[];
  };
  texto_completo: string;
  palavras_suspeitas?: PalavraSuspeita[];
  salvo_em: string;
}

export interface SelectedFileState {
  file: File;
  previewUrl: string;
}

export interface DocumentoUpdatePayload {
  titulo: string;
  paragrafos: string[];
  anotacoes?: string;
}