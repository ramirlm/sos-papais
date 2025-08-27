import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateParentMenuRelation1756232115824 implements MigrationInterface {
    name = 'UpdateParentMenuRelation1756232115824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" RENAME COLUMN "menuState" TO "currentMenuId"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "currentMenuId"`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "currentMenuId" integer`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "FK_230f125532e94e1ab35d9ec7229" FOREIGN KEY ("currentMenuId") REFERENCES "menu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "FK_230f125532e94e1ab35d9ec7229"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "currentMenuId"`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "currentMenuId" character varying`);
        await queryRunner.query(`ALTER TABLE "parent" RENAME COLUMN "currentMenuId" TO "menuState"`);
    }

}
