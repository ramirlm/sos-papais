import { extractMarkdownTitle } from "./extractMarkdownTitle";

export function getFormattedFoundDocuments(documents: { id: string; content: string; similarity: number }[]): string {
  const formatted = documents.map((doc, index) => {
    const title = extractMarkdownTitle(doc.content) || 'Título não encontrado';
    const similarity = doc.similarity;

    return [
      `Documento ${index + 1}`,
      `ID           : ${doc.id}`,
      `Título       : ${title}`,
      `Similaridade : ${similarity}`,
    ].join('\n');
  });

  return `\n\nDocumentos encontrados:\n\n${formatted.join('\n\n')}`;
}