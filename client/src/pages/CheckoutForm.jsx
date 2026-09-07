import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    setError('');

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/quiz/complete`,
      },
    });

    // confirmPayment only returns if there's an immediate error
    // (e.g. card declined). Success triggers a redirect to return_url.
    if (confirmError) {
      setError(confirmError.message || 'Payment failed. Please check your details and try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      {error && <p role="alert" className="form-error">{error}</p>}

      <button
        type="submit"
        disabled={!stripe || submitting}
        title="Complete your payment"
      >
        {submitting ? 'Processing…' : 'Confirm and pay'}
      </button>

      <button
        type="button"
        className="link-btn"
        onClick={() => navigate('/quiz')}
        disabled={submitting}
      >
        Back to quiz
      </button>
    </form>
  );
}