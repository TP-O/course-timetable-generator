import { Match } from '@/utils/validator'
import { SignInPayload } from './sign-up'

export class SignUpPayload extends SignInPayload {
  @Match('password', {
    message: 'Password does not match',
  })
  passwordConfirm: string
}
