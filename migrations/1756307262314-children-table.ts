import { MigrationInterface, QueryRunner } from "typeorm";

export class ChildrenTable1756307262314 implements MigrationInterface {
    name = 'ChildrenTable1756307262314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "child" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "birthDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL, "parentId" uuid, CONSTRAINT "PK_4609b9b323ca37c6bc435ec4b6b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "child" ADD CONSTRAINT "FK_8a2f35051e01ce9c6656af13c7c" FOREIGN KEY ("parentId") REFERENCES "parent"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "child" DROP CONSTRAINT "FK_8a2f35051e01ce9c6656af13c7c"`);
        await queryRunner.query(`DROP TABLE "child"`);
    }

}
