import { isValidEmail } from '.'
import { FieldError } from '../interfaces'

interface LoginValidation {
  input: 'Email' | 'Username'
  errors: FieldError[] | null
}

export const validateLogin = (emailOrUsername: string, password: string): LoginValidation => {
  let input: 'Username' | 'Email'
  if (emailOrUsername.includes('@')) { // email provided 
    input = 'Email'
    if (!isValidEmail(emailOrUsername)) {
      return {
        input,
        errors: [{
          field: 'emailOrUsername',
          message: 'Invalid email.'
        }]
      }
    }
  }
  else {                               // username provided
    input = 'Username'
    if (emailOrUsername.length <= 2) {
      return {
        input,
        errors: [{
          field: 'emailOrUsername',
          message: 'Username must be longer than 2 characters.'
        }]
      }
    }
    if (emailOrUsername.length > 32) {
      return {
        input,
        errors: [{
          field: 'emailOrUsername',
          message: 'Username must not be longer than 32 characters.'
        }]
      }
    }
    if (!/^[A-Za-z0-9_-]*$/.test(emailOrUsername)) {
      return {
        input,
        errors: [{
          field: 'emailOrUsername',
          message: 'Username must only contain letters, numbers, underscores and dashes.'
        }]
      }
    }
  }
  if (password.length < 8) {
    return {
      input,
      errors: [{
        field: 'password',
        message: 'Password must be at least 8 characters.'
      }]
    }
  }
  if (password.length > 128) {
    return {
      input,
      errors: [{
        field: 'password',
        message: 'Password must not be longer than 128 characters.'
      }]
    }
  }
  return {
    input,
    errors: null
  }
}