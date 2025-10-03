import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private embedder: any;
  private readonly modelName = 'Xenova/bge-large-en-v1.5';

  async onModuleInit() {
    await this.init();
  }

  async init() {
    if (!this.embedder) {
      this.logger.log(`🔄 Carregando modelo de embeddings: ${this.modelName}`);
      try {
        const { pipeline } = await import('@xenova/transformers');

        this.embedder = await pipeline('feature-extraction', this.modelName, {
          local_files_only: false,
          cache_dir: '/tmp',
          revision: 'main',
        });

        this.logger.log('✅ Modelo de embeddings carregado com sucesso!');
      } catch (error) {
        this.logger.error('❌ Erro ao carregar o modelo de embeddings', error);
        throw error;
      }
    }
  }

  private wrapText(text: string): string {
    return `Representação semântica: ${text}`;
  }

  async generateEmbedding(rawText: string): Promise<number[]> {
    await this.init();

    const text = this.wrapText(rawText);

    try {
      const output = await this.embedder(text, {
        pooling: 'mean',
        normalize: true,
      });

      return Array.from(output.data);
    } catch (error) {
      this.logger.error('❌ Erro ao gerar embedding', error);
      throw error;
    }
  }
}
