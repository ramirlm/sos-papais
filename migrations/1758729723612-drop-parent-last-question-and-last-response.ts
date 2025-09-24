import { MigrationInterface, QueryRunner } from "typeorm";

export class DropParentLastQuestionAndLastResponse1758729723612 implements MigrationInterface {
    name = 'DropParentLastQuestionAndLastResponse1758729723612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "lastQuestion"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "lastResponse"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" ADD "lastResponse" character varying`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "lastQuestion" character varying`);
    }

}
