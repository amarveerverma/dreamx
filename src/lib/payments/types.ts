export type PaymentGateway = 'razorpay' | 'stripe';

export type BookingType = 'service' | 'program';

export type MembershipTier = 'free' | 'pro' | 'elite';

export interface CreateOrderParams {
  bookingId: string;
  amount: number; // in INR
  currency: string;
  studentId: string;
  studentEmail: string;
  studentPhone?: string;
  description: string;
}

export interface OrderResult {
  orderId: string;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  keyId: string;
  checkoutOptions: {
    name: string;
    description: string;
    prefill: {
      email: string;
      contact?: string;
    };
    theme?: {
      color: string;
    };
  };
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface WebhookEventPayload {
  eventId: string;
  eventType: string;
  gateway: PaymentGateway;
  payload: any;
  orderId?: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
}

export interface CommissionSplit {
  grossAmount: number;
  platformFeePercentage: number;
  platformCommission: number;
  gstRate: number; // 0.18
  gstAmount: number;
  netPayoutAmount: number;
  membershipDiscount: number;
}

export interface ReleasePayoutParams {
  payoutScheduleId: string;
  transferId?: string;
  amount: number;
  currency: string;
}

export interface ReleasePayoutResult {
  success: boolean;
  gatewayTransferId?: string;
  status: 'released' | 'failed';
  error?: string;
}

export interface FreezePayoutParams {
  payoutScheduleId: string;
  reason: string;
}

export interface FreezePayoutResult {
  success: boolean;
  status: 'frozen';
  frozenAt: string;
}

/**
 * Abstract PaymentProvider Interface
 * Direct Gateway Hold-and-Release Architectural Port
 */
export interface PaymentProvider {
  readonly gatewayName: PaymentGateway;

  createOrder(params: CreateOrderParams): Promise<OrderResult>;

  verifyPaymentSignature(params: VerifyPaymentParams): boolean;

  verifyWebhookSignature(rawBody: string, signature: string, secret?: string): boolean;

  releasePayout(params: ReleasePayoutParams): Promise<ReleasePayoutResult>;

  freezePayout(params: FreezePayoutParams): Promise<FreezePayoutResult>;
}
