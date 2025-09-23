import { MigrationInterface, QueryRunner } from "typeorm";

export class DropParentLastChoseOptionRelation1758652310639 implements MigrationInterface {
    name = 'DropParentLastChoseOptionRelation1758652310639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "FK_628e71ebd41b7811f85d93d7b72"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "UQ_628e71ebd41b7811f85d93d7b72"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "lastChosenOptionId"`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "lastChosenOptionId" integer`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "FK_628e71ebd41b7811f85d93d7b72" FOREIGN KEY ("lastChosenOptionId") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "FK_628e71ebd41b7811f85d93d7b72"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "lastChosenOptionId"`);
        await queryRunner.query(`ALTER TABLE "parent" ADD "lastChosenOptionId" integer`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "UQ_628e71ebd41b7811f85d93d7b72" UNIQUE ("lastChosenOptionId")`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "FK_628e71ebd41b7811f85d93d7b72" FOREIGN KEY ("lastChosenOptionId") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
