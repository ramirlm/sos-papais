import { MigrationInterface, QueryRunner } from 'typeorm';

export class ParentsTable1755886883441 implements MigrationInterface {
  name = 'ParentsTable1755886883441';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "parent" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phoneNumber" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "conversationState" character varying, "lastMessage" character varying, "lastChosenOption" character varying, "menuState" character varying, CONSTRAINT "PK_bf93c41ee1ae1649869ebd05617" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "parent"`);
  }
}
