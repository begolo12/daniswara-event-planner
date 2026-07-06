const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email || !email.trim()) {
    return { valid: false, message: 'Email wajib diisi' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'Format email tidak valid' };
  }
  return { valid: true, message: '' };
}

export function validateRequired(value, fieldName) {
  if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
    return { valid: false, message: `${fieldName} wajib diisi` };
  }
  return { valid: true, message: '' };
}

export function validateNumber(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} wajib diisi` };
  }
  if (isNaN(Number(value))) {
    return { valid: false, message: `${fieldName} harus berupa angka` };
  }
  return { valid: true, message: '' };
}

export function validateMinLength(value, min, fieldName) {
  if (!value || typeof value !== 'string') {
    return { valid: false, message: `${fieldName} wajib diisi` };
  }
  if (value.trim().length < min) {
    return { valid: false, message: `${fieldName} minimal ${min} karakter` };
  }
  return { valid: true, message: '' };
}
