export type TipoElemento = 'title' | 'heading' | 'paragraph' | 'list';
export type AlinhamentoElemento = 'left' | 'center' | 'right' | 'justify';

export interface ElementoLayout {
  id: string;
  tipo: TipoElemento;
  texto: string;
  texto_original?: string;
  alinhamento: AlinhamentoElemento;
  confianca_ocr?: number;
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
  numero_linhas?: number;
  largura_pagina?: number;
  altura_pagina?: number;
}

export interface PalavraSuspeita {
  original: string;
  sugestoes: string[];
}

export interface EstruturaOCR {
  titulo?: string;
  paragrafos?: string[];
  elementos?: ElementoLayout[];
}

export interface OCRResponse {
  id_registro?: string | number;
  arquivo?: string;
  tempo_processamento_segundos?: number;
  texto_completo?: string;
  texto_completo_votado?: string;
  titulo?: string;
  paragrafos?: string[];
  elementos?: ElementoLayout[];
  estrutura?: EstruturaOCR;
  palavras_suspeitas?: PalavraSuspeita[];
  largura_pagina?: number;
  altura_pagina?: number;
  confianca_preprocessamento?: number;
}

export interface SelectedFileState {
  file: File;
  previewUrl: string;
}