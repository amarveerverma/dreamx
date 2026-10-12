'use client';

import React, { useEffect, useState } from 'react';
import { PayoutTable, PayoutScheduleItem } from '@/components/payments/PayoutTable';

export default function MentorEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    total_earnings: 0,
    on_hold_amount: 0,
    released_amount: 0,
    currency: 'INR',
  });
  const [schedules, setSchedules] = useState<PayoutScheduleItem[]>([]);

  const loadEarnings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/payments/earnings');
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load earnings');
      }
      setSummary(json.data.summary);
      setSchedules(json.data.schedules);
    } catch (err: any) {
      setError(err.message || 'Error loading earnings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
              Direct Gateway Hold Model
            </span>
            <span className="text-xs text-outline">• Razorpay Route</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Earnings &amp; Payouts</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Track your session earnings, 72-hour escrow release schedules, and direct bank payouts.
          </p>
        </div>
        <button
          onClick={loadEarnings}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container-high text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Available / Released */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-sm font-semibold">Released to Bank</span>
            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-mono text-secondary">
            ₹{summary.released_amount.toFixed(2)}
          </div>
          <p className="text-xs text-outline">Transferred directly to your bank account / UPI</p>
        </div>

        {/* Card 2: On-Hold Buffer */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-sm font-semibold">Held in Escrow (T+3 / T+14)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">lock_clock</span>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-mono text-amber-600">
            ₹{summary.on_hold_amount.toFixed(2)}
          </div>
          <p className="text-xs text-outline">Held natively at gateway pending dispute window</p>
        </div>

        {/* Card 3: Total Lifetime */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-sm font-semibold">Total Net Earnings</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold font-mono text-primary">
            ₹{summary.total_earnings.toFixed(2)}
          </div>
          <p className="text-xs text-outline">Gross earnings minus 20% platform fee and 18% GST</p>
        </div>
      </div>

      {/* Transparency Note */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high flex items-start gap-3 text-xs text-on-surface-variant">
        <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">verified</span>
        <div>
          <span className="font-semibold text-on-surface">Transparent 80/20 Marketplace Split: </span>
          You receive 80% of catalog pricing. The platform commission is 20% with 18% GST itemized. If students apply membership discounts, the platform absorbs the discount so your net earnings remain invariant.
        </div>
      </div>

      {/* Payout Schedule Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">Payout Schedules &amp; Transfer History</h2>
          <span className="text-xs text-outline">{schedules.length} Scheduled Transfers</span>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center bg-surface-container-low rounded-xl">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-on-surface-variant">Loading payout schedules...</p>
          </div>
        ) : (
          <PayoutTable schedules={schedules} />
        )}
      </div>
    </div>
  );
}
