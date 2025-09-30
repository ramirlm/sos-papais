import * as fs from 'fs';
import { join } from 'path';

export function getMarkdownFilesRecursively(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => join(dir, entry.name));

  const folders = entries.filter((entry) => entry.isDirectory());

  for (const folder of folders) {
    const folderPath = join(dir, folder.name);
    files.push(...getMarkdownFilesRecursively(folderPath));
  }

  return files;
}
