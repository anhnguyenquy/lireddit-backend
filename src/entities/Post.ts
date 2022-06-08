import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Post {
  @PrimaryKey()
  id!: number

  @Property()
  createdAt: Date

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date

  @Property({ type: 'text' })
  title!: string
}