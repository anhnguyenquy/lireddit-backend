import { Migration } from '@mikro-orm/migrations';

export class Migration20220610105745 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "user" alter column "updated_at" set not null;');
    this.addSql('alter table "user" alter column "username" type text using ("username"::text);');
    this.addSql('alter table "user" alter column "username" set not null;');
    this.addSql('alter table "user" alter column "password" type text using ("password"::text);');
    this.addSql('alter table "user" alter column "password" set not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "user" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "user" alter column "updated_at" drop not null;');
    this.addSql('alter table "user" alter column "username" type text using ("username"::text);');
    this.addSql('alter table "user" alter column "username" drop not null;');
    this.addSql('alter table "user" alter column "password" type text using ("password"::text);');
    this.addSql('alter table "user" alter column "password" drop not null;');
  }

}
