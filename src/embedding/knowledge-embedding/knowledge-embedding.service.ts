import { Injectable } from '@nestjs/common';
import { EmbeddingService } from '../embedding.service';
import { KnowledgesService } from '../../knowledges/knowledges.service';
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

  async embedKnowledgeBase(): Promise<{ documentsCount: number }> {
    const files = fs
      .readdirSync(this.knowledgeBasePath)
      .filter((file) => file.endsWith('.md'));

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
      const content = fs.readFileSync(
        join(this.knowledgeBasePath, file),
        'utf-8',
      );

      console.log(`Vetorizando o arquivo: ${file}`);
      const embedding = await this.embeddingService.generateEmbedding(content);
      await this.knowledgeService.insertKnowledge({ content, embedding });
    }

    console.log('Vetorização concluída.');

    return { documentsCount: files.length };
  }
}
