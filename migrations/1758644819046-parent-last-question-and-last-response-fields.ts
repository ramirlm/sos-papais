import { MigrationInterface, QueryRunner } from "typeorm";

export class ParentLastQuestionAndLastResponseFields1758644819046 implements MigrationInterface {
    name = 'ParentLastQuestionAndLastResponseFields1758644819046'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" ADD "lastQuestion" character varying`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "lastResponse" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "lastResponse"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "lastQuestion"`);
    }

}
