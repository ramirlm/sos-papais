import { MigrationInterface, QueryRunner } from 'typeorm';

export class DocumentFunctions1755624418651 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);
    await queryRunner.query(`
      ALTER TABLE "knowledge"
      ADD COLUMN "embedding" VECTOR(384)
    `);
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION match_documents (
        query_embedding VECTOR(384),
        match_threshold FLOAT,
        match_count INT
      )
      RETURNS TABLE (
        id UUID,
        content TEXT,
        similarity FLOAT
      )
      LANGUAGE plpgsql AS $$
      BEGIN
        RETURN QUERY
        SELECT
          knowledge.id,
          knowledge.content::TEXT,
          1 - (knowledge.embedding <=> query_embedding) AS similarity
        FROM knowledge
        WHERE 1 - (knowledge.embedding <=> query_embedding) > match_threshold
        ORDER BY similarity DESC
        LIMIT match_count;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS match_documents(
        query_embedding VECTOR(384),
        match_threshold FLOAT,
        match_count INT
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "knowledge" DROP COLUMN IF EXISTS "embedding"`,
    );
    await queryRunner.query(`DROP EXTENSION IF EXISTS vector`);
  }
}
