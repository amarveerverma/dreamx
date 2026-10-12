import { PaymentGateway, PaymentProvider } from './types';
import { RazorpayAdapter } from './adapters/razorpay-adapter';
import { StripeAdapter } from './adapters/stripe-adapter';

export * from './types';
export * from './commission';
export * from './adapters/razorpay-adapter';
export * from './adapters/stripe-adapter';

const razorpayAdapterInstance = new RazorpayAdapter();
const stripeAdapterInstance = new StripeAdapter();

export function getPaymentProvider(gateway: PaymentGateway = 'razorpay'): PaymentProvider {
  if (gateway === 'stripe') {
    if (process.env.FLAG_STRIPE_ENABLED === 'true') {
      return stripeAdapterInstance;
    }
    throw new Error('Stripe gateway is currently disabled. Active gateway is Razorpay.');
  }
  return razorpayAdapterInstance;
}
