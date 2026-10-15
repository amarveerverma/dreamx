"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadBookings() {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/students/me/bookings");
      if (!res.ok) throw new Error("Failed to load bookings");
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleConfirmBooking(bookingId: string) {
    try {
      setActionLoading(bookingId);
      const res = await fetch(`/api/v1/bookings/${bookingId}/confirm`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to confirm booking");
      }
      await loadBookings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  const filteredBookings = bookings.filter((b) => {
    if (filter === "upcoming") {
      return ["confirmed", "pending_payment", "in_progress"].includes(b.status);
    }
    if (filter === "completed") {
      return ["completed", "deliverable_submitted"].includes(b.status);
    }
    return true;
  });

  const upcomingCount = bookings.filter((b) => ["confirmed", "pending_payment", "in_progress"].includes(b.status)).length;
  const completedCount = bookings.filter((b) => ["completed", "deliverable_submitted"].includes(b.status)).length;

  return (
    <div className="space-y-6">
      <div className="py-space-md mb-space-lg flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs font-body-sm text-body-sm text-tertiary">
            <span>Dashboard</span>
            <span>/</span>
            <span>Services & Bookings</span>
            <span>/</span>
            <span className="text-on-surface font-semibold">Active Bookings & Calendar</span>
          </div>
          <div className="flex items-center gap-space-md mt-1">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Booking Schedule & Calendar
            </h1>
            <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Live Sync
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm mt-1">
            <span className="px-space-sm py-1 rounded-md bg-surface-container-high text-on-surface font-label-md text-label-md font-medium">
              ⚡ {upcomingCount} Active Sessions
            </span>
            <span className="px-space-sm py-1 rounded-md bg-surface-container-low text-tertiary font-label-md text-label-md font-medium">
              🛡️ {completedCount} Completed (Escrow Verified)
            </span>
            <span className="px-space-sm py-1 rounded-md bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-medium">
              🔄 1 Free Reschedule Available
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="inline-flex p-1 rounded-lg bg-surface-container-low">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-space-md py-1.5 rounded-md font-label-md text-label-md font-semibold transition-all ${
                viewMode === "calendar"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-tertiary hover:text-on-surface font-medium"
              }`}
              type="button"
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">calendar_view_week</span>
                Calendar Matrix
              </span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-space-md py-1.5 rounded-md font-label-md text-label-md font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-tertiary hover:text-on-surface font-medium"
              }`}
              type="button"
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">view_agenda</span>
                Agenda List
              </span>
            </button>
          </div>

          <Link
            href="/dashboard/student/services"
            className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Book Service</span>
          </Link>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm mb-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-space-xs w-full md:w-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
              filter === "all"
                ? "bg-primary text-on-primary font-semibold shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            All Sessions ({bookings.length})
          </button>
          <button
            onClick={() => setFilter("upcoming")}
            className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
              filter === "upcoming"
                ? "bg-primary text-on-primary font-semibold shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all ${
              filter === "completed"
                ? "bg-primary text-on-primary font-semibold shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:text-on-surface font-medium"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-tertiary">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
          Loading your synchronized sessions...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl bg-surface-container-lowest shadow-sm p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary mb-4">
            <span className="material-symbols-outlined text-[32px]">event_busy</span>
          </div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-2">No Bookings Found</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            You don't have any sessions in this category yet. Launch a Smart Match request or select a direct service from top mentors.
          </p>
          <Link
            href="/dashboard/student/services"
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-title-md text-body-md font-semibold hover:bg-primary-container transition-all shadow-md"
          >
            Explore Services & Smart Match
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg mb-12">
          {filteredBookings.map((booking) => {
            const startDate = new Date(booking.scheduled_start_utc);
            const isConfirmed = booking.status === "confirmed";
            const isPending = booking.status === "pending_payment";
            const isCompleted = booking.status === "completed";

            return (
              <div
                key={booking.id}
                className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isConfirmed
                          ? "bg-green-100 text-green-700"
                          : isPending
                          ? "bg-yellow-100 text-yellow-800"
                          : isCompleted
                          ? "bg-surface-container text-tertiary"
                          : "bg-surface-container-low text-on-surface"
                      }`}
                    >
                      {booking.status.replace("_", " ")}
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary font-mono">
                      ₹{booking.net_amount} {booking.currency}
                    </span>
                  </div>

                  <h3 className="font-title-md text-title-md font-bold text-on-surface mb-1">
                    {booking.service?.title || "1-on-1 Mentorship Session"}
                  </h3>

                  <div className="flex items-center gap-space-xs text-body-sm text-tertiary mb-4">
                    <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                    <span>
                      {startDate.toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      •{" "}
                      {startDate.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Mentor Information */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {(booking.mentor?.full_name || "M")[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-title-md text-body-md font-semibold text-on-surface truncate">
                        {booking.mentor?.full_name || "Assigned Mentor"}
                      </div>
                      <div className="font-body-sm text-xs text-tertiary truncate">
                        100% Escrow Protected
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2 border-t border-surface-container">
                  {isConfirmed && booking.meeting_url && (
                    <a
                      href={booking.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-semibold text-center text-sm hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">videocam</span>
                      <span>Join Google Meet</span>
                    </a>
                  )}

                  {isPending && (
                    <button
                      onClick={() => handleConfirmBooking(booking.id)}
                      disabled={actionLoading === booking.id}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold text-center text-sm hover:opacity-95 transition-opacity shadow-sm flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">lock</span>
                      <span>{actionLoading === booking.id ? "Confirming..." : "Complete Checkout (15m Lock)"}</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-green-700 bg-green-50 rounded-xl">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Deliverable Approved & Completed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
