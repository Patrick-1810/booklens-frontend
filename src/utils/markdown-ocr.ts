import type { ElementoLayout } from '../types/ocr';

/**
 * Converte os elementos semânticos estruturados do BookLens para Markdown
 */
export function converterElementosParaMarkdown(
  elementos: ElementoLayout[],
  titulo?: string
): string {
  if (!elementos || elementos.length === 0) {
    return titulo ? `# ${titulo}` : '';
  }

  const blocosMd: string[] = [];

  for (const elemento of elementos) {
    const tipo = elemento.tipo || 'paragraph';
    const texto = (elemento.texto || '').trim();

    if (!texto) continue;

    if (tipo === 'title') {
      blocosMd.push(`# ${texto}`);
    } else if (tipo === 'heading') {
      blocosMd.push(`## ${texto}`);
    } else if (tipo === 'list') {
      const linhasBloco = elemento.linhas_texto || [];
      if (linhasBloco.length > 1) {
        const itensMd = linhasBloco
          .map((l) => l.trim())
          .filter(Boolean)
          .map((linha) => {
            if (/^[•●▪◦\-–—]\s*/.test(linha)) {
              return linha.replace(/^[•●▪◦\-–—]\s*/, '- ');
            }
            if (/^\d+[.)]\s*/.test(linha)) {
              return linha;
            }
            return `- ${linha}`;
          });
        blocosMd.push(itensMd.join('\n'));
      } else {
        if (/^[•●▪◦\-–—]\s*/.test(texto)) {
          blocosMd.push(texto.replace(/^[•●▪◦\-–—]\s*/, '- '));
        } else if (/^\d+[.)]\s*/.test(texto)) {
          blocosMd.push(texto);
        } else {
          blocosMd.push(`- ${texto}`);
        }
      }
    } else {
      blocosMd.push(texto);
    }
  }

  return blocosMd.join('\n\n');
}

/**
 * Limpa o Markdown retornado pelo Docling removendo tags de imagens e quebras excessivas
 */
export function limparMarkdownDocling(markdown?: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/<!--\s*image\s*-->/gi, '')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}
