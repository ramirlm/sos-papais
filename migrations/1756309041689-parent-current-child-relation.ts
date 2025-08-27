import { MigrationInterface, QueryRunner } from 'typeorm';

export class ParentCurrentChildRelation1756309041689
  implements MigrationInterface
{
  name = 'ParentCurrentChildRelation1756309041689';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "parent" ADD "currentChildId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "parent" ADD CONSTRAINT "UQ_c4eeb202b11ebb5226b08b353e3" UNIQUE ("currentChildId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "parent" ADD CONSTRAINT "FK_c4eeb202b11ebb5226b08b353e3" FOREIGN KEY ("currentChildId") REFERENCES "child"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parent" DROP CONSTRAINT "FK_c4eeb202b11ebb5226b08b353e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parent" DROP CONSTRAINT "UQ_c4eeb202b11ebb5226b08b353e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parent" DROP COLUMN "currentChildId"`,
    );
  }
}
