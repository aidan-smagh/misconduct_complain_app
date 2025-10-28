import * as Yup from 'yup';

// Returns true if the URL is a relative path starting with a single '/'
export function isValidRedirect(url) {
  try {
    return typeof url === 'string' && url.startsWith('/') && !url.startsWith('//');
  } catch {
    return false;
  }
}

export function isValidEmail(value: string) {
  return Yup.string().email().isValidSync(value);
}

export function isValidUsername(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  if (trimmed.length > 32) {
    return false;
  }

  return /^[a-zA-Z0-9_]+$/.test(value);
}

// Checks that the password satisfies the following requirements:
// Is at least 15 characters
export function isValidPassord(password: string): boolean {
  password = password.trim();

  if (password.length < 15) {
    return false;
  }

  return true;
}

const urlValidator = Yup.string().url().required();

export function isUrlValid(url) {
  return urlValidator.isValidSync(url);
}