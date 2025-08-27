import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateParentCurrentMenuField1756230091356 implements MigrationInterface {
    name = 'UpdateParentCurrentMenuField1756230091356'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "menuState"`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "menuState" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "menuState"`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "menuState" character varying`);
    }

}
