import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isValid = email.trim().length > 3 && password.length >= 6;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError('');
    try {
      if (mode === 'signin') {
        await signInEmail(email, password);
      } else {
        await signUpEmail(email, password);
      }
      navigate('/quiz');
    } catch (err) {
      setError(mapAuthError(err.code));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setSubmitting(true);
    try {
      await signInGoogle();
      navigate('/quiz');
    } catch (err) {
      setError(mapAuthError(err.code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>{mode === 'signin' ? 'Sign in' : 'Create your account'}</h1>

      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          minLength={6}
          required
        />

        {error && <p role="alert" className="form-error">{error}</p>}

        <button type="submit" disabled={!isValid || submitting} title={mode === 'signin' ? 'Sign in to your account' : 'Create your account'}>
          {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={submitting}
        className="google-btn"
        title="Continue with your Google account"
      >
        Continue with Google
      </button>

      <button
        type="button"
        className="link-btn"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}

export function mapAuthError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    default:
      return 'Something went wrong. Please try again.';
  }
}