import { InputType, Field } from 'type-graphql'

@InputType()
export class LoginInputs {
  @Field()
  emailOrUsername: string

  @Field()
  password: string
}