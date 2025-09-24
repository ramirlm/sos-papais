import { MigrationInterface, QueryRunner } from "typeorm";

export class DropParentLastChosenField1758729338079 implements MigrationInterface {
    name = 'DropParentLastChosenField1758729338079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "FK_628e71ebd41b7811f85d93d7b72"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "UQ_628e71ebd41b7811f85d93d7b72"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "lastChosenOptionId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" ADD "lastChosenOptionId" integer`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "UQ_628e71ebd41b7811f85d93d7b72" UNIQUE ("lastChosenOptionId")`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "FK_628e71ebd41b7811f85d93d7b72" FOREIGN KEY ("lastChosenOptionId") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
