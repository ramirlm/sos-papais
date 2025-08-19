import { MigrationInterface, QueryRunner } from "typeorm";

export class KnowledgesTable1755623971162 implements MigrationInterface {
    name = 'KnowledgesTable1755623971162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "knowledge" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, CONSTRAINT "PK_4159ba98b65a20a8d1f257bc514" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "knowledge"`);
    }

}
