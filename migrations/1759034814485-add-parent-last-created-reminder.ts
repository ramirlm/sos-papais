import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParentLastCreatedReminder1759034814485 implements MigrationInterface {
    name = 'AddParentLastCreatedReminder1759034814485'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" ADD "lastCreatedReminderId" uuid`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "UQ_03e93071addc1284fac6dea4a53" UNIQUE ("lastCreatedReminderId")`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "FK_03e93071addc1284fac6dea4a53" FOREIGN KEY ("lastCreatedReminderId") REFERENCES "reminder"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "FK_03e93071addc1284fac6dea4a53"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "UQ_03e93071addc1284fac6dea4a53"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "lastCreatedReminderId"`);
    }

}
