export function extractMarkdownTitle(markdown: string): string | null {
  const lines = markdown.split('\n');
  for (const line of lines) {
    const match = line.match(/^#\s+(.*)/);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}