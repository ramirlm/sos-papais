import { MigrationInterface, QueryRunner } from 'typeorm';

export class ParentsNameField1755887236822 implements MigrationInterface {
  name = 'ParentsNameField1755887236822';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parent" ADD "name" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "parent" DROP COLUMN "name"`);
  }
}
