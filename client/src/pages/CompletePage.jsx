import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';

const POLL_INTERVAL_MS = 1500;
const MAX_POLLS = 8; // ~12 seconds total, covers normal webhook delivery lag

export default function CompletePage() {
  const { getToken } = useAuth();
  const [searchParams] = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');

  const [status, setStatus] = useState('checking'); // 'checking' | 'succeeded' | 'failed' | 'pending' | 'error'

  useEffect(() => {
    if (!paymentIntent) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    let pollCount = 0;

    async function poll() {
      try {
        const { status: dbStatus } = await apiFetch(
          `/api/payments/status?intent=${encodeURIComponent(paymentIntent)}`,
          { getToken }
        );

        if (cancelled) return;

        if (dbStatus === 'succeeded' || dbStatus === 'failed') {
          setStatus(dbStatus);
          return;
        }

        // Still "pending" — webhook hasn't landed yet, keep polling briefly
        pollCount += 1;
        if (pollCount >= MAX_POLLS) {
          setStatus('pending'); // give up waiting, show a non-alarming "still processing" state
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    poll();
    return () => { cancelled = true; };
  }, [paymentIntent, getToken]);

  return (
    <div className="page">
      {status === 'checking' && (
        <>
          <h1>Confirming your payment…</h1>
          <p>This usually takes just a few seconds.</p>
        </>
      )}

      {status === 'succeeded' && (
        <>
          <h1>You're all set!</h1>
          <p>Your payment was successful and your onboarding is complete.</p>
        </>
      )}

      {status === 'pending' && (
        <>
          <h1>Still processing…</h1>
          <p>Your payment is being confirmed. This page will update automatically — feel free to check back in a minute.</p>
        </>
      )}

      {status === 'failed' && (
        <>
          <h1>Payment didn't go through</h1>
          <p>Please try again or use a different payment method.</p>
        </>
      )}

      {status === 'error' && (
        <>
          <h1>Something went wrong</h1>
          <p>We couldn't confirm your payment status. Please contact support if this persists.</p>
        </>
      )}
    </div>
  );
}