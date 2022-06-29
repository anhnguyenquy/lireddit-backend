import { FieldError } from '../interfaces'
import { isValidEmail } from '.'

export const validateRegister = (email: string, username: string, password: string): FieldError[] | null => {
  if (!isValidEmail(email)) {
    return [{
      field: 'email',
      message: 'Invalid email.'
    }]
  }
  if (username.length <= 2) {
    return [{
      field: 'username',
      message: 'Username must be longer than 2 characters.'
    }]
  }
  if (username.length > 32) {
    return [{
      field: 'username',
      message: 'Username must not be longer than 32 characters.'
    }]
  }
  if (!/^[A-Za-z0-9_-]*$/.test(username)) {
    return [{
      field: 'username',
      message: 'Username must only contain letters, numbers, underscores and dashes.'
    }]
  }
  if (password.length < 8) {
    return [{
      field: 'password',
      message: 'Password must be at least 8 characters.'
    }]
  }
  if (password.length > 128) {
    return [{
      field: 'password',
      message: 'Password must not be longer than 128 characters.'
    }]
  }
  return null
}