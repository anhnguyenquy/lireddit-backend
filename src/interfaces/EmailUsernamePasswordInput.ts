import { InputType, Field } from 'type-graphql'

@InputType() // InputType is for input arguments
export class EmailUsernamePasswordInput {
  @Field() // here () => String is automatically inferred
  email: string

  @Field()
  username: string

  @Field()
  password: string
}