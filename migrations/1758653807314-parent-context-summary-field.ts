import { MigrationInterface, QueryRunner } from "typeorm";

export class ParentContextSummaryField1758653807314 implements MigrationInterface {
    name = 'ParentContextSummaryField1758653807314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" ADD "contextSummary" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "contextSummary"`);
    }

}
