'use client';

import React, { useState } from 'react';
import Script from 'next/script';

interface CheckoutModalProps {
  bookingId: string;
  grossAmount: number;
  netAmount: number;
  discountAmount?: number;
  serviceTitle: string;
  mentorName: string;
  currency?: string;
  onSuccess?: (booking: any) => void;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function CheckoutModal({
  bookingId,
  grossAmount,
  netAmount,
  discountAmount = 0,
  serviceTitle,
  mentorName,
  currency = 'INR',
  onSuccess,
  onClose,
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setStatusMessage('Initiating secure escrow checkout session...');

    try {
      // 1. Create order token from backend
      const res = await fetch('/api/v1/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to initiate checkout session');
      }

      const { order_id, key_id, amount, checkout_options } = json.data;

      // 2. Launch Razorpay Checkout Modal
      if (typeof window.Razorpay === 'function') {
        const rzp = new window.Razorpay({
          key: key_id,
          amount: Math.round(amount * 100),
          currency: currency,
          name: checkout_options.name || 'DreamX Career Marketplace',
          description: checkout_options.description || serviceTitle,
          order_id: order_id,
          prefill: checkout_options.prefill,
          theme: checkout_options.theme || { color: '#6366F1' },
          handler: async (response: any) => {
            setStatusMessage('Verifying cryptographic signature and holding escrow...');
            try {
              // 3. Verify payment signature on backend
              const verifyRes = await fetch('/api/v1/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  booking_id: bookingId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyJson = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(verifyJson.error || 'Payment signature verification failed');
              }

              setStatusMessage('Payment verified! Booking confirmed.');
              if (onSuccess) {
                onSuccess(verifyJson.data.booking);
              } else {
                window.location.href = '/dashboard/student/bookings';
              }
            } catch (err: any) {
              setError(err.message || 'Signature verification failed');
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setStatusMessage(null);
            },
          },
        });

        rzp.on('payment.failed', (resp: any) => {
          setError(resp.error?.description || 'Payment was declined by bank');
          setLoading(false);
        });

        rzp.open();
      } else {
        // Fallback for simulation / testing when external Razorpay script is not rendered
        setStatusMessage('Simulating secure sandbox verification...');
        setTimeout(async () => {
          try {
            const verifyRes = await fetch('/api/v1/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                booking_id: bookingId,
                razorpay_order_id: order_id,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: 'sandbox_simulation_sig',
              }),
            });
            const verifyJson = await verifyRes.json();
            if (verifyRes.ok && onSuccess) {
              onSuccess(verifyJson.data.booking);
            } else {
              window.location.href = '/dashboard/student/bookings';
            }
          } catch (err: any) {
            setError(err.message || 'Verification failed');
            setLoading(false);
          }
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
      setLoading(false);
      setStatusMessage(null);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">lock</span>
              </div>
              <div>
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold">Escrow Checkout</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">PCI-DSS Direct Gateway Hold</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Session Summary Card */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-title-md text-title-md text-on-surface font-semibold">{serviceTitle}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">With Mentor: {mentorName}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  15m Lock Active
                </span>
              </div>
              <div className="pt-2 border-t border-surface-container flex items-center gap-2 text-xs text-tertiary">
                <span className="material-symbols-outlined text-[15px] text-secondary">verified_user</span>
                <span>Funds held in native gateway escrow until 72h post-delivery</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 font-body-md text-body-md">
              <div className="flex justify-between text-on-surface-variant">
                <span>Standard Price</span>
                <span>₹{grossAmount.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-secondary font-medium">
                  <span>Membership Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-surface-container flex justify-between font-title-lg text-title-lg text-on-surface font-bold">
                <span>Total Amount</span>
                <span className="text-primary font-metric-num">₹{netAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Status & Error Messages */}
            {statusMessage && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <span>{statusMessage}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                  <span>Pay with UPI / Cards (₹{netAmount.toFixed(2)})</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-outline">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">shield</span> Razorpay Route
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span> 256-bit Encrypted
              </span>
              <span>•</span>
              <span>RBI 2FA Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
