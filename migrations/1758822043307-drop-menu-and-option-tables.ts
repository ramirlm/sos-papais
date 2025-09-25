import { MigrationInterface, QueryRunner } from "typeorm";

export class DropMenuAndOptionTables1758822043307 implements MigrationInterface {
    name = 'DropMenuAndOptionTables1758822043307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "FK_230f125532e94e1ab35d9ec7229"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "FK_628e71ebd41b7811f85d93d7b72"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "conversationState"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "lastChosenOptionId"`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "lastChosenOptionId" character varying`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "currentMenuId"`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "currentMenuId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "currentMenuId"`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "currentMenuId" integer`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "lastChosenOptionId"`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "lastChosenOptionId" integer`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "conversationState" character varying`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "FK_628e71ebd41b7811f85d93d7b72" FOREIGN KEY ("lastChosenOptionId") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "FK_230f125532e94e1ab35d9ec7229" FOREIGN KEY ("currentMenuId") REFERENCES "menu"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
