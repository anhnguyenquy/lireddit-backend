import { Migration } from '@mikro-orm/migrations';

export class Migration20220608175137 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" serial primary key, "created_at" date not null, "updated_at" timestamptz(0) not null, "title" text not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "post" cascade;');
  }

}
