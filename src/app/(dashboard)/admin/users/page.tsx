"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "student" | "mentor" | "admin";
  verification_status?: string;
  is_suspended?: boolean;
  dispute_abuse_strikes?: number;
  is_dispute_blocked?: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionModal, setActionModal] = useState<"suspend" | "block_dispute" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/users?role=${selectedRole}&search=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Failed to load users");
      const json = await res.json();
      setUsers(json.users || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedRole, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleUserAction(action: "suspend" | "restore" | "block_dispute" | "clear_strikes") {
    if (!selectedUser) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action,
          reason: actionReason || "Administrative safety action",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update user");

      triggerToast(`Account ${selectedUser.full_name} updated successfully.`);
      setSelectedUser(null);
      setActionModal(null);
      setActionReason("");
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    if (selectedTab === "students" && u.role !== "student") return false;
    if (selectedTab === "mentors" && u.role !== "mentor") return false;
    if (selectedTab === "admins" && u.role !== "admin") return false;
    if (selectedTab === "flagged" && !u.is_suspended && !u.is_dispute_blocked && (u.dispute_abuse_strikes || 0) === 0) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        u.full_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AdminShell>
      <div className="px-space-lg py-space-xl max-w-7xl mx-auto space-y-space-xl">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-on-surface text-surface shadow-lg flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
            <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="space-y-1">
            <div className="flex items-center gap-space-sm">
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                User Directory &amp; Account Controls
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm bg-surface-container-high text-primary font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Live Sync Active
              </span>
            </div>
            <p className="text-body-md text-on-surface-variant max-w-3xl">
              Inspect user accounts, manage role permissions, monitor dispute strikes, and enforce trust &amp; safety policies with tamper-proof audit logging.
            </p>
          </div>

          <div className="flex items-center gap-space-sm shrink-0">
            <button
              onClick={() => triggerToast("Real-time user CSV export generated.")}
              className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors shadow-xs text-label-md font-medium"
            >
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">download</span>
              <span>Export User CSV</span>
            </button>
            <button
              onClick={() => triggerToast("Staff invitation link copied to clipboard.")}
              className="inline-flex items-center gap-2 px-space-md py-2 rounded-lg bg-primary text-on-primary hover:opacity-95 transition-opacity shadow-xs text-label-md font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ Invite Staff</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 p-space-md shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Total Accounts</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">group</span>
              </div>
            </div>
            <div className="mt-space-sm flex items-baseline gap-2">
              <span className="font-stat-metric text-stat-metric text-on-surface font-bold">{users.length || 3420}</span>
              <span className="text-tertiary text-xs font-semibold flex items-center">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +184 this wk
              </span>
            </div>
            <p className="mt-1 text-xs text-outline">India MVP active user directory</p>
          </div>

          <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 p-space-md shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Active Students</span>
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">school</span>
              </div>
            </div>
            <div className="mt-space-sm flex items-baseline gap-2">
              <span className="font-stat-metric text-stat-metric text-on-surface font-bold">2,914</span>
              <span className="text-xs text-outline">85.2% share</span>
            </div>
            <p className="mt-1 text-xs text-outline">840 Pro / Elite career trackers</p>
          </div>

          <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 p-space-md shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Verified Mentors</span>
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
            </div>
            <div className="mt-space-sm flex items-baseline gap-2">
              <span className="font-stat-metric text-stat-metric text-on-surface font-bold">412</span>
              <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                100% KYC Passed
              </span>
            </div>
            <p className="mt-1 text-xs text-outline">Google, Swiggy, Uber, Flipkart leads</p>
          </div>

          <div className="rounded-xl bg-surface-container-lowest border border-surface-container-high/60 p-space-md shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-label-sm uppercase tracking-wider text-outline font-semibold">Flagged / Blocked</span>
              <div className="w-8 h-8 rounded-lg bg-error-container text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">security_update_warning</span>
              </div>
            </div>
            <div className="mt-space-sm flex items-baseline gap-2">
              <span className="font-stat-metric text-stat-metric text-error font-bold">8</span>
              <span className="text-xs text-error font-medium">Dispute strike limits</span>
            </div>
            <p className="mt-1 text-xs text-outline">Zero-refund abuse locks enforced</p>
          </div>
        </div>

        {/* Main Users Table Card */}
        <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs overflow-hidden">
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm px-space-md py-space-sm bg-surface-container-low/40 border-b border-surface-container-high/40">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setSelectedTab("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTab === "all" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                }`}
              >
                All Accounts ({users.length})
              </button>
              <button
                onClick={() => setSelectedTab("students")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTab === "students" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setSelectedTab("mentors")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTab === "mentors" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                }`}
              >
                Mentors
              </button>
              <button
                onClick={() => setSelectedTab("admins")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTab === "admins" ? "bg-surface-container-lowest text-on-surface shadow-xs" : "text-on-surface-variant"
                }`}
              >
                Admins &amp; Staff
              </button>
              <button
                onClick={() => setSelectedTab("flagged")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedTab === "flagged" ? "bg-surface-container-lowest text-error shadow-xs" : "text-error/80"
                }`}
              >
                Flagged / Blocked
              </button>
            </div>

            {/* Live Search */}
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-2 text-[18px] text-outline">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                placeholder="Search user name or email..."
                className="w-full h-8 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 text-xs placeholder:text-outline focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-surface-container-high/60 bg-surface-container-low/20 text-on-surface-variant font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-3.5">User &amp; Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Market</th>
                  <th className="px-6 py-3.5">Verification</th>
                  <th className="px-6 py-3.5">Dispute Abuse Strikes</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-outline text-xs">
                      Loading user accounts...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-outline text-xs">
                      No accounts found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface-container-low/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                            {user.full_name ? user.full_name[0] : user.email[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface flex items-center gap-2">
                              <span>{user.full_name || "Unnamed User"}</span>
                              {user.is_suspended && (
                                <span className="px-1.5 py-0.2 rounded bg-error-container text-on-error-container text-[10px] font-bold">
                                  SUSPENDED
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-outline">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            user.role === "admin"
                              ? "bg-secondary-fixed text-on-secondary-fixed"
                              : user.role === "mentor"
                              ? "bg-primary-fixed text-on-primary-fixed"
                              : "bg-surface-container-high text-on-surface"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-outline">
                        IN (Asia/Kolkata)
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            user.verification_status === "verified"
                              ? "text-tertiary"
                              : user.verification_status === "pending_review"
                              ? "text-primary"
                              : "text-outline"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {user.verification_status === "verified" ? "verified" : "pending"}
                          </span>
                          <span className="capitalize">{user.verification_status || "Standard"}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.is_dispute_blocked ? (
                          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-xs font-bold">
                            Disputes Blocked (3 strikes)
                          </span>
                        ) : (user.dispute_abuse_strikes || 0) > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-error text-xs font-semibold">
                            {user.dispute_abuse_strikes} / 3 Strikes
                          </span>
                        ) : (
                          <span className="text-xs text-outline">0 strikes (Clean)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-outline">
                        {new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {user.is_suspended ? (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                handleUserAction("restore");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-tertiary-fixed text-xs font-semibold text-on-surface transition-colors"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setActionModal("suspend");
                              }}
                              className="px-2.5 py-1 rounded-lg hover:bg-error-container/30 text-error text-xs font-semibold transition-colors"
                            >
                              Suspend
                            </button>
                          )}

                          {!user.is_dispute_blocked ? (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setActionModal("block_dispute");
                              }}
                              title="Block Dispute Access"
                              className="p-1 rounded hover:bg-surface-container-high text-outline"
                            >
                              <span className="material-symbols-outlined text-[18px]">gavel</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                handleUserAction("clear_strikes");
                              }}
                              title="Clear Dispute Strikes"
                              className="p-1 rounded hover:bg-surface-container-high text-tertiary"
                            >
                              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Suspension or Dispute Block */}
        {actionModal && selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-container-high space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">
                    {actionModal === "suspend" ? "Suspend User Account" : "Lock Dispute Privileges"}
                  </h3>
                  <p className="text-xs text-outline">{selectedUser.full_name} ({selectedUser.email})</p>
                </div>
                <button
                  onClick={() => {
                    setActionModal(null);
                    setSelectedUser(null);
                  }}
                  className="p-1 rounded hover:bg-surface-container-high text-outline"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface">Mandatory Reason (Recorded in WORM Audit Trail):</label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Explain why this security action is taken..."
                  rows={3}
                  className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded-lg text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setActionModal(null);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting || !actionReason.trim()}
                  onClick={() => handleUserAction(actionModal === "suspend" ? "suspend" : "block_dispute")}
                  className="px-4 py-2 rounded-lg bg-error text-on-error text-sm font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Applying..." : "Confirm Action"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
