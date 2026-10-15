"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PrivacyCenterPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [exporting, setExporting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  async function checkAuthAndStatus() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const res = await fetch("/api/v1/privacy/status");
        if (res.ok) {
          const json = await res.json();
          setStatus(json);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuthAndStatus();
  }, []);

  async function handleExportData() {
    try {
      setExporting(true);
      const res = await fetch("/api/v1/privacy/export", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate data export");
      }

      // Trigger file download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dreamx-dpdp-export-${user?.id}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      triggerToast("Data export generated and downloaded successfully.");
      checkAuthAndStatus();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setExporting(false);
    }
  }

  async function handleRequestDeletion() {
    if (confirmText !== "DELETE MY ACCOUNT") {
      alert("Please type 'DELETE MY ACCOUNT' exactly to confirm.");
      return;
    }
    if (!password) {
      alert("Password is required to authenticate deletion.");
      return;
    }

    try {
      setDeleting(true);
      const res = await fetch("/api/v1/privacy/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          confirmationText: confirmText,
          reason: deleteReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule deletion");

      setDeleteModal(false);
      triggerToast(data.message);
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-on-surface text-surface shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-surface-container-high/60 bg-surface-container-lowest/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <span className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold">
              DX
            </span>
            <span>DreamX</span>
          </Link>
          <span className="text-outline text-sm">/ Privacy &amp; Data Rights Center</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            DPDP Act (2023) Compliant
          </span>
          <Link
            href={user ? "/dashboard/student" : "/login"}
            className="px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">
            Privacy &amp; Data Protection Center
          </h1>
          <p className="text-on-surface-variant text-sm max-w-2xl leading-relaxed">
            In compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> of India, DreamX guarantees your statutory rights to access, data portability, correction, and account erasure.
          </p>
        </div>

        {/* DPDP Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">cloud_download</span>
            </div>
            <h3 className="font-bold text-sm text-on-surface">Right to Portability (§11)</h3>
            <p className="text-xs text-outline leading-relaxed">
              Export all your personal data, session logs, and review records in structured machine-readable format.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <h3 className="font-bold text-sm text-on-surface">Indian Data Residency</h3>
            <p className="text-xs text-outline leading-relaxed">
              All personal records and audit trails reside securely within Indian cloud infrastructure (ap-south-1).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
            </div>
            <h3 className="font-bold text-sm text-on-surface">Right to Erasure (§12)</h3>
            <p className="text-xs text-outline leading-relaxed">
              Request complete account deletion with a 30-day statutory grace period before irreversible database purge.
            </p>
          </div>
        </div>

        {/* User Actions Container */}
        {loading ? (
          <div className="p-8 text-center text-outline text-sm">Verifying session credentials...</div>
        ) : !user ? (
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 text-center space-y-3">
            <h2 className="text-base font-bold text-on-surface">Log In to Manage Your Personal Data</h2>
            <p className="text-xs text-outline">
              To exercise your data portability or account deletion rights, please log in with your credentials.
            </p>
            <Link
              href="/login"
              className="inline-block px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold"
            >
              Log In to DreamX
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Warning if Deletion Scheduled */}
            {status?.is_deletion_requested && (
              <div className="p-4 rounded-2xl bg-error-container/20 border border-error-container text-on-error-container text-sm space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  <span>Account Erasure Scheduled</span>
                </div>
                <p className="text-xs">
                  Your account was marked for deletion. It will be permanently purged on:{" "}
                  <strong>{new Date(status.scheduled_purge_at).toLocaleDateString("en-IN")}</strong>.
                </p>
              </div>
            )}

            {/* Section 1: Data Export Card */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-on-surface">Export Personal Data Archive</h2>
                  <p className="text-xs text-outline">
                    Generates a complete JSON package including your profile, booking transactions, career scores, and reviews.
                  </p>
                </div>

                <button
                  onClick={handleExportData}
                  disabled={exporting || (status && !status.can_export)}
                  className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 shrink-0"
                >
                  <span className={`material-symbols-outlined text-[18px] ${exporting ? "animate-spin" : ""}`}>
                    download
                  </span>
                  <span>{exporting ? "Compiling Archive..." : "Download My Data"}</span>
                </button>
              </div>

              {status?.last_export_at && (
                <div className="pt-3 border-t border-surface-container-high/40 text-xs text-outline flex items-center justify-between">
                  <span>Last export generated: {new Date(status.last_export_at).toLocaleString("en-IN")}</span>
                  {!status.can_export && status.next_export_available_at && (
                    <span className="text-error font-medium">
                      Next export unlocked: {new Date(status.next_export_available_at).toLocaleTimeString("en-IN")}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Section 2: Account Deletion Card */}
            <div className="p-6 rounded-2xl bg-surface-container-lowest border border-error-container/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-error">Account Deletion &amp; Erasure (§12)</h2>
                  <p className="text-xs text-outline">
                    Permanently deletes your profile, credentials, and mentorship history. Includes a 30-day cancellation window.
                  </p>
                </div>

                <button
                  onClick={() => setDeleteModal(true)}
                  disabled={status?.is_deletion_requested}
                  className="px-4 py-2.5 rounded-xl bg-error text-on-error text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                  <span>{status?.is_deletion_requested ? "Deletion Pending" : "Request Erasure"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deletion Confirmation Modal */}
        {deleteModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container-high space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-error">Confirm Account Erasure</h3>
                  <p className="text-xs text-outline">India DPDP Act (2023) Statutory Process</p>
                </div>
                <button
                  onClick={() => setDeleteModal(false)}
                  className="p-1 rounded hover:bg-surface-container-high text-outline"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-error-container/20 border border-error-container/30 text-xs text-on-error-container space-y-1.5">
                <p className="font-semibold">Important Notice:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Your sessions and mentorship marketplace presence will be immediately suspended.</li>
                  <li>In compliance with Indian law, you have <strong>30 calendar days</strong> before permanent data purge.</li>
                  <li>Re-authenticating during the 30-day window cancels this request.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">Enter Your Password to Verify:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container-high text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface">
                    Type <code className="text-error font-bold">DELETE MY ACCOUNT</code> to confirm:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE MY ACCOUNT"
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-surface-container-high text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-outline">Reason (Optional):</label>
                  <input
                    type="text"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="e.g. Completed my job search"
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-surface-container-high text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeleteModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestDeletion}
                  disabled={deleting || confirmText !== "DELETE MY ACCOUNT" || !password}
                  className="px-4 py-2 rounded-lg bg-error text-on-error text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {deleting ? "Scheduling..." : "Schedule Permanent Deletion"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
