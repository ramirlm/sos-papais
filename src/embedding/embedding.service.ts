import { Injectable } from '@nestjs/common';

interface EmbedderPipeline {
  (
    text: string,
    options: { pooling: string; normalize: boolean },
  ): Promise<EmbedderOutput>;
}

interface EmbedderOutput {
  data: Float32Array;
}

@Injectable()
export class EmbeddingService {
  constructor() {}

  private embedder: EmbedderPipeline | null = null;

  async init(): Promise<void> {
    if (!this.embedder) {
      try {
        console.log('🔄 Loading embedding model...');
        const { pipeline } = await import('@xenova/transformers');
        this.embedder = (await pipeline(
          'feature-extraction',
          'Xenova/all-MiniLM-L6-v2',
        )) as EmbedderPipeline;
        console.log('✅ Model loaded!');
      } catch (error) {
        console.error('❌ Failed to load embedding model:', error);
        throw new Error('Failed to initialize embedding model');
      }
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!text?.trim()) {
      throw new Error('Text input cannot be empty');
    }

    await this.init();

    if (!this.embedder) {
      throw new Error('Embedder is not initialized');
    }

    try {
      const output: EmbedderOutput = await this.embedder(text, {
        pooling: 'mean',
        normalize: true,
      });

      if (!output?.data) {
        throw new Error('Invalid embedding output structure');
      }

      return Array.from(output.data);
    } catch (error) {
      console.error('❌ Failed to generate embedding:', error);
      throw new Error('Failed to generate text embedding');
    }
  }
}
