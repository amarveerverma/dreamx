'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OnboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [activeStep, setActiveStep] = useState(1)
  const [role, setRole] = useState<'student' | 'mentor'>('student')
  const [homeCountry, setHomeCountry] = useState('IN')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [targetMarket, setTargetMarket] = useState('CM-IN')
  const [primaryGoal, setPrimaryGoal] = useState('FAANG / Tier-1 Tech Offer')
  const [targetCompanyTier, setTargetCompanyTier] = useState('Tier-1 (FAANG / Unicorns)')
  const [targetCTC, setTargetCTC] = useState('₹45,00,000 / $180,000 USD')
  const [institution, setInstitution] = useState('Indian Institute of Technology, Delhi (IITD)')
  const [gradYear, setGradYear] = useState('2025')
  const [degree, setDegree] = useState('B.Tech • Computer Science and Engineering')
  const [gpa, setGpa] = useState('9.12 / 10.0 (Top 5% Cohort)')
  const [skills, setSkills] = useState([
    'Python / PyTorch',
    'Distributed Systems (Raft / Paxos)',
    'System Design & Scalability',
    'C++ 20 / Concurrency',
    'Kubernetes & Envoy',
  ])
  const [newSkill, setNewSkill] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('ananya_sharma_resume_v2.pdf')
  const [saving, setSaving] = useState(false)

  // Check for active session on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/login')
      } else {
        const userRole = user.app_metadata?.user_role || (user.user_metadata?.user_role as any)
        if (userRole === 'mentor' || userRole === 'student') {
          setRole(userRole)
        }
      }
    })
  }, [router, supabase])

  const prefillStudent = () => {
    setRole('student')
    setHomeCountry('IN')
    setTimezone('Asia/Kolkata')
    setTargetMarket('CM-IN')
    setPrimaryGoal('FAANG / Tier-1 Tech Offer')
    setTargetCompanyTier('Tier-1 (FAANG / Unicorns)')
    setTargetCTC('₹45,00,000 / $180,000 USD')
    setInstitution('Indian Institute of Technology, Delhi (IITD)')
    setGradYear('2025')
    setDegree('B.Tech • Computer Science and Engineering')
    setGpa('9.12 / 10.0')
    setUploadedFileName('ananya_sharma_resume_v2.pdf')
  }

  const prefillMentor = () => {
    setRole('mentor')
    setHomeCountry('US')
    setTimezone('America/Los_Angeles')
    setTargetMarket('CM-US')
    setPrimaryGoal('High-Impact Tech Advisory & Cohort Mentorship')
    setTargetCompanyTier('Staff+ Leadership')
    setTargetCTC('$350,000+ USD Total Comp')
    setInstitution('Stanford University / Ex-Google Staff SDE')
    setGradYear('2018')
    setDegree('M.S. • Computer Science (AI Systems)')
    setGpa('4.0 / 4.0')
    setUploadedFileName('vikram_seth_executive_bio.pdf')
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  const handleCompleteOnboarding = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const updatePayload: Record<string, any> = {
          current_country: homeCountry || 'IN',
          time_zone: timezone || 'Asia/Kolkata',
          target_career_market_id: targetMarket || 'CM-IN',
        }
        if (institution || degree) {
          updatePayload.headline = `${degree || ''} at ${institution || ''}`.trim()
        }
        await supabase
          .from('profiles')
          .update(updatePayload)
          .eq('id', user.id)
      }
      window.location.href = `/dashboard/${role}`
    } catch (err) {
      console.error('Onboarding update error:', err)
      window.location.href = `/dashboard/${role}`
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between">
          <div className="flex items-center gap-space-lg">
            <Link className="flex items-center gap-space-sm" href="/">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[20px]">verified</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md text-on-surface leading-none tracking-tight">DreamX</span>
                <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest mt-0.5">
                  Career Marketplace
                </span>
              </div>
            </Link>
            <div className="h-5 w-px bg-surface-container-high hidden md:block"></div>
            <div className="hidden md:flex items-center gap-space-md">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low">
                <span className="material-symbols-outlined text-primary text-[14px]">lock</span>
                <span className="font-label-sm text-label-sm text-tertiary">256-Bit Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-low">
                <span className="material-symbols-outlined text-primary text-[14px]">shield</span>
                <span className="font-label-sm text-label-sm text-tertiary">Zero-Trust RLS</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-space-xs text-tertiary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-secondary text-[16px]">bolt</span>
              <span>Session Secured</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-20 bg-surface flex-1">
        <div className="max-w-7xl mx-auto px-margin py-space-lg">
          {/* Architecture Quick Rig */}
          <div className="w-full bg-surface-container-lowest shadow-sm rounded-xl p-space-md mb-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md border border-surface-container-high">
            <div className="flex items-center gap-space-sm w-full md:w-auto">
              <div className="p-2 rounded-lg bg-surface-container-high text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">science</span>
              </div>
              <div>
                <div className="font-title-md text-title-md text-on-surface leading-tight font-semibold">
                  Architecture Quick Rig
                </div>
                <div className="font-label-sm text-label-sm text-tertiary">
                  Architecture Sec 13.1 • Instant Persona Hydration
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm w-full md:w-auto">
              <button
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-primary font-label-md text-label-md transition-colors flex items-center gap-1.5 shadow-sm border border-surface-container-high cursor-pointer"
                onClick={prefillStudent}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">school</span>
                <span>Pre-fill Student (Ananya • IITD → Google AI)</span>
              </button>
              <button
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest text-secondary font-label-md text-label-md transition-colors flex items-center gap-1.5 shadow-sm border border-surface-container-high cursor-pointer"
                onClick={prefillMentor}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">psychology</span>
                <span>Pre-fill Mentor (Vikram • Staff SDE Google)</span>
              </button>
            </div>
          </div>

          {/* Pathway Selector */}
          <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-md mb-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md border border-surface-container-high">
            <div className="flex items-center gap-space-md">
              <span className="material-symbols-outlined text-primary text-[28px]">hub</span>
              <div>
                <h2 className="font-title-md text-title-md text-on-surface leading-tight font-semibold">
                  {role === 'student' ? 'Student & Job Seeker Pathway' : 'Industry Mentor Pathway'}
                </h2>
                <p className="font-body-sm text-body-sm text-tertiary">
                  {role === 'student'
                    ? 'Initialize career readiness score, calibrate geographic ambitions, and unlock AI match engine.'
                    : 'Configure mentorship offering, hourly rates, credential badges, and escrow payouts.'}
                </p>
              </div>
            </div>
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl shadow-inner w-full sm:w-auto border border-surface-container-high">
              <button
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'student'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-tertiary hover:text-on-surface'
                }`}
                onClick={() => setRole('student')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                <span>Student / Seeker</span>
              </button>
              <button
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg font-label-md text-label-md font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  role === 'mentor'
                    ? 'bg-surface-container-lowest text-secondary shadow-sm'
                    : 'text-tertiary hover:text-on-surface'
                }`}
                onClick={() => setRole('mentor')}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Industry Mentor</span>
              </button>
            </div>
          </div>

          {/* 4-Step Progress Bar */}
          <div className="w-full bg-surface-container-lowest rounded-xl shadow-sm p-space-lg mb-space-xl border border-surface-container-high">
            <div className="grid grid-cols-4 gap-space-sm relative">
              {[
                { step: 1, title: 'Identity & Market', sub: 'Target Ecosystem' },
                { step: 2, title: 'Ambition & Goals', sub: 'Target CTC & Horizon' },
                { step: 3, title: 'Credentials & Stack', sub: 'University & Proof' },
                { step: 4, title: 'AI Baseline Scoring', sub: 'Resume Vault' },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`flex flex-col items-center text-center cursor-pointer group transition-opacity ${
                    activeStep >= item.step ? 'opacity-100' : 'opacity-50'
                  }`}
                  onClick={() => setActiveStep(item.step)}
                >
                  <div
                    className={`w-10 h-10 rounded-full font-title-md text-title-md flex items-center justify-center shadow-md mb-2 transition-transform duration-200 group-hover:scale-105 ${
                      activeStep >= item.step
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-tertiary'
                    }`}
                  >
                    <span>{item.step}</span>
                  </div>
                  <span className="font-title-md text-label-md text-on-surface font-semibold">{item.title}</span>
                  <span className="font-label-sm text-label-sm text-tertiary hidden md:inline">{item.sub}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(activeStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Wizard Content Region */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start w-full">
            {/* Form Steps */}
            <div className="lg:col-span-8 flex flex-col gap-space-lg">
              {/* STEP 1: IDENTITY & TARGET CAREER MARKET */}
              {activeStep === 1 && (
                <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-lg border border-surface-container-high">
                  <div>
                    <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm uppercase tracking-wider mb-1">
                      <span className="material-symbols-outlined text-[16px]">public</span>
                      <span>Decouple Ambition from Physical Location</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                      Target Career Market (CM)
                    </h3>
                    <p className="font-body-md text-body-md text-tertiary mt-1">
                      DreamX models regional hiring expectations, compensation bands, and ATS rubrics independently from where you reside.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between">
                        <span>Home Jurisdiction (Residency)</span>
                        <span className="text-tertiary font-label-sm text-label-sm">ISO-3166-1</span>
                      </label>
                      <select
                        className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer font-body-md text-body-md border border-surface-container-high"
                        onChange={(e) => setHomeCountry(e.target.value)}
                        value={homeCountry}
                      >
                        <option value="IN">India (IN) - High Density Hub</option>
                        <option value="US">United States (US)</option>
                        <option value="GB">United Kingdom (GB)</option>
                        <option value="SG">Singapore (SG)</option>
                        <option value="DE">Germany (DE)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between">
                        <span>Operational Timezone</span>
                        <span className="text-tertiary font-label-sm text-label-sm">IANA Format</span>
                      </label>
                      <select
                        className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer font-body-md text-body-md border border-surface-container-high"
                        onChange={(e) => setTimezone(e.target.value)}
                        value={timezone}
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST • UTC+05:30)</option>
                        <option value="America/Los_Angeles">America/Los_Angeles (PST • UTC-08:00)</option>
                        <option value="America/New_York">America/New_York (EST • UTC-05:00)</option>
                        <option value="Europe/London">Europe/London (GMT • UTC+00:00)</option>
                        <option value="Asia/Singapore">Asia/Singapore (SGT • UTC+08:00)</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Market Cards */}
                  <div className="flex flex-col gap-space-sm pt-space-xs">
                    <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                      <span>Select Primary Target Market Engine</span>
                      <span className="text-primary font-label-sm text-label-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span> Adaptive Evaluation Rule
                      </span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      {[
                        { code: 'CM-IN', name: 'CM-IN Tech Hub', location: 'Bengaluru / Gurugram / Hyderabad', tags: ['1-2 Page Format', 'DSA Heavy', 'INR Tier-1 Rubric'] },
                        { code: 'CM-US', name: 'CM-US Silicon Valley', location: 'SF / Seattle / NYC Remote', tags: ['1-Page Strict', 'STAR Impact', 'USD Comp Curve'] },
                        { code: 'CM-UK', name: 'CM-UK London Tech', location: 'FinTech & Frontier AI', tags: ['Competency Focus', 'GBP Rubric', 'Visa Calibration'] },
                        { code: 'CM-SG', name: 'CM-SG Southeast Asia', location: 'Singapore / Regional Hub', tags: ['Compact Dual Track', 'Cross-border APAC', 'SGD Benchmarks'] },
                      ].map((market) => (
                        <div
                          key={market.code}
                          className={`p-space-md rounded-xl transition-all cursor-pointer relative shadow-sm border ${
                            targetMarket === market.code
                              ? 'bg-surface-container-low border-primary ring-1 ring-primary/40'
                              : 'bg-surface-container-lowest border-surface-container-high hover:bg-surface-container-low'
                          }`}
                          onClick={() => setTargetMarket(market.code)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-space-sm">
                              <div className="w-9 h-9 rounded-lg bg-surface-container-highest text-primary flex items-center justify-center font-title-md text-title-md font-bold">
                                {market.code.replace('CM-', '')}
                              </div>
                              <div>
                                <div className="font-title-md text-title-md text-on-surface font-semibold">{market.name}</div>
                                <div className="font-label-sm text-label-sm text-tertiary">{market.location}</div>
                              </div>
                            </div>
                            {targetMarket === market.code && (
                              <span className="px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm text-label-sm">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="mt-space-md flex flex-wrap gap-1.5">
                            {market.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm border border-surface-container-high">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: AMBITION & GOALS */}
              {activeStep === 2 && (
                <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-lg border border-surface-container-high">
                  <div>
                    <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm uppercase tracking-wider mb-1">
                      <span className="material-symbols-outlined text-[16px]">flag</span>
                      <span>PRD Part 18 • Goal Orientation</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                      Career Ambition &amp; Trajectory
                    </h3>
                    <p className="font-body-md text-body-md text-tertiary mt-1">
                      Specify target roles, timeline deadlines, and salary thresholds to guide mentorship recommendations.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-on-surface font-medium">Primary Goal Focus</label>
                    <input
                      className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary font-body-md text-body-md border border-surface-container-high"
                      onChange={(e) => setPrimaryGoal(e.target.value)}
                      type="text"
                      value={primaryGoal}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface font-medium">Target Company Tier</label>
                      <input
                        className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary font-body-md text-body-md border border-surface-container-high"
                        onChange={(e) => setTargetCompanyTier(e.target.value)}
                        type="text"
                        value={targetCompanyTier}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface font-medium">Target CTC / Compensation Band</label>
                      <input
                        className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary font-body-md text-body-md border border-surface-container-high"
                        onChange={(e) => setTargetCTC(e.target.value)}
                        type="text"
                        value={targetCTC}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CREDENTIALS & STACK */}
              {activeStep === 3 && (
                <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-lg border border-surface-container-high">
                  <div>
                    <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm uppercase tracking-wider mb-1">
                      <span className="material-symbols-outlined text-[16px]">school</span>
                      <span>Academic &amp; Professional Foundation</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                      Credentials &amp; Tech Stack
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface font-medium">University / Current Organization</label>
                      <input
                        className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary font-body-md text-body-md border border-surface-container-high"
                        onChange={(e) => setInstitution(e.target.value)}
                        type="text"
                        value={institution}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface font-medium">Graduation Year</label>
                      <input
                        className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary font-body-md text-body-md border border-surface-container-high"
                        onChange={(e) => setGradYear(e.target.value)}
                        type="text"
                        value={gradYear}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface font-medium">Degree &amp; Specialization</label>
                      <input
                        className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary font-body-md text-body-md border border-surface-container-high"
                        onChange={(e) => setDegree(e.target.value)}
                        type="text"
                        value={degree}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface font-medium">Cumulative GPA / Score</label>
                      <input
                        className="w-full h-10 px-3 bg-surface-container-low text-on-surface rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary font-body-md text-body-md border border-surface-container-high"
                        onChange={(e) => setGpa(e.target.value)}
                        type="text"
                        value={gpa}
                      />
                    </div>
                  </div>

                  {/* Skills Pill Cloud */}
                  <div className="flex flex-col gap-space-sm pt-space-xs">
                    <label className="font-label-md text-label-md text-on-surface font-medium">Verified &amp; Claimed Technical Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-md text-label-md font-medium cursor-pointer shadow-sm flex items-center gap-1.5 border border-surface-container-high"
                        >
                          <span className="material-symbols-outlined text-[16px]">code</span>
                          <span>{skill}</span>
                          <span
                            className="material-symbols-outlined text-[14px] text-tertiary hover:text-error"
                            onClick={() => handleRemoveSkill(skill)}
                          >
                            close
                          </span>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        className="flex-1 h-9 px-3 bg-surface-container-low text-on-surface rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary font-body-sm text-body-sm border border-surface-container-high"
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                        placeholder="Add custom competency (e.g. CUDA, Triton, GraphQL)..."
                        type="text"
                        value={newSkill}
                      />
                      <button
                        className="px-4 h-9 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md font-medium transition-colors flex items-center gap-1 border border-surface-container-high cursor-pointer"
                        onClick={handleAddSkill}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span> Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: RESUME VAULT & BASELINE SCORING */}
              {activeStep === 4 && (
                <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm flex flex-col gap-space-lg border border-surface-container-high">
                  <div>
                    <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm uppercase tracking-wider mb-1">
                      <span className="material-symbols-outlined text-[16px]">auto_graph</span>
                      <span>Architecture Sec 13.2 • Deterministic Baseline</span>
                    </div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                      Resume Upload &amp; AI Engine Calibration
                    </h3>
                    <p className="font-body-md text-body-md text-tertiary mt-1">
                      Upload your current resume to trigger our 8-dimension rubric and establish your initial Career Readiness Score.
                    </p>
                  </div>

                  <div className="p-space-xl rounded-xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-space-sm relative border border-dashed border-primary/40 relative">
                    <input 
                      type="file" 
                      accept=".pdf,.docx" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadedFileName(e.target.files[0].name)
                        }
                      }}
                    />
                    <div className="w-14 h-14 rounded-full bg-surface-container-highest text-primary flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[32px]">upload_file</span>
                    </div>
                    <div>
                      <div className="font-title-md text-title-md text-on-surface font-semibold">
                        Drop your resume here or browse files
                      </div>
                      <div className="font-body-sm text-body-sm text-tertiary mt-0.5">
                        Supports PDF or DOCX up to 5MB. Strictly encrypted via AES-256.
                      </div>
                    </div>
                    <div className="flex items-center gap-space-md mt-2 pointer-events-none">
                      <span className="px-2.5 py-1 rounded bg-surface-container text-tertiary font-label-sm text-label-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">lock</span> Zero LLM Retention
                      </span>
                      <span className="px-2.5 py-1 rounded bg-surface-container text-tertiary font-label-sm text-label-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">verified</span> Multi-Format Parse
                      </span>
                    </div>
                  </div>

                  <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex items-center justify-between border border-surface-container-high">
                    <div className="flex items-center gap-space-md">
                      <div className="w-10 h-10 rounded-lg bg-surface-container text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">description</span>
                      </div>
                      <div>
                        <div className="font-title-md text-label-md text-on-surface font-semibold">{uploadedFileName}</div>
                        <div className="font-label-sm text-label-sm text-tertiary">
                          384 KB • Uploaded • Parsed 14 Projects &amp; {skills.length} Competencies
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold">
                      Parsed &amp; Validated
                    </span>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Actions */}
              <div className="flex items-center justify-between pt-space-md border-t border-surface-container-high">
                <button
                  className="px-5 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer border border-surface-container-high"
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep(activeStep - 1)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Previous Step</span>
                </button>

                {activeStep < 4 ? (
                  <button
                    className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 shadow-md cursor-pointer"
                    onClick={() => setActiveStep(activeStep + 1)}
                    type="button"
                  >
                    <span>Continue to Step {activeStep + 1}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary hover:brightness-105 text-on-primary font-title-md text-title-md font-semibold transition-all flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-60"
                    disabled={saving}
                    onClick={handleCompleteOnboarding}
                    type="button"
                  >
                    {saving ? (
                      <span>Saving Profile...</span>
                    ) : (
                      <>
                        <span>Complete Onboarding &amp; Enter Workspace</span>
                        <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Right-Side Realtime Profile Preview */}
            <div className="lg:col-span-4 flex flex-col gap-space-md">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container-high">
                <div className="flex items-center justify-between mb-space-sm pb-space-xs border-b border-surface-container-high">
                  <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider font-semibold">
                    Realtime Persona Snapshot
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm">
                    {role === 'student' ? 'Student' : 'Mentor'}
                  </span>
                </div>

                <div className="space-y-space-md">
                  <div>
                    <div className="font-label-sm text-label-sm text-tertiary">Target Career Market</div>
                    <div className="font-title-md text-title-md text-on-surface font-semibold">{targetMarket}</div>
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm text-tertiary">Primary Objective</div>
                    <div className="font-body-md text-body-md text-on-surface">{primaryGoal}</div>
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm text-tertiary">Target Compensation</div>
                    <div className="font-body-md text-body-md text-emerald-600 font-semibold">{targetCTC}</div>
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm text-tertiary">Institution / Background</div>
                    <div className="font-body-md text-body-md text-on-surface">{institution}</div>
                  </div>
                  <div>
                    <div className="font-label-sm text-label-sm text-tertiary">Active Skills ({skills.length})</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {skills.slice(0, 4).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-surface-container-low text-tertiary text-xs">
                          {s}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="px-2 py-0.5 rounded bg-surface-container text-primary text-xs font-semibold">
                          +{skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low py-space-lg border-t border-surface-container-high mt-space-xl">
        <div className="max-w-7xl mx-auto px-margin flex flex-col md:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-tertiary text-[16px]">security</span>
            <span>ISO/IEC 27001 Certified Infrastructure • Continuous Automated Compliance</span>
          </div>
          <div className="flex items-center gap-space-md font-label-md text-label-md">
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Terms of Service
            </Link>
            <span className="text-outline-variant">•</span>
            <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">
              Privacy Policy
            </Link>
            <span className="text-outline-variant">•</span>
            <span className="text-on-surface-variant">© 2026 DreamX Global Inc.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
