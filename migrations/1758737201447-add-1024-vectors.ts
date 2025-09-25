import { MigrationInterface, QueryRunner } from 'typeorm';

export class Add1024Vectors1758737201447 implements MigrationInterface {
  name = 'Add1024Vectors1758737201447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove função antiga (se existir)
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS match_documents(
        query_embedding VECTOR(1024),
        match_threshold FLOAT,
        match_count INT
      )
    `);

    // Remove coluna antiga (se existir)
    await queryRunner.query(
      `ALTER TABLE "knowledge" DROP COLUMN IF EXISTS "embedding"`
    );

    // Garante que a extensão vector está ativa
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // Adiciona coluna de embeddings 1024
    await queryRunner.query(`
      ALTER TABLE "knowledge"
      ADD COLUMN "embedding" VECTOR(1024)
    `);

    // Cria a função de busca semântica
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION match_documents (
        query_embedding VECTOR(1024),
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
          k.id,
          k.content::TEXT,
          1 - (k.embedding <=> query_embedding) AS similarity
        FROM knowledge k
        WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
        ORDER BY similarity DESC
        LIMIT match_count;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove função
    await queryRunner.query(`
      DROP FUNCTION IF EXISTS match_documents(
        query_embedding VECTOR(1024),
        match_threshold FLOAT,
        match_count INT
      )
    `);

    // Remove coluna de embeddings
    await queryRunner.query(`
      ALTER TABLE "knowledge" DROP COLUMN IF EXISTS "embedding"
    `);

    // Se antes você usava 384 dims (por ex. bge-small), pode restaurar aqui:
    await queryRunner.query(`
      ALTER TABLE "knowledge"
      ADD COLUMN "embedding" VECTOR(384)
    `);

    // Função com 384 dims (rollback)
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
          k.id,
          k.content::TEXT,
          1 - (k.embedding <=> query_embedding) AS similarity
        FROM knowledge k
        WHERE 1 - (k.embedding <=> query_embedding) > match_threshold
        ORDER BY similarity DESC
        LIMIT match_count;
      END;
      $$;
    `);
  }
}
