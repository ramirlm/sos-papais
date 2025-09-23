import { MigrationInterface, QueryRunner } from "typeorm";

export class ParentLastUsedKnowledgeRelation1758649048492 implements MigrationInterface {
    name = 'ParentLastUsedKnowledgeRelation1758649048492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" ADD "lastUsedKnowledgeId" uuid`);
        await queryRunner.query(`ALTER TABLE "parent" ADD CONSTRAINT "FK_710a0611650ac8c9360687c460c" FOREIGN KEY ("lastUsedKnowledgeId") REFERENCES "knowledge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent" DROP CONSTRAINT "FK_710a0611650ac8c9360687c460c"`);
        await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "lastUsedKnowledgeId"`);
    }

}
