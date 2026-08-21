export interface SelectedFileState {
  file: File;
  previewUrl: string;
}

export interface ElementoLayout {
  id?: string;
  texto: string;
  alinhamento?: 'left' | 'center' | 'right' | 'justify';
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

export interface PalavraSuspeita {
  original: string;
  sugestoes: string[];
}

export interface EstruturaOCR {
  titulo: string;
  paragrafos: string[];
  elementos?: ElementoLayout[];
  largura_pagina?: number;
  altura_pagina?: number;
}

export interface OCRResponse {
  sucesso: boolean;
  id_registro: number;
  arquivo: string;
  tempo_processamento_segundos: number;
  estrutura: EstruturaOCR;
  texto_completo: string;
  palavras_suspeitas?: PalavraSuspeita[];
  salvo_em: string;
  largura_pagina?: number;
  altura_pagina?: number;
}