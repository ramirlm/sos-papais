import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParentLastChosenOptionField1758729379941 implements MigrationInterface {
    name = 'AddParentLastChosenOptionField1758729379941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" ADD "lastChosenOptionId" integer`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "FK_628e71ebd41b7811f85d93d7b72" FOREIGN KEY ("lastChosenOptionId") REFERENCES "option"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "FK_628e71ebd41b7811f85d93d7b72"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "lastChosenOptionId"`);
    }

}
