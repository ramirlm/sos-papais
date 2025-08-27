import { MigrationInterface, QueryRunner } from "typeorm";

export class ParentCurrentMenuOnDeleteSetNull1756303110351 implements MigrationInterface {
    name = 'ParentCurrentMenuOnDeleteSetNull1756303110351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "FK_230f125532e94e1ab35d9ec7229"`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "FK_230f125532e94e1ab35d9ec7229" FOREIGN KEY ("currentMenuId") REFERENCES "menu"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "FK_230f125532e94e1ab35d9ec7229"`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "FK_230f125532e94e1ab35d9ec7229" FOREIGN KEY ("currentMenuId") REFERENCES "menu"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
