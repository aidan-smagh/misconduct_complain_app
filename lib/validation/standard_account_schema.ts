import * as Yup from 'yup';
import { isValidEmail, isValidPassord, isValidUsername } from './validation_rules';

export const VALIDATION_SCHEMA = Yup.object({
  identifier: Yup.string()
    .required("Required")
    .test(
      'username-or-email',
      function (value) {
        const { path, createError } = this;
        
        value = value.trim();

        if (!value) {
          return createError({ path, message: 'Required' });
        }

        if (value.includes('@')) {
          // Validate as email
          if (!isValidEmail(value)) {
            return createError({ path, message: 'Must be a valid email address' });
          }
        } else {
          // Validate as username
          if (!isValidUsername(value)) {
            return createError({ path, message: 'Username can only contain letters, numbers, and underscores' });
          }
        }

        return true;
      }
    ),
  password: Yup.string()
    .required('Required')
    .test('password', "Password must be at least 15 characters in length", isValidPassord)
}).noUnknown();
