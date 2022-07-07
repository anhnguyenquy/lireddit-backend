import { __prod__ } from '../constants'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAdmin1657118293857 implements MigrationInterface {
  name = 'CreateAdmin1657118293857'

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      await queryRunner.query(`
        INSERT INTO "user" ("username", "email", "password") VALUES ('admin', 'anhnguyenquy2407@gmail.com', '$argon2i$v=19$m=4096,t=3,p=1$ScMY8rqjyJpYLaPhaREnSQ$iucuSi7lqtbppaXpmwwzYgAxmCi2LBaKj/Vj8WP1ROo')
      `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!__prod__) {
      await queryRunner.query(`
        DELETE FROM "user" WHERE "username" = 'admin'
      `)
    }
  }

}