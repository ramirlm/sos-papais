import { MigrationInterface, QueryRunner } from 'typeorm';

export class KnowledgeEmbeddingIndex1756000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create an ivfflat index to speed up similarity searches
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS knowledge_embedding_ivfflat_idx
      ON "knowledge" USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `);
    await queryRunner.query(`ANALYZE "knowledge";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS knowledge_embedding_ivfflat_idx;`,
    );
  }
}
