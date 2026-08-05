/** Lightweight validators used with React Hook Form */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validators = {
  required: (message = 'This field is required') => (value?: string) =>
    value && value.trim().length > 0 ? true : message,

  email: (message = 'Enter a valid email') => (value?: string) =>
    value && EMAIL_REGEX.test(value.trim()) ? true : message,

  minLength:
    (min: number, message?: string) =>
    (value?: string) =>
      value && value.length >= min
        ? true
        : message ?? `Must be at least ${min} characters`,

  password: (message = 'Password must be at least 8 characters') => (value?: string) =>
    value && value.length >= 8 ? true : message,

  match:
    (other: string, message = 'Passwords do not match') =>
    (value?: string) =>
      value === other ? true : message,

  amount: (message = 'Enter a valid amount') => (value?: string) => {
    if (!value) {
      return message;
    }
    const n = Number(value);
    return !Number.isNaN(n) && n > 0 ? true : message;
  },
};
