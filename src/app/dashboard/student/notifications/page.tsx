'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { InAppNotification, NotificationCategory } from '@/types/notifications';

export default function StudentNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest'>('newest');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [wsStatus, setWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [whatsappOptIn, setWhatsappOptIn] = useState<boolean>(true);
  const [isSavingPrefs, setIsSavingPrefs] = useState<boolean>(false);

  // 1. Fetch user & notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/v1/notifications?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error('[Fetch Notifications Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('whatsapp_opt_in')
          .eq('id', user.id)
          .single();
        if (profile) {
          setWhatsappOptIn(profile.whatsapp_opt_in ?? true);
        }
      }
      await fetchNotifications();
    }
    init();
  }, []);

  // 2. Realtime WebSocket subscription
  useEffect(() => {
    if (!currentUser?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`user-notifications-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as InAppNotification;
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as InAppNotification;
            setNotifications((prev) =>
              prev.map((n) => (n.id === updated.id ? updated : n))
            );
            if (updated.is_read) {
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setWsStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setWsStatus('disconnected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  // 3. Mark Single as Read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('[Mark Single Read Error]:', err);
    }
  };

  // 4. Mark All as Read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/v1/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory === 'all' ? undefined : selectedCategory }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => {
            if (selectedCategory === 'all' || n.category === selectedCategory) {
              return { ...n, is_read: true, read_at: new Date().toISOString() };
            }
            return n;
          })
        );
        if (selectedCategory === 'all') {
          setUnreadCount(0);
        } else {
          // Recompute remaining unread
          const remaining = notifications.filter(
            (n) => n.category !== selectedCategory && !n.is_read
          ).length;
          setUnreadCount(remaining);
        }
      }
    } catch (err) {
      console.error('[Mark All Read Error]:', err);
    }
  };

  // 5. Batch Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchMarkRead = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    for (const id of ids) {
      handleMarkAsRead(id);
    }
    setSelectedIds(new Set());
  };

  // 6. Preferences Toggle
  const handleSavePreferences = async () => {
    if (!currentUser?.id) return;
    setIsSavingPrefs(true);
    try {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .update({ whatsapp_opt_in: whatsappOptIn })
        .eq('id', currentUser.id);
      setIsPreferencesOpen(false);
    } catch (err) {
      console.error('[Save Prefs Error]:', err);
    } finally {
      setIsSavingPrefs(false);
    }
  };

  // 7. Filtering & Sorting
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((n) => {
        if (selectedCategory !== 'all' && n.category !== selectedCategory) return false;
        if (unreadOnly && n.is_read) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = n.title?.toLowerCase().includes(q);
          const matchBody = n.body?.toLowerCase().includes(q);
          return matchTitle || matchBody;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at).getTime();
        const timeB = new Date(b.created_at).getTime();
        return sortOption === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [notifications, selectedCategory, unreadOnly, searchQuery, sortOption]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: notifications.length,
      bookings: 0,
      offers: 0,
      deliverables: 0,
      milestones: 0,
      billing: 0,
    };
    notifications.forEach((n) => {
      if (counts[n.category] !== undefined) {
        counts[n.category]++;
      }
    });
    return counts;
  }, [notifications]);

  // Helper formatting
  const getRelativeTime = (isoDate: string) => {
    const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return new Date(isoDate).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryTheme = (cat: NotificationCategory) => {
    switch (cat) {
      case 'bookings':
        return {
          icon: 'event_available',
          badgeBg: 'bg-primary-fixed',
          badgeText: 'text-on-primary-fixed',
          borderLeft: 'border-primary',
          iconColor: 'text-primary',
        };
      case 'offers':
        return {
          icon: 'local_offer',
          badgeBg: 'bg-secondary-fixed',
          badgeText: 'text-on-secondary-fixed',
          borderLeft: 'border-secondary',
          iconColor: 'text-secondary',
        };
      case 'deliverables':
        return {
          icon: 'assignment_turned_in',
          badgeBg: 'bg-error-container',
          badgeText: 'text-on-error-container',
          borderLeft: 'border-primary-container',
          iconColor: 'text-primary-container',
        };
      case 'milestones':
        return {
          icon: 'trending_up',
          badgeBg: 'bg-secondary-fixed',
          badgeText: 'text-on-secondary-fixed',
          borderLeft: 'border-secondary-container',
          iconColor: 'text-secondary',
        };
      case 'billing':
        return {
          icon: 'receipt_long',
          badgeBg: 'bg-surface-container-high',
          badgeText: 'text-tertiary',
          borderLeft: 'border-outline-variant',
          iconColor: 'text-tertiary',
        };
      default:
        return {
          icon: 'notifications',
          badgeBg: 'bg-surface-container-high',
          badgeText: 'text-on-surface-variant',
          borderLeft: 'border-primary',
          iconColor: 'text-primary',
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col w-full py-6">
        <div className="max-w-[1400px] w-full mx-auto pb-16 space-y-6">
          {/* Top Command & Status Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 font-body-sm text-body-sm text-tertiary">
                <span>Workspace</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-on-surface font-medium">Notifications & Realtime Alerts</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                  Notification Center
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold tracking-wide">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      wsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  {wsStatus === 'connected' ? 'WS CONNECTED' : 'WS RECONNECTING'}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Live stream connected to cluster{' '}
                <code className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[12px] text-primary">
                  asia-south1-dreamx-sub-04
                </code>
                . All system events synced in IST.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">done_all</span>
                <span>Mark All as Read</span>
              </button>

              <button
                onClick={() => setIsPreferencesOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">tune</span>
                <span>Channels & Rules</span>
              </button>

              <div className="h-6 w-[1px] bg-surface-container hidden sm:block"></div>

              <button
                id="unread-only-toggle"
                onClick={() => setUnreadOnly(!unreadOnly)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                  unreadOnly
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                <span>Unread Only</span>
                <span className="px-1.5 py-0.2 rounded-full bg-primary text-on-primary text-[11px] font-bold">
                  {unreadCount}
                </span>
              </button>
            </div>
          </div>

          {/* Search & Sort Filter Control Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl shadow-sm">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-tertiary">
                search
              </span>
              <input
                id="notification-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts by mentor, order ID (e.g. #BKG-), keyword..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider px-2">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="bg-surface-container-low text-on-surface font-label-md text-label-md py-2 px-3 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="newest">Most Recent First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Main Section Layout: Split 8 Cols (List) + 4 Cols (Sidebar Widgets) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Feed Column */}
            <div className="xl:col-span-8 flex flex-col gap-4">
              {/* Category Filter Tabs */}
              <div className="overflow-x-auto pb-1">
                <div className="flex items-center gap-1.5 min-w-max p-1 bg-surface-container-lowest rounded-xl shadow-sm">
                  {[
                    { id: 'all', label: 'All Alerts', icon: '' },
                    { id: 'bookings', label: 'Bookings & Sessions', icon: 'event_available' },
                    { id: 'offers', label: 'Offers & Bids', icon: 'local_offer' },
                    { id: 'deliverables', label: 'Deliverables', icon: 'assignment_turned_in' },
                    { id: 'milestones', label: 'AI Milestones', icon: 'trending_up' },
                    { id: 'billing', label: 'Billing', icon: 'receipt_long' },
                  ].map((tab) => {
                    const isActive = selectedCategory === tab.id;
                    const count = categoryCounts[tab.id] || 0;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedCategory(tab.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                          isActive
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                      >
                        {tab.icon && (
                          <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                        )}
                        <span>{tab.label}</span>
                        {count > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                              isActive
                                ? 'bg-on-primary/20 text-on-primary'
                                : 'bg-surface-container text-tertiary'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Batch Action Banner */}
              {filteredNotifications.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-surface-container-high rounded-xl text-on-surface font-body-sm text-body-sm shadow-sm">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.size > 0 &&
                        selectedIds.size === filteredNotifications.length
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-primary cursor-pointer accent-primary"
                    />
                    <span className="font-medium">
                      {selectedIds.size} notification{selectedIds.size !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBatchMarkRead}
                        className="px-2.5 py-1 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-bright font-label-sm text-label-sm font-semibold transition-all shadow-xs"
                      >
                        Mark Read
                      </button>
                      <button
                        onClick={() => setSelectedIds(new Set())}
                        className="px-2.5 py-1 rounded text-tertiary hover:bg-surface-container font-label-sm text-label-sm font-semibold transition-all"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Notification Timeline Feed */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-xl shadow-sm text-tertiary gap-3">
                  <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
                  <span className="font-body-md text-body-md">Connecting to notification stream...</span>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-surface-container-lowest rounded-xl shadow-sm text-center">
                  <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-tertiary mb-3">
                    <span className="material-symbols-outlined text-[28px]">notifications_off</span>
                  </div>
                  <h4 className="font-title-md text-title-md font-bold text-on-surface">No notifications found</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-1">
                    No alerts match your current filter or keyword. Try resetting your search or switching categories.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setUnreadOnly(false);
                      setSearchQuery('');
                    }}
                    className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notif) => {
                    const theme = getCategoryTheme(notif.category);
                    const isSelected = selectedIds.has(notif.id);

                    return (
                      <article
                        key={notif.id}
                        onClick={() => {
                          if (!notif.is_read) handleMarkAsRead(notif.id);
                          if (notif.action_url) router.push(notif.action_url);
                        }}
                        className={`relative bg-surface-container-lowest p-5 rounded-xl shadow-sm transition-all hover:shadow-md border-l-4 cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                          theme.borderLeft
                        } ${!notif.is_read ? 'bg-surface-container-lowest' : 'bg-surface-container-lowest/70 opacity-90'}`}
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e) => handleToggleSelect(notif.id, e)}
                            onChange={() => {}}
                            className="mt-1 w-4 h-4 rounded text-primary accent-primary cursor-pointer shrink-0"
                          />

                          <div
                            className={`w-10 h-10 rounded-xl ${theme.badgeBg} flex items-center justify-center shrink-0 ${theme.iconColor}`}
                          >
                            <span className="material-symbols-outlined text-[22px]">{theme.icon}</span>
                          </div>

                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {!notif.is_read && (
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                              )}
                              <h3 className="font-title-md text-title-md font-bold text-on-surface">
                                {notif.title}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} font-label-sm text-label-sm font-bold capitalize`}
                              >
                                {notif.category}
                              </span>
                              <span className="font-label-sm text-label-sm text-tertiary ml-auto">
                                {getRelativeTime(notif.created_at)}
                              </span>
                            </div>

                            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                              {notif.body}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2.5 pt-2">
                              {notif.action_url && (
                                <Link
                                  href={notif.action_url}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-xs"
                                >
                                  <span>View Details</span>
                                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </Link>
                              )}

                              {!notif.is_read && (
                                <button
                                  type="button"
                                  onClick={(e) => handleMarkAsRead(notif.id, e)}
                                  className="p-1.5 rounded-lg text-tertiary hover:text-on-surface hover:bg-surface-container-low transition-colors"
                                  title="Mark as read"
                                >
                                  <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Sidebar Column */}
            <div className="xl:col-span-4 space-y-6">
              {/* Summary Metrics Card */}
              <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
                    Student SLA & Volume
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-label-sm text-label-sm font-bold">
                    Fast Track
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-container-low rounded-lg space-y-0.5">
                    <span className="font-label-sm text-label-sm text-tertiary">Actionable Items</span>
                    <div className="font-metric-num text-metric-num font-bold text-on-surface">
                      {unreadCount}
                    </div>
                    <span className="font-body-sm text-body-sm text-secondary font-medium">Pending Review</span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-lg space-y-0.5">
                    <span className="font-label-sm text-label-sm text-tertiary">On-Time SLA</span>
                    <div className="font-metric-num text-metric-num font-bold text-primary">99.8%</div>
                    <span className="font-body-sm text-body-sm text-tertiary">Escrow Verified</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-container">
                  <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
                    <span>Cluster Sync:</span>
                    <span className="font-semibold text-on-surface font-mono text-[12px]">asia-south1 (IST)</span>
                  </div>
                </div>
              </div>

              {/* Escrow Protection Guard */}
              <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">shield</span>
                  </div>
                  <div>
                    <h4 className="font-title-md text-title-md font-bold text-on-surface leading-snug">
                      Escrow Protection Guard
                    </h4>
                    <span className="font-label-sm text-label-sm text-tertiary">Section 18.2 Dispute Policy</span>
                  </div>
                </div>

                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  All mentor payments are securely held under Native Gateway Direct Hold. You hold a mandatory{' '}
                  <strong>72-hour inspection window</strong> after deliverable upload to audit ATS rubrics or dispute quality before auto-release.
                </p>

                <div className="p-3 bg-surface-container-low rounded-lg space-y-1">
                  <div className="flex items-center justify-between font-label-sm text-label-sm">
                    <span className="font-medium text-on-surface">Automated Sweep Worker</span>
                    <span className="text-primary font-bold">Active Every 10m</span>
                  </div>
                </div>
              </div>

              {/* Channel Delivery Status */}
              <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm space-y-3">
                <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-tertiary">
                  Channel Delivery Engine
                </span>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-primary">mail</span>
                      <span className="font-body-sm text-body-sm font-medium text-on-surface">Email (Resend)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      ACTIVE
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-emerald-600">chat</span>
                      <span className="font-body-sm text-body-sm font-medium text-on-surface">WhatsApp Reminders</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        whatsappOptIn ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {whatsappOptIn ? 'OPTED IN' : 'OPTED OUT'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-secondary">sync</span>
                      <span className="font-body-sm text-body-sm font-medium text-on-surface">Realtime Socket</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                      CONNECTED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences / Channel Rules Modal */}
      {isPreferencesOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl shadow-2xl p-6 space-y-5 border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
                <h3 className="font-title-md text-title-md font-bold text-on-surface">Notification Channels</h3>
              </div>
              <button
                onClick={() => setIsPreferencesOpen(false)}
                className="p-1 rounded-lg text-tertiary hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Manage how and where you receive 24-hour pre-session reminders, smart match offers, and escrow notifications.
            </p>

            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md font-bold text-on-surface">WhatsApp Reminders</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      DPDP COMPLIANT
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-tertiary">
                    Receive 24-hour pre-session alerts and instant Google Meet room links directly on WhatsApp.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-xl cursor-not-allowed opacity-80">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1 w-4 h-4 rounded text-primary accent-primary cursor-not-allowed"
                />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md font-bold text-on-surface">Transactional Emails</span>
                    <span className="px-1.5 py-0.2 rounded bg-surface-container text-tertiary text-[10px] font-bold">
                      REQUIRED
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-tertiary">
                    Booking confirmations, payment receipts, and security alerts via Resend.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(false)}
                className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container font-label-md text-label-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={isSavingPrefs}
                className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
              >
                {isSavingPrefs ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
