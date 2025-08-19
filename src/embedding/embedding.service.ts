import { Injectable } from '@nestjs/common';
import { pipeline } from '@xenova/transformers';

@Injectable()
export class EmbeddingService {
  constructor() {
    this.init();
  }

  private embedder: any;

  async init() {
    if (!this.embedder) {
      console.log('🔄 Loading embedding model...');
      this.embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
      );
      console.log('✅ Model loaded!');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    await this.init();

    const output = await this.embedder(text, {
      pooling: 'mean',
      normalize: true,
    });

    return Array.from(output.data);
  }
}
