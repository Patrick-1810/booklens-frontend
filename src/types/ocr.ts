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
  linhas_texto?: string[];
  largura_pagina?: number;
  altura_pagina?: number;
}

export interface PalavraSuspeita {
  original: string;
  sugestoes: string[];
}

export interface EstruturaOCR {
  titulo?: string;
  texto_markdown?: string;
  paragrafos?: string[];
  elementos?: ElementoLayout[];
  largura_pagina?: number;
  altura_pagina?: number;
}

export interface DoclingResultado {
  texto_markdown?: string;
  paragrafos?: string[];
}

export interface OCRResponse {
  id_registro?: string | number;
  arquivo?: string;
  tempo_processamento_segundos?: number;
  texto_completo?: string;
  texto_completo_votado?: string;
  texto_markdown?: string;
  titulo?: string;
  paragrafos?: string[];
  elementos?: ElementoLayout[];
  estrutura?: EstruturaOCR;
  docling?: DoclingResultado;
  palavras_suspeitas?: PalavraSuspeita[];
  largura_pagina?: number;
  altura_pagina?: number;
  confianca_preprocessamento?: number;
}

export interface SelectedFileState {
  file: File;
  previewUrl: string;
}