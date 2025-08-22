import { Injectable } from '@nestjs/common';
import { EmbeddingService } from '../embedding.service';
import { KnowledgesService } from '../../knowledges/knowledges.service';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class KnowledgeEmbeddingService {
  private static startedEmbedding = false;
  private knowledgeBasePath = join(process.cwd(), 'src', 'knowledge-base');

  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly knowledgeService: KnowledgesService,
  ) {}

  async embedKnowledgeBase(): Promise<void> {
    if (await this.knowledgeService.isEmbedded()) {
      console.log('Base de conhecimento já vetorizada, pulando...');
      return;
    }
    if (KnowledgeEmbeddingService.startedEmbedding) {
      console.log('Vetorização já em andamento, pulando...');
      return;
    }

    KnowledgeEmbeddingService.startedEmbedding = true;
    console.log('Iniciando a vetorização da base de conhecimento...');

    const files = fs
      .readdirSync(this.knowledgeBasePath)
      .filter((file) => file.endsWith('.md'));

    for (const file of files) {
      const content = fs.readFileSync(
        join(this.knowledgeBasePath, file),
        'utf-8',
      );

      console.log(`Vetorizando o arquivo: ${file}`);
      const embedding = await this.embeddingService.generateEmbedding(content);
      console.log(`Embedding gerado para ${file}:`, embedding);

      await this.knowledgeService.insertKnowledge({ content, embedding });
    }

    console.log('Vetorização concluída.');
  }
}
