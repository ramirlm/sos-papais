import { Injectable } from '@nestjs/common';
import { EmbeddingService } from '../embedding.service';
import { KnowledgesService } from '../../knowledges/knowledges.service';
import { getMarkdownFilesRecursively } from '../../common/utils/getMarkdownFilesRecursively';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class KnowledgeEmbeddingService {
  private static startedEmbedding = false;
  private knowledgeBasePath = join(process.cwd(), 'knowledge-base');

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly knowledgeService: KnowledgesService,
  ) {}

  splitTextIntoChunks(text, maxChunkSize = 1000) {
    const paragraphs = text.split(/\n\s*\n/); // separa por parágrafos (linhas vazias)
    const chunks: string[] = [];
    let currentChunk = '';

    for (const para of paragraphs) {
      if ((currentChunk + para).length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        // Se o parágrafo for maior que o maxChunkSize, quebra ele diretamente
        if (para.length > maxChunkSize) {
          for (let i = 0; i < para.length; i += maxChunkSize) {
            chunks.push(para.slice(i, i + maxChunkSize).trim());
          }
        } else {
          currentChunk = para + '\n\n';
        }
      } else {
        currentChunk += para + '\n\n';
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  async embedKnowledgeBase() {
    const files = getMarkdownFilesRecursively(this.knowledgeBasePath);

    if (await this.knowledgeService.isEmbedded()) {
      console.log('Base de conhecimento já vetorizada, pulando...');
      return { documentsCount: files.length };
    }

    if (KnowledgeEmbeddingService.startedEmbedding) {
      console.log('Vetorização já em andamento, pulando...');
      return { documentsCount: files.length };
    }

    KnowledgeEmbeddingService.startedEmbedding = true;
    console.log('Iniciando a vetorização da base de conhecimento...');

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const fileName = file.replace(this.knowledgeBasePath + '/', '');

      console.log(`\nQuebrando o arquivo em chunks: ${fileName}`);
      const chunks = this.splitTextIntoChunks(content);

      for (const [index, chunk] of chunks.entries()) {
        console.log(
          `Vetorizando chunk ${index + 1}/${chunks.length} do arquivo: ${fileName}`,
        );
        const embedding = await this.embeddingService.generateEmbedding(chunk);
        await this.knowledgeService.insertKnowledge({
          content: chunk,
          embedding,
        });
      }
    }

    console.log('Vetorização concluída.');
    KnowledgeEmbeddingService.startedEmbedding = false;
  }
}
