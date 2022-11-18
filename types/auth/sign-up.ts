import { IsEmail, MinLength } from 'class-validator'

export class SignInPayload {
  @IsEmail(
    {},
    {
      message: 'Email is invalid',
    }
  )
  email: string

  @MinLength(6, {
    message: 'Password must be longer than or equal to 6 characters',
  })
  password: string
}
