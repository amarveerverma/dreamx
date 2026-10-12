import crypto from 'crypto';
import { CommissionCalculatorService } from '../src/lib/payments/commission';
import { RazorpayAdapter } from '../src/lib/payments/adapters/razorpay-adapter';
import { StripeAdapter } from '../src/lib/payments/adapters/stripe-adapter';

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${msg}`);
  } else {
    console.error(`  ❌ FAIL: ${msg}`);
    process.exit(1);
  }
}

async function runMilestone2Verification() {
  console.log('====================================================');
  console.log('   MILESTONE 2: PAYMENT PROVIDER & COMMISSION TESTS ');
  console.log('====================================================\n');

  console.log('--- 1. Commission Calculator & GST Formula ---');
  // Test 1: Standard 1-on-1 Service
  const serviceSplit = CommissionCalculatorService.calculatePayoutSplit(1000.00, 'service');
  assert(serviceSplit.grossAmount === 1000.00, 'Gross amount is ₹1,000.00');
  assert(serviceSplit.platformCommission === 200.00, '20% platform fee is exactly ₹200.00');
  assert(serviceSplit.gstAmount === 36.00, '18% GST on platform fee is exactly ₹36.00');
  assert(serviceSplit.netPayoutAmount === 764.00, 'Net mentor payout is exactly ₹764.00');

  // Test 2: Structured Program
  const progSplit = CommissionCalculatorService.calculatePayoutSplit(10000.00, 'program');
  assert(progSplit.grossAmount === 10000.00, 'Program gross is ₹10,000.00');
  assert(progSplit.platformCommission === 1500.00, '15% platform fee is ₹1,500.00');
  assert(progSplit.gstAmount === 270.00, '18% GST on fee is ₹270.00');
  assert(progSplit.netPayoutAmount === 8230.00, 'Net mentor payout for program is ₹8,230.00');

  // Test 3: Hold Duration Logic
  assert(CommissionCalculatorService.getHoldDurationDays('service') === 3, 'Service hold duration is 3 days (72h)');
  assert(CommissionCalculatorService.getHoldDurationDays('program') === 14, 'Program hold duration is 14 days (336h)');

  console.log('\n--- 2. Razorpay Adapter & Signature Verification ---');
  const adapter = new RazorpayAdapter();

  // Test Order Creation
  const orderRes = await adapter.createOrder({
    bookingId: 'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e',
    amount: 1000.00,
    currency: 'INR',
    studentId: 's1s2s3s4-0000-0000-0000-000000000000',
    studentEmail: 'student@dreamx.com',
    description: '1-on-1 Mock Interview'
  });
  assert(!!orderRes.orderId, `Order token created successfully: ${orderRes.orderId}`);
  assert(orderRes.amount === 1000.00, 'Order amount matches requested amount');
  assert(orderRes.checkoutOptions.name.includes('DreamX'), 'Checkout metadata is correctly branded');

  // Test Payment Signature Verification
  const testOrderId = 'order_test_987654';
  const testPaymentId = 'pay_test_123456';
  const testSecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret';

  const validPaymentSig = crypto
    .createHmac('sha256', testSecret)
    .update(`${testOrderId}|${testPaymentId}`)
    .digest('hex');

  const paymentVerified = adapter.verifyPaymentSignature({
    orderId: testOrderId,
    paymentId: testPaymentId,
    signature: validPaymentSig
  });
  assert(paymentVerified === true, 'Valid payment signature verified via HMAC-SHA256');

  const tamperedPaymentVerified = adapter.verifyPaymentSignature({
    orderId: testOrderId,
    paymentId: testPaymentId,
    signature: 'tampered_signature_payload'
  });
  assert(tamperedPaymentVerified === false, 'Tampered payment signature rejected');

  // Test Webhook Signature Verification
  const webhookBody = JSON.stringify({
    event: 'payment.captured',
    payload: { payment: { entity: { id: testPaymentId, order_id: testOrderId } } }
  });
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_webhook_secret';
  const validWebhookSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(webhookBody)
    .digest('hex');

  const webhookVerified = adapter.verifyWebhookSignature(webhookBody, validWebhookSig, webhookSecret);
  assert(webhookVerified === true, 'Valid webhook signature verified via HMAC-SHA256');

  const tamperedWebhookVerified = adapter.verifyWebhookSignature(webhookBody, 'invalid_sig', webhookSecret);
  assert(tamperedWebhookVerified === false, 'Tampered webhook signature rejected');

  console.log('\n--- 3. Stripe Adapter Isolation (Global V2 Stub) ---');
  const stripeAdapter = new StripeAdapter();
  let stripeBlocked = false;
  try {
    await stripeAdapter.createOrder({} as any);
  } catch (err: any) {
    if (err.message.includes('India MVP')) stripeBlocked = true;
  }
  assert(stripeBlocked, 'Stripe adapter cleanly blocked for India MVP scope');

  console.log('\n====================================================');
  console.log('✅ ALL MILESTONE 2 TESTS PASSED PERFECTLY!');
  console.log('====================================================\n');
}

runMilestone2Verification().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
