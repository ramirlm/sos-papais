import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class KnowledgesService {
  constructor(private readonly dataSource: DataSource) {}

  async matchDocuments({
    queryEmbedding,
    matchThreshold,
    matchCount,
  }: {
    queryEmbedding?: number[];
    matchThreshold: number;
    matchCount: number;
  }): Promise<{ id: string; content: string; similarity: number }[]> {
    return await this.dataSource.query(
      `
      SELECT * FROM match_documents($1::vector, $2::float, $3::int)
    `,
      [this.formatVector(queryEmbedding), matchThreshold, matchCount],
    );
  }

  async insertKnowledge({
    content,
    embedding,
  }: {
    content: string;
    embedding?: number[];
  }) {
    try {
      await this.dataSource.query(
        `
        INSERT INTO knowledge (content, embedding)
        VALUES ($1, $2::vector)
        `,
        [content, this.formatVector(embedding)],
      );
    } catch (error) {
      console.error('Insert failed:', error);
    }
  }

  async isEmbedded() {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) FROM knowledge WHERE embedding IS NOT NULL`,
    );
    return parseInt(result[0].count, 10) > 0;
  }

  private formatVector(vector: number[] | undefined): string | null {
    if (!vector) return null;
    return `[${vector.join(',')}]`;
  }
}
