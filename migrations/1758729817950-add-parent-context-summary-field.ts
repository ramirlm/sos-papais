import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParentContextSummaryField1758729817950 implements MigrationInterface {
    name = 'AddParentContextSummaryField1758729817950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" ADD "contextSummary" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "contextSummary"`);
    }

}
