'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function StudentSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'market' | 'privacy'>('profile');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [targetMarket, setTargetMarket] = useState('CM-IN');
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);

  // DPDP Export State
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setProfile(data);
          setFullName(data.full_name || '');
          setHeadline(data.headline || '');
          setBio(data.bio || '');
          setTargetMarket(data.target_career_market_id || 'CM-IN');
          setWhatsappOptIn(data.whatsapp_opt_in ?? true);
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setErrorMsg('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          headline: headline.trim(),
          bio: bio.trim(),
          target_career_market_id: targetMarket,
          whatsapp_opt_in: whatsappOptIn,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setSuccessMsg('Your profile and preferences have been successfully updated!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const res = await fetch('/api/v1/privacy/export');
      if (!res.ok) throw new Error('Failed to generate data export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dreamx_privacy_export_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6 space-y-6 max-w-5xl mx-auto">
        <div className="h-8 bg-surface-container-high rounded w-1/4 animate-pulse"></div>
        <div className="h-64 bg-surface-container-high rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-surface-container-high/60">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-tertiary">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-on-surface font-semibold">Settings & Account</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight mt-1">
            Profile & Account Settings
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage your verified academic identity, market decoupling preferences, and DPDP privacy settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-[20px] text-red-600">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container-low max-w-fit shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'profile'
              ? 'bg-surface-container-lowest text-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">person</span>
          <span>Identity & Bio</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('market')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'market'
              ? 'bg-surface-container-lowest text-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">public</span>
          <span>Target Market</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'privacy'
              ? 'bg-surface-container-lowest text-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">shield</span>
          <span>DPDP Privacy</span>
        </button>
      </div>

      {/* Main Tab Panels */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {(fullName || 'S')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-title-md text-title-md font-bold text-on-surface">
                {fullName || 'Student Name'}
              </h2>
              <p className="text-xs text-tertiary">{profile?.email}</p>
              <span className="mt-1 inline-block text-[11px] font-semibold px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed uppercase">
                {profile?.membership_tier || 'free'} tier
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-hidden focus:border-primary text-sm text-on-surface"
                placeholder="e.g. Ananya Sharma"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Headline / Current Status
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-hidden focus:border-primary text-sm text-on-surface"
                placeholder="e.g. 3rd Yr CS @ IIT Delhi • Aspiring Backend Engineer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Short Bio & Career Objectives
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low border border-surface-container-high focus:outline-hidden focus:border-primary text-sm text-on-surface"
              placeholder="Tell mentors about your background, projects, target roles, and what you aim to achieve..."
            />
          </div>
        </div>
      )}

      {activeTab === 'market' && (
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-6">
          <div>
            <h2 className="font-title-md text-title-md font-bold text-on-surface">
              Target Career Market Decoupling
            </h2>
            <p className="font-body-sm text-body-sm text-tertiary">
              DreamX decouples your geographic location from your ambition. Choose which regional market expectations apply to your Career Score and mentor matching.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setTargetMarket('CM-IN')}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                targetMarket === 'CM-IN'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-surface-container-high hover:border-outline'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-title-md text-body-md font-bold text-on-surface">
                  🇮🇳 India Tech Market (CM-IN)
                </span>
                {targetMarket === 'CM-IN' && (
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                )}
              </div>
              <p className="text-xs text-tertiary mt-2 leading-relaxed">
                Tailored for top Indian product companies and startups (Razorpay, Swiggy, Flipkart). Emphasizes DSA depth, core CS fundamentals, and INR salary benchmarks.
              </p>
            </div>

            <div
              onClick={() => setTargetMarket('CM-US')}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                targetMarket === 'CM-US'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-surface-container-high hover:border-outline'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-title-md text-body-md font-bold text-on-surface">
                  🇺🇸 Global & US Tech (CM-US)
                </span>
                {targetMarket === 'CM-US' && (
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                )}
              </div>
              <p className="text-xs text-tertiary mt-2 leading-relaxed">
                Tailored for international remote roles and US tech standards (FAANG / Silicon Valley). Emphasizes System Design, behavioral STAR frameworks, and global ATS conventions.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 shadow-xs space-y-6">
          <div>
            <h2 className="font-title-md text-title-md font-bold text-on-surface">
              DPDP Compliance & Data Portability
            </h2>
            <p className="font-body-sm text-body-sm text-tertiary">
              In accordance with India DPDP Act 2023, you retain complete ownership of your career data, scores, submissions, and session transcripts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-title-md text-body-md font-semibold text-on-surface">
                Export Full Account Data
              </h3>
              <p className="text-xs text-tertiary">
                Download a complete, machine-readable JSON archive containing all your scores, milestone progress, and booking records.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              disabled={exporting}
              className="px-4 py-2 rounded-lg bg-surface-container-lowest text-primary border border-surface-container-high font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>{exporting ? 'Generating Archive...' : 'Download JSON Export'}</span>
            </button>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappOptIn}
                onChange={(e) => setWhatsappOptIn(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <div>
                <span className="text-sm font-semibold text-on-surface">
                  WhatsApp Session Reminders
                </span>
                <p className="text-xs text-tertiary">
                  Receive session meeting links and urgent mentor check-in notifications via WhatsApp.
                </p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
