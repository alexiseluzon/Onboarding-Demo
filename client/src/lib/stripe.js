import { loadStripe } from '@stripe/stripe-js';

// loadStripe caches internally, but keep a module-level promise
// so we never call it more than once per page load.
let stripePromise;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}