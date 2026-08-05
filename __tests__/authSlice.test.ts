import {formatAuthError} from '../src/redux/slices/authSlice';

describe('formatAuthError', () => {
  it('formats email-already-in-use error', () => {
    const err = {code: 'auth/email-already-in-use', message: 'Firebase: Error (auth/email-already-in-use).'};
    expect(formatAuthError(err)).toBe('This email is already registered. Please log in instead.');
  });

  it('formats invalid-credential error', () => {
    const err = {code: 'auth/invalid-credential', message: 'Firebase: Error (auth/invalid-credential).'};
    expect(formatAuthError(err)).toBe('Invalid email or password. Please verify your details.');
  });

  it('formats user-not-found error', () => {
    const err = {code: 'auth/user-not-found', message: 'Firebase: Error (auth/user-not-found).'};
    expect(formatAuthError(err)).toBe('Invalid email or password. Please verify your details.');
  });

  it('formats network-request-failed error', () => {
    const err = {code: 'auth/network-request-failed', message: 'Firebase: Error (auth/network-request-failed).'};
    expect(formatAuthError(err)).toBe('Network request failed. Please check your internet connection.');
  });
});
