import { mapAuthError } from '../LoginPage.jsx';

describe('mapAuthError', () => {
  it('maps wrong password / user not found to a generic credential error', () => {
    expect(mapAuthError('auth/wrong-password')).toMatch(/incorrect email or password/i);
    expect(mapAuthError('auth/user-not-found')).toMatch(/incorrect email or password/i);
  });

  it('maps email-already-in-use', () => {
    expect(mapAuthError('auth/email-already-in-use')).toMatch(/already exists/i);
  });

  it('maps weak-password', () => {
    expect(mapAuthError('auth/weak-password')).toMatch(/at least 6 characters/i);
  });

  it('falls back to a generic message for unknown codes', () => {
    expect(mapAuthError('auth/some-unknown-code')).toMatch(/something went wrong/i);
  });
});