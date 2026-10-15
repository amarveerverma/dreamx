'use client';

import React, { useEffect, useState } from 'react';
import { PayoutTable, PayoutScheduleItem } from '@/components/payments/PayoutTable';
import { AdminShell } from '@/components/layout/AdminShell';

interface PayoutLogItem {
  id: string;
  payout_schedule_id: string;
  event_type: string;
  gateway_event_id?: string;
  payload: any;
  created_at: string;
}

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [sweepLoading, setSweepLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<PayoutScheduleItem[]>([]);
  const [logs, setLogs] = useState<PayoutLogItem[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/admin/payouts');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load payout schedules');
      setSchedules(json.data.schedules);
      setLogs(json.data.logs);
    } catch (err: any) {
      setError(err.message || 'Error loading admin payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSweep = async () => {
    setSweepLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/v1/admin/payouts', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Sweep failed');
      setStatusMessage(json.message);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to trigger sweep');
    } finally {
      setSweepLoading(false);
    }
  };

  const handleFreeze = async (scheduleId: string) => {
    setActionLoadingId(scheduleId);
    try {
      const res = await fetch(`/api/v1/admin/payouts/${scheduleId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'freeze', reason: 'Admin dispute investigation' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to freeze schedule');
      setStatusMessage('Schedule frozen successfully.');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleForceRelease = async (scheduleId: string) => {
    setActionLoadingId(scheduleId);
    try {
      const res = await fetch(`/api/v1/admin/payouts/${scheduleId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'force_release' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to force-release schedule');
      setStatusMessage('Schedule force-released successfully.');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Aggregated KPIs
  let totalGross = 0;
  let totalPlatformCommission = 0;
  let totalGst = 0;
  let totalHeld = 0;
  let frozenCount = 0;

  for (const item of schedules) {
    totalGross += Number(item.gross_amount);
    totalPlatformCommission += Number(item.platform_commission);
    totalGst += Number(item.gst_amount);
    if (item.status === 'on_hold') {
      totalHeld += Number(item.net_payout_amount);
    }
    if (item.frozen) {
      frozenCount++;
    }
  }

  return (
    <AdminShell>
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Admin Financial Console
            </span>
            <span className="text-xs text-outline">• Zero Internal Fund Custody</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Payments &amp; Gateway Payouts</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Audit Direct Gateway Hold release schedules, trigger the sweep worker, and manage dispute freezes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container-high text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Refresh</span>
          </button>

          <button
            onClick={handleSweep}
            disabled={sweepLoading}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            {sweepLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            )}
            <span>Trigger Payout Sweep</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm">
          <div className="text-xs font-semibold text-on-surface-variant">Total Gross Volume</div>
          <div className="text-xl md:text-2xl font-bold font-mono text-on-surface mt-1">
            ₹{totalGross.toFixed(2)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm">
          <div className="text-xs font-semibold text-on-surface-variant">Platform Fee (20%)</div>
          <div className="text-xl md:text-2xl font-bold font-mono text-primary mt-1">
            ₹{totalPlatformCommission.toFixed(2)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm">
          <div className="text-xs font-semibold text-on-surface-variant">GST on Fee (18%)</div>
          <div className="text-xl md:text-2xl font-bold font-mono text-secondary mt-1">
            ₹{totalGst.toFixed(2)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm">
          <div className="text-xs font-semibold text-on-surface-variant">Held in Gateway (T+3)</div>
          <div className="text-xl md:text-2xl font-bold font-mono text-amber-600 mt-1">
            ₹{totalHeld.toFixed(2)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-surface-container-high shadow-sm col-span-2 md:col-span-1">
          <div className="text-xs font-semibold text-on-surface-variant">Frozen Disputes</div>
          <div className={`text-xl md:text-2xl font-bold font-mono mt-1 ${frozenCount > 0 ? 'text-error' : 'text-on-surface'}`}>
            {frozenCount}
          </div>
        </div>
      </div>

      {/* Messages */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-primary hover:opacity-80">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:opacity-80">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Payout Schedules Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">Global Payout Schedules (Direct Gateway Holds)</h2>
          <span className="text-xs text-outline">{schedules.length} Schedules Registered</span>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-surface-container-low rounded-xl">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-on-surface-variant">Loading global schedules...</p>
          </div>
        ) : (
          <PayoutTable
            schedules={schedules}
            isAdmin={true}
            onFreeze={handleFreeze}
            onForceRelease={handleForceRelease}
            loadingId={actionLoadingId}
          />
        )}
      </div>

      {/* Immutable Audit Logs Feed */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-on-surface">Immutable Payout Audit Trail (payout_logs)</h2>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high max-h-72 overflow-y-auto space-y-2">
          {logs.length === 0 ? (
            <p className="text-xs text-outline text-center py-4">No audit logs recorded yet.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-lg bg-surface-container-low text-xs flex items-center justify-between font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high font-bold text-on-surface">
                    {log.event_type}
                  </span>
                  <span className="text-on-surface-variant truncate max-w-md">
                    Schedule: {log.payout_schedule_id}
                  </span>
                </div>
                <span className="text-outline">
                  {new Date(log.created_at).toLocaleTimeString('en-IN')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </AdminShell>
);
}
