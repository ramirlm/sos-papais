import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefreshMatchDocuments1756000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
        WHERE (knowledge.embedding <=> query_embedding) < (1 - match_threshold)
        ORDER BY knowledge.embedding <=> query_embedding
        LIMIT match_count;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to similarity-based ORDER BY (functionally similar but less index-friendly)
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
}
