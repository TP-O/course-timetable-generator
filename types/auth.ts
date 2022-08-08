import { Match } from '@/utils'
import { IsEmail, MinLength } from 'class-validator'

export class SignInPayload {
  @IsEmail()
  email: string

  @MinLength(6)
  password: string
}

export class SignUpPayload extends SignInPayload {
  @Match('password', { message: 'Password does not match' })
  passwordConfirm: string
}
