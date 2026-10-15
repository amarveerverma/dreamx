'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function StudentMembershipPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (data) setProfile(data);
        }
      } catch (err) {
        console.error('Error loading membership:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUpgrade = async (tier: 'pro' | 'elite') => {
    try {
      setUpgradingTier(tier);
      const res = await fetch('/api/v1/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: 'membership',
          tier,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate checkout');
      alert(`Razorpay checkout initiated for ${tier.toUpperCase()} tier! Order ID: ${data.order_id || 'DEMO-MEMBER-ORDER'}`);
    } catch (err: any) {
      alert(err.message || 'Error initiating checkout');
    } finally {
      setUpgradingTier(null);
    }
  };

  const currentTier = profile?.membership_tier || 'free';

  if (loading) {
    return (
      <div className="py-6 space-y-6 max-w-6xl mx-auto">
        <div className="h-8 bg-surface-container-high rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-surface-container-high rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-surface-container-high/60">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-tertiary">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-on-surface font-semibold">Membership & Billing</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            DreamX Membership Passes
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Unlock priority Smart Matching, monthly AI credits, and exclusive fellowship cohort discounts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-tertiary">Current Tier:</span>
          <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-xs font-bold uppercase">
            {currentTier} Pass
          </span>
        </div>
      </div>

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Free */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <span className="font-label-md text-label-md font-semibold text-tertiary uppercase tracking-wider">
              Free Pass
            </span>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-lg text-3xl font-bold text-on-surface">₹0</span>
                <span className="text-xs text-tertiary">/ lifetime</span>
              </div>
              <p className="text-xs text-tertiary mt-1">Foundational access for every student</p>
            </div>
            <ul className="space-y-2.5 pt-4 border-t border-surface-container-high/60 text-xs text-on-surface">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                <span>Standard Smart Match broadcasts</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                <span>15 monthly AI credits</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                <span>10-stage Career Journey roadmap</span>
              </li>
              <li className="flex items-center gap-2 text-tertiary">
                <span className="material-symbols-outlined text-[16px]">close</span>
                <span>Priority offer matching</span>
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <button
              disabled={currentTier === 'free'}
              className="w-full py-2.5 rounded-xl bg-surface-container-low text-tertiary font-label-md text-xs font-semibold cursor-not-allowed"
            >
              {currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
            </button>
          </div>
        </div>

        {/* Tier 2: Pro */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border-2 border-primary flex flex-col justify-between shadow-md relative">
          <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
            Most Popular
          </span>
          <div className="space-y-4">
            <span className="font-label-md text-label-md font-semibold text-primary uppercase tracking-wider">
              Pro Pass
            </span>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-lg text-3xl font-bold text-on-surface">₹149</span>
                <span className="text-xs text-tertiary">/ month</span>
              </div>
              <p className="text-xs text-tertiary mt-1">Accelerate interviews & placement</p>
            </div>
            <ul className="space-y-2.5 pt-4 border-t border-surface-container-high/60 text-xs text-on-surface">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                <span><strong>100 monthly AI credits</strong> for resume & STAR prep</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                <span>Priority match routing (2x faster mentor offers)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                <span>15% discount on all 1:1 service bookings</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                <span>Verifiable DreamX PRO placement badge</span>
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <button
              type="button"
              onClick={() => handleUpgrade('pro')}
              disabled={currentTier === 'pro' || upgradingTier === 'pro'}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50"
            >
              {currentTier === 'pro' ? 'Current Active Tier' : upgradingTier === 'pro' ? 'Processing...' : 'Upgrade to Pro (₹149)'}
            </button>
          </div>
        </div>

        {/* Tier 3: Elite */}
        <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high flex flex-col justify-between shadow-xs">
          <div className="space-y-4">
            <span className="font-label-md text-label-md font-semibold text-secondary uppercase tracking-wider">
              Elite Pass
            </span>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-lg text-3xl font-bold text-on-surface">₹299</span>
                <span className="text-xs text-tertiary">/ month</span>
              </div>
              <p className="text-xs text-tertiary mt-1">Guaranteed placement coaching & fellowships</p>
            </div>
            <ul className="space-y-2.5 pt-4 border-t border-surface-container-high/60 text-xs text-on-surface">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                <span><strong>Unlimited AI credits</strong> & instant resume tailoring</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                <span>1 free monthly 1:1 mentor check-in included</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                <span>25% discount on Structured Fellowship cohorts</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                <span>Direct referral access to DreamX recruiter network</span>
              </li>
            </ul>
          </div>
          <div className="pt-6">
            <button
              type="button"
              onClick={() => handleUpgrade('elite')}
              disabled={currentTier === 'elite' || upgradingTier === 'elite'}
              className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-xs font-semibold hover:bg-secondary-container shadow-sm transition-all disabled:opacity-50"
            >
              {currentTier === 'elite' ? 'Current Active Tier' : upgradingTier === 'elite' ? 'Processing...' : 'Upgrade to Elite (₹299)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
