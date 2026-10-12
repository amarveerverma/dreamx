import {
  CreateOrderParams,
  FreezePayoutParams,
  FreezePayoutResult,
  OrderResult,
  PaymentProvider,
  ReleasePayoutParams,
  ReleasePayoutResult,
  VerifyPaymentParams,
} from '../types';

/**
 * Stripe Connect Adapter (Global V2 Expansion Stub)
 * 
 * In India MVP, all transactions utilize Razorpay Route.
 * Stripe Connect is architecturally stubbed to preserve the PaymentProvider interface port
 * for international multi-currency rollout in Phase 11.
 */
export class StripeAdapter implements PaymentProvider {
  public readonly gatewayName = 'stripe' as const;

  public async createOrder(_params: CreateOrderParams): Promise<OrderResult> {
    throw new Error('Stripe Connect is disabled for India MVP. Use RazorpayAdapter for INR transactions.');
  }

  public verifyPaymentSignature(_params: VerifyPaymentParams): boolean {
    throw new Error('Stripe Connect signature verification is not active in India MVP.');
  }

  public verifyWebhookSignature(_rawBody: string, _signature: string, _secret?: string): boolean {
    throw new Error('Stripe Connect webhook verification is not active in India MVP.');
  }

  public async releasePayout(_params: ReleasePayoutParams): Promise<ReleasePayoutResult> {
    throw new Error('Stripe Connect payouts are not active in India MVP.');
  }

  public async freezePayout(_params: FreezePayoutParams): Promise<FreezePayoutResult> {
    throw new Error('Stripe Connect dispute freeze is not active in India MVP.');
  }
}
