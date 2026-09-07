import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '../lib/stripe.js';
import { useAuth } from '../context/AuthContext.jsx';
import { apiFetch } from '../lib/api.js';
import CheckoutForm from './CheckoutForm.jsx';

const PLANS = {
  Basic: 'basic',
  Pro: 'pro',
};

export default function PaymentPage() {
  const { getToken } = useAuth();
  const [clientSecret, setClientSecret] = useState('');
  const [plan, setPlan] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function startCheckout(selectedPlan) {
    setLoading(true);
    setError('');
    try {
      const { clientSecret } = await apiFetch('/api/payments/create-intent', {
        method: 'POST',
        body: { plan: selectedPlan },
        getToken,
      });
      setPlan(selectedPlan);
      setClientSecret(clientSecret);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Auto-start with the plan chosen during the quiz, if we have one.
  // For this demo, default to Basic on first load.
  useEffect(() => {
    startCheckout('basic');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !clientSecret) return <div className="page-loading">Preparing payment…</div>;

  return (
    <div className="page">
      <h1>Complete your subscription</h1>

      <div className="plan-toggle" role="radiogroup" aria-label="Select plan">
        {Object.entries(PLANS).map(([label, value]) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={plan === value}
            className={`option-btn ${plan === value ? 'selected' : ''}`}
            onClick={() => startCheckout(value)}
            disabled={loading}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="form-error">{error}</p>}

      {clientSecret && (
        <Elements stripe={getStripe()} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
}