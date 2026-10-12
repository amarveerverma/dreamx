'use client';

import React from 'react';

export interface PayoutScheduleItem {
  id: string;
  booking_id: string;
  gross_amount: number;
  platform_commission: number;
  gst_amount: number;
  net_payout_amount: number;
  currency: string;
  hold_until: string;
  status: 'on_hold' | 'eligible' | 'released' | 'frozen' | 'cancelled';
  frozen: boolean;
  freeze_reason?: string;
  released_at?: string;
  created_at: string;
  service_bookings?: {
    id: string;
    scheduled_start_utc: string;
    service_types?: { name: string };
    profiles?: { full_name: string };
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface PayoutTableProps {
  schedules: PayoutScheduleItem[];
  isAdmin?: boolean;
  onFreeze?: (id: string) => void;
  onForceRelease?: (id: string) => void;
  loadingId?: string | null;
}

export function PayoutTable({
  schedules,
  isAdmin = false,
  onFreeze,
  onForceRelease,
  loadingId,
}: PayoutTableProps) {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="p-8 text-center bg-surface-container-low rounded-xl border border-surface-container-high">
        <span className="material-symbols-outlined text-[36px] text-outline mb-2">account_balance_wallet</span>
        <h4 className="font-title-md text-title-md text-on-surface font-semibold">No Payout Schedules Found</h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          When sessions are booked and paid, funds are held natively and scheduled here.
        </p>
      </div>
    );
  }

  const getStatusBadge = (item: PayoutScheduleItem) => {
    if (item.frozen || item.status === 'frozen') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20">
          <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
          Dispute Frozen
        </span>
      );
    }
    if (item.status === 'released') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary/10 text-secondary border border-secondary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          Released to Bank
        </span>
      );
    }
    if (new Date(item.hold_until) <= new Date()) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          Eligible for Release
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        On Hold (Escrow Buffer)
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-container-high bg-surface-container-lowest shadow-sm">
      <table className="w-full text-left text-sm text-on-surface">
        <thead className="bg-surface-container-low text-xs uppercase font-semibold text-on-surface-variant border-b border-surface-container-high">
          <tr>
            <th className="px-4 py-3">Session &amp; Counterparty</th>
            <th className="px-4 py-3 text-right">Gross</th>
            <th className="px-4 py-3 text-right">20% Fee</th>
            <th className="px-4 py-3 text-right">18% GST</th>
            <th className="px-4 py-3 text-right font-bold text-on-surface">Net Payout</th>
            <th className="px-4 py-3">Hold Release Date</th>
            <th className="px-4 py-3 text-center">Status</th>
            {isAdmin && <th className="px-4 py-3 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-high">
          {schedules.map((item) => {
            const sessionName =
              item.service_bookings?.service_types?.name || '1-on-1 Mentorship';
            const counterparty =
              item.profiles?.full_name ||
              item.service_bookings?.profiles?.full_name ||
              'Verified Student';
            const holdDate = new Date(item.hold_until).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-on-surface">{sessionName}</div>
                  <div className="text-xs text-on-surface-variant">{counterparty}</div>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  ₹{Number(item.gross_amount).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-outline">
                  -₹{Number(item.platform_commission).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-outline">
                  -₹{Number(item.gst_amount).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-primary">
                  ₹{Number(item.net_payout_amount).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-xs text-on-surface-variant">
                  {item.status === 'released' && item.released_at ? (
                    <span className="text-secondary font-medium">
                      Released: {new Date(item.released_at).toLocaleDateString('en-IN')}
                    </span>
                  ) : (
                    <span>Hold Until: {holdDate}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">{getStatusBadge(item)}</td>
                {isAdmin && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {item.status !== 'released' && !item.frozen && onFreeze && (
                        <button
                          onClick={() => onFreeze(item.id)}
                          disabled={loadingId === item.id}
                          className="px-2.5 py-1 rounded bg-error/10 hover:bg-error/20 text-error text-xs font-semibold transition-colors"
                        >
                          Freeze Dispute
                        </button>
                      )}
                      {item.status !== 'released' && onForceRelease && (
                        <button
                          onClick={() => onForceRelease(item.id)}
                          disabled={loadingId === item.id}
                          className="px-2.5 py-1 rounded bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-semibold transition-colors"
                        >
                          Force Release
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
