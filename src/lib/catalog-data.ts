export interface MentorItem {
  id: string;
  slug: string;
  fullName: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  currentCompany: string;
  currentRole: string;
  pastCompanies: string[];
  yearsExperience: number;
  isVerified: boolean;
  rollingRating: number;
  totalReviews: number;
  startingPriceInr: number;
  marketsServed: string[];
  location: string;
  languages: string[];
  skills: string[];
  activeServicesCount: number;
  services: {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number;
    durationMinutes: number;
    deliverable: string;
    isActive: boolean;
  }[];
  schedules: {
    dayOfWeek: number;
    startTimeUtc: string;
    endTimeUtc: string;
  }[];
}

export interface ServiceTypeItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  durationMinutes: number;
  priceFloor: number;
  medianPrice: number;
  mentorCount: number;
  satisfactionRate: number;
  deliverableRubric: {
    title: string;
    sections: string[];
    slaHours: number;
  };
  sampleMentors: {
    name: string;
    company: string;
    rating: number;
    avatarUrl: string;
  }[];
}

export const STANDARD_SERVICES: ServiceTypeItem[] = [
  {
    id: 1,
    slug: 'mock-interview',
    title: '1-on-1 Mock Interview (Tech & System Design)',
    category: 'Interview Preparation',
    shortDescription: 'Simulated Google/Meta 60-min round with live whiteboard drawing, distributed tradeoffs, edge cases, and instant debrief.',
    fullDescription: 'Experience an authentic, high-pressure simulated engineering interview conducted by vetted Big Tech practitioners. Includes live problem scoping, architecture tradeoff evaluation, and comprehensive rubric scorecards.',
    durationMinutes: 60,
    priceFloor: 999,
    medianPrice: 1199,
    mentorCount: 84,
    satisfactionRate: 98.4,
    deliverableRubric: {
      title: 'Standardized 4-Page System Design & Technical Scorecard',
      sections: ['Problem Scoping & Functional Requirements', 'High-Level Architecture & Component Partitioning', 'Bottlenecks, Sharding & Fault Tolerance', 'Bar-Raiser Competency Leveling'],
      slaHours: 24,
    },
    sampleMentors: [
      { name: 'Vikram Singh', company: 'Google Cloud', rating: 4.95, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces' },
      { name: 'Arjun Kulkarni', company: 'Amazon AWS', rating: 4.91, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces' },
    ],
  },
  {
    id: 2,
    slug: 'resume-review',
    title: 'Resume & ATS Optimization (Big Tech Calibrated)',
    category: 'Application Review',
    shortDescription: 'Detailed line-by-line rewrite focused on XYZ metric formulas, distributed systems keywords, and Bar Raiser resume filters.',
    fullDescription: 'Transform your resume into a high-converting candidate profile that bypasses automated ATS filters and commands the immediate attention of engineering hiring managers at Google, Microsoft, and Uber.',
    durationMinutes: 45,
    priceFloor: 699,
    medianPrice: 799,
    mentorCount: 92,
    satisfactionRate: 99.1,
    deliverableRubric: {
      title: 'Annotated PDF Markup & Bullet-Rewrite Specification',
      sections: ['XYZ Action-Metric Quantification Check', 'Keyword Density & ATS Compatibility Audit', 'Visual Hierarchy & Reading Velocity Flow', 'FAANG High-Impact Word Library'],
      slaHours: 24,
    },
    sampleMentors: [
      { name: 'Priya Venkataraman', company: 'Meta', rating: 4.98, avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces' },
      { name: 'Vikram Singh', company: 'Google Cloud', rating: 4.95, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces' },
    ],
  },
  {
    id: 3,
    slug: 'coding-dsa-prep',
    title: 'Coding & DSA Interview Prep (Hard / Optimal)',
    category: 'Technical Mastery',
    shortDescription: 'Live problem breakdown: DAG Dynamic Programming, Sliding Window, and Tree-Graph traversals with optimal space-time proofs.',
    fullDescription: 'Stop memorizing LeetCode solutions. Learn repeatable mental frameworks for recognizing state-space reductions, topological DAG layouts, and asymptotic complexity boundaries under pressure.',
    durationMinutes: 60,
    priceFloor: 899,
    medianPrice: 999,
    mentorCount: 76,
    satisfactionRate: 97.8,
    deliverableRubric: {
      title: 'Optimal Code Sandbox & Mathematical Proof Document',
      sections: ['State Transition Invariant Proofs', 'Time/Space Complexity Upper-Bound Bounds', 'Failure Edge Case Breakdown Matrix', 'Follow-Up Difficulty Escalation Guide'],
      slaHours: 24,
    },
    sampleMentors: [
      { name: 'Sneha Roy', company: 'Microsoft AI', rating: 4.94, avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces' },
      { name: 'Rohan Mehta', company: 'Atlassian', rating: 4.96, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces' },
    ],
  },
  {
    id: 4,
    slug: 'career-roadmap',
    title: 'Career Roadmap & Senior-to-Staff Strategy',
    category: 'Career Growth',
    shortDescription: 'Navigate the difficult L5-to-L6 leap, cross-organizational influence artifacts, RFC drafting, and US relocation pathways.',
    fullDescription: 'Formulate an actionable 90-day execution plan for senior engineers transitioning to staff, principal, or tech lead positions, with guidance on cross-team influence and executive communication.',
    durationMinutes: 45,
    priceFloor: 649,
    medianPrice: 699,
    mentorCount: 58,
    satisfactionRate: 98.9,
    deliverableRubric: {
      title: '90-Day Organizational Impact & Promotion Roadmap',
      sections: ['Scope & Cross-Team Impact Definition', 'Technical RFC Leadership Strategy', 'Sponsor Alignment & Visibility Architecture', 'Quarterly Metric Milestone Tracking'],
      slaHours: 48,
    },
    sampleMentors: [
      { name: 'Vikram Singh', company: 'Google Cloud', rating: 4.95, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces' },
      { name: 'Arjun Kulkarni', company: 'Amazon AWS', rating: 4.91, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces' },
    ],
  },
  {
    id: 5,
    slug: 'salary-negotiation',
    title: 'Salary & Offer Negotiation Strategy',
    category: 'Compensation',
    shortDescription: 'Data-driven counter-offer scripting, competing offer leverage, RSU vesting schedules, and sign-on bonus optimization.',
    fullDescription: 'Do not leave lakhs on the table. Craft calibrated compensation counter-proposals with real market benchmarks, equity decoupling math, and recruiter negotiation scripts.',
    durationMinutes: 30,
    priceFloor: 799,
    medianPrice: 899,
    mentorCount: 42,
    satisfactionRate: 99.5,
    deliverableRubric: {
      title: 'Custom Counter-Offer Script & Compensation Multiplier Sheet',
      sections: ['Comp Band Intelligence & Benchmark Breakdown', 'Recruiter Telephone Counter-Scripting', 'Equity Liquidity & Tax Calibration', 'Walk-Away Anchor Boundaries'],
      slaHours: 12,
    },
    sampleMentors: [
      { name: 'Vikram Singh', company: 'Google Cloud', rating: 4.95, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces' },
      { name: 'Priya Venkataraman', company: 'Meta', rating: 4.98, avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces' },
    ],
  },
  {
    id: 6,
    slug: 'system-design',
    title: 'System Design Deep Dive (HLD & LLD)',
    category: 'Technical Mastery',
    shortDescription: 'Design consistent replication, split-brain recovery, distributed cache invalidation, and database sharding at scale.',
    fullDescription: 'Master the principles of high-throughput distributed systems: consensus algorithms (Raft), message ordering in Kafka, multi-region database sharding, and latency SLA guarantees.',
    durationMinutes: 60,
    priceFloor: 1199,
    medianPrice: 1299,
    mentorCount: 65,
    satisfactionRate: 98.7,
    deliverableRubric: {
      title: 'Exhaustive Architecture Blueprint & Capacity Model',
      sections: ['Throughput, QPS & Storage Calculation', 'API Interface & Data Model Schemas', 'Consensus, Replicas & Failover Diagrams', 'Deep-Dive Component Isolation Protocols'],
      slaHours: 24,
    },
    sampleMentors: [
      { name: 'Vikram Singh', company: 'Google Cloud', rating: 4.95, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces' },
      { name: 'Arjun Kulkarni', company: 'Amazon AWS', rating: 4.91, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces' },
    ],
  },
  {
    id: 7,
    slug: 'linkedin-optimization',
    title: 'LinkedIn & Personal Brand Optimization',
    category: 'Application Review',
    shortDescription: 'Profile makeover calibrated for Big Tech recruiters, Boolean search visibility, and inbound pipeline generation.',
    fullDescription: 'Get recruiters reaching out to you directly with an algorithmic overhaul of your LinkedIn headline, experience bullets, and featured technical projects.',
    durationMinutes: 30,
    priceFloor: 449,
    medianPrice: 499,
    mentorCount: 38,
    satisfactionRate: 97.5,
    deliverableRubric: {
      title: 'Recruiter Search Calibration & Profile Overhaul Guide',
      sections: ['Boolean Search Keyword Audit', 'Headline & About Section Copy Rewrite', 'Featured Artifact Portfolio Selection', 'Recruiter Inbound Conversion Framework'],
      slaHours: 24,
    },
    sampleMentors: [
      { name: 'Priya Venkataraman', company: 'Meta', rating: 4.98, avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces' },
    ],
  },
  {
    id: 8,
    slug: 'portfolio-review',
    title: 'Full-Stack & ML Portfolio Project Teardown',
    category: 'Technical Mastery',
    shortDescription: 'Codebase and live deployment teardown ensuring production-grade rigor, CI/CD pipelines, and observability.',
    fullDescription: 'Elevate your GitHub projects beyond boilerplate tutorials. Audit code architecture, automated testing suites, and production deployment resilience.',
    durationMinutes: 45,
    priceFloor: 699,
    medianPrice: 799,
    mentorCount: 44,
    satisfactionRate: 98.2,
    deliverableRubric: {
      title: 'Code Architecture & Production Rigor Audit Scorecard',
      sections: ['Code Modularity & Pattern Adherence', 'Test Coverage & Mocking Strategy', 'Deployment Observability & CI Pipeline', 'Interactive Demo UX Flow'],
      slaHours: 24,
    },
    sampleMentors: [
      { name: 'Rohan Mehta', company: 'Atlassian', rating: 4.96, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces' },
    ],
  },
  {
    id: 9,
    slug: 'offer-evaluation',
    title: 'Competing Offer Evaluation & Equity Decoupling',
    category: 'Compensation',
    shortDescription: 'Detailed breakdown of base vs bonus vs equity vesting schedules across competing Indian and US offers.',
    fullDescription: 'Evaluate competing job offers objectively with net tax simulation, vesting cliffs analysis, and career trajectory projections.',
    durationMinutes: 30,
    priceFloor: 549,
    medianPrice: 599,
    mentorCount: 35,
    satisfactionRate: 99.0,
    deliverableRubric: {
      title: 'Multi-Offer Net Worth & Risk-Adjusted Decision Matrix',
      sections: ['Gross vs Net After-Tax Realization', 'Equity Vesting Risk & Liquidity Schedule', 'Career Velocity & Promotion Probability', 'Final Acceptance Recommendation'],
      slaHours: 12,
    },
    sampleMentors: [
      { name: 'Vikram Singh', company: 'Google Cloud', rating: 4.95, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces' },
    ],
  },
  {
    id: 10,
    slug: 'bar-raiser',
    title: 'Official Bar Raiser Leadership Simulation',
    category: 'Interview Preparation',
    shortDescription: 'Intensive behavioral interview loop testing Amazon LPs, Google Googliness, and ownership criteria.',
    fullDescription: 'Prepare for the toughest interview hurdle with an authentic Bar Raiser loop, practicing structured STAR answers with zero ambiguity.',
    durationMinutes: 60,
    priceFloor: 1299,
    medianPrice: 1499,
    mentorCount: 50,
    satisfactionRate: 99.2,
    deliverableRubric: {
      title: 'Bar Raiser Leadership Scorecard & Signal Matrix',
      sections: ['Customer Obsession & Ownership Signals', 'Earn Trust & Deep Dive Competencies', 'STAR Framework Precision Score', 'Hire / No-Hire Formal Assessment'],
      slaHours: 24,
    },
    sampleMentors: [
      { name: 'Arjun Kulkarni', company: 'Amazon AWS', rating: 4.91, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces' },
    ],
  },
];

export const MENTORS_CATALOG: MentorItem[] = [
  {
    id: '8f7e6d5c-4b3a-2f1e-0d9c-8b7a6f5e4d3c',
    slug: 'vikram-singh-8f7e',
    fullName: 'Vikram Singh',
    headline: 'Senior Staff AI / Distributed Systems Engineer at Google Cloud',
    bio: 'Over the last 11+ years, I have architected high-scale distributed systems and real-time AI pipelines at Google Cloud, Microsoft, and Flipkart. As an official Bar Raiser, I have conducted over 200 interview loops for L4, L5, and L6 engineering levels.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
    currentCompany: 'Google Cloud',
    currentRole: 'Senior Staff AI Engineer',
    pastCompanies: ['Microsoft', 'Flipkart'],
    yearsExperience: 11,
    isVerified: true,
    rollingRating: 4.95,
    totalReviews: 38,
    startingPriceInr: 699,
    marketsServed: ['CM-IN', 'CM-US'],
    location: 'Bangalore & Bay Area (IST / PST)',
    languages: ['English', 'Hindi'],
    skills: ['System Design', 'Distributed Systems', 'FAANG Bar Raiser', 'Staff SWE Promotion', 'Offer Negotiation'],
    activeServicesCount: 5,
    services: [
      {
        id: 'svc-01',
        slug: 'mock-interview',
        title: '1. Mock Interview (Technical & System Design)',
        description: 'Simulated Google/Meta 60-min round with live Whiteboard drawing, distributed tradeoffs, edge cases, and instant live debrief.',
        price: 1199,
        durationMinutes: 60,
        deliverable: 'Includes Written Rubric Report + 4K Video Recording',
        isActive: true,
      },
      {
        id: 'svc-02',
        slug: 'resume-review',
        title: '2. Resume & ATS Review (Big Tech Calibrated)',
        description: 'Detailed line-by-line rewrite focused on XYZ metric formulas, distributed systems keywords, and Bar Raiser resume filters.',
        price: 799,
        durationMinutes: 45,
        deliverable: 'Annotated PDF Markup + FAANG Ready Template',
        isActive: true,
      },
      {
        id: 'svc-03',
        slug: 'coding-dsa-prep',
        title: '3. Coding & DSA Interview Prep (Hard / Optimal)',
        description: 'Live problem breakdown: DAG Dynamic Programming, Sliding Window, and Tree-Graph traversals with optimal space-time proofs.',
        price: 999,
        durationMinutes: 60,
        deliverable: 'Live Code Sandbox + Complexity Proofs',
        isActive: true,
      },
      {
        id: 'svc-04',
        slug: 'career-roadmap',
        title: '4. Career Roadmap & Senior-to-Staff Strategy',
        description: 'Navigate the difficult L5-to-L6 leap, cross-organizational influence artifacts, RFC drafting, and US relocation pathways.',
        price: 699,
        durationMinutes: 30,
        deliverable: 'Promotion Packet Review + 90-Day Impact Plan',
        isActive: true,
      },
      {
        id: 'svc-05',
        slug: 'salary-negotiation',
        title: '5. Salary & Offer Negotiation Strategy',
        description: 'Data-driven counter-offer scripting, competing offer leverage, RSU vesting schedules, and sign-on bonus optimization.',
        price: 899,
        durationMinutes: 30,
        deliverable: 'Custom Negotiation Script + Equity Calculator',
        isActive: true,
      },
    ],
    schedules: [
      { dayOfWeek: 6, startTimeUtc: '04:30:00', endTimeUtc: '08:30:00' }, // Sat 10:00 AM - 2:00 PM IST
      { dayOfWeek: 0, startTimeUtc: '05:00:00', endTimeUtc: '09:00:00' }, // Sun 10:30 AM - 2:30 PM IST
      { dayOfWeek: 3, startTimeUtc: '14:30:00', endTimeUtc: '17:30:00' }, // Wed 8:00 PM - 11:00 PM IST
    ],
  },
  {
    id: '9b8a7f6e-5d4c-3b2a-1f0e-9d8c7b6a5f4e',
    slug: 'priya-venkataraman',
    fullName: 'Priya Venkataraman',
    headline: 'Staff Product Designer & Design Systems Lead at Meta',
    bio: 'Leading design systems and zero-to-one design at Meta. Previously Senior Designer at Uber and Swiggy. Passionate about helping designers crack Big Tech product sense and design systems portfolio loops.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
    currentCompany: 'Meta',
    currentRole: 'Staff Product Designer',
    pastCompanies: ['Uber', 'Swiggy'],
    yearsExperience: 9,
    isVerified: true,
    rollingRating: 4.98,
    totalReviews: 47,
    startingPriceInr: 499,
    marketsServed: ['CM-IN', 'CM-US'],
    location: 'London & Hyderabad (GMT / IST)',
    languages: ['English', 'Tamil'],
    skills: ['Design Systems', 'Product Sense', 'Portfolio Teardown', 'Meta Whiteboard', 'Figma Systems'],
    activeServicesCount: 4,
    services: [
      {
        id: 'svc-06',
        slug: 'portfolio-review',
        title: 'Product Design Portfolio Deep Dive',
        description: 'Line-by-line critique of your case studies: problem definition, user empathy, component hierarchy, and business metrics.',
        price: 899,
        durationMinutes: 45,
        deliverable: 'Annotated Figma File + Video Teardown',
        isActive: true,
      },
      {
        id: 'svc-07',
        slug: 'mock-interview',
        title: 'Meta Product Sense & Whiteboard Mock',
        description: 'Simulated 60-min interactive whiteboard exercise focusing on ambiguous user problems and technical constraints.',
        price: 1299,
        durationMinutes: 60,
        deliverable: 'Meta Rubric Scorecard + Action Items',
        isActive: true,
      },
      {
        id: 'svc-08',
        slug: 'linkedin-optimization',
        title: 'Design Portfolio & LinkedIn Makeover',
        description: 'Position your work for top product companies and global remote contract pipelines.',
        price: 499,
        durationMinutes: 30,
        deliverable: 'Written Brand Audit & Positioning Copy',
        isActive: true,
      },
      {
        id: 'svc-09',
        slug: 'salary-negotiation',
        title: 'Design Compensation & Equity Negotiation',
        description: 'Strategic negotiation for product design roles across EMEA and Indian tech unicorns.',
        price: 799,
        durationMinutes: 30,
        deliverable: 'Counter-Offer Calculation & Recruiter Script',
        isActive: true,
      },
    ],
    schedules: [
      { dayOfWeek: 5, startTimeUtc: '13:00:00', endTimeUtc: '17:00:00' },
      { dayOfWeek: 6, startTimeUtc: '09:00:00', endTimeUtc: '13:00:00' },
    ],
  },
  {
    id: 'a2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d',
    slug: 'arjun-kulkarni',
    fullName: 'Arjun Kulkarni',
    headline: 'Principal Engineering Manager at Amazon AWS',
    bio: '14+ years in cloud infrastructure and distributed storage at Amazon AWS. Official Bar Raiser with 300+ interview loops cleared. Expert in AWS Leadership Principles and scaling engineering organizations.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
    currentCompany: 'Amazon AWS',
    currentRole: 'Principal Engineering Manager',
    pastCompanies: ['Oracle', 'Cisco'],
    yearsExperience: 14,
    isVerified: true,
    rollingRating: 4.91,
    totalReviews: 62,
    startingPriceInr: 799,
    marketsServed: ['CM-IN', 'CM-US'],
    location: 'Seattle & Pune (PST / IST)',
    languages: ['English', 'Marathi'],
    skills: ['AWS Leadership Principles', 'System Architecture', 'Bar Raiser Mock', 'Managerial Loops', 'Cloud Storage'],
    activeServicesCount: 4,
    services: [
      {
        id: 'svc-10',
        slug: 'bar-raiser',
        title: 'Official AWS Bar Raiser Behavioral Mock',
        description: 'Simulated 60-min Amazon Bar Raiser loop with deep dives into Customer Obsession, Ownership, and Have Backbone.',
        price: 1499,
        durationMinutes: 60,
        deliverable: 'Amazon LP Scorecard & Weakness Remediation',
        isActive: true,
      },
      {
        id: 'svc-11',
        slug: 'system-design',
        title: 'High-Scale Cloud Architecture Review',
        description: 'Distributed storage, eventual consistency, multi-AZ reliability, and cost-optimized serverless designs.',
        price: 1399,
        durationMinutes: 60,
        deliverable: 'AWS Architecture Well-Architected Review',
        isActive: true,
      },
      {
        id: 'svc-12',
        slug: 'career-roadmap',
        title: 'Senior to Principal / EM Transition Roadmap',
        description: 'Strategic roadmap for navigating the IC track vs Management track in Big Tech.',
        price: 899,
        durationMinutes: 45,
        deliverable: 'Career Transition Matrix & 90-Day Plan',
        isActive: true,
      },
      {
        id: 'svc-13',
        slug: 'offer-evaluation',
        title: 'AWS Comp & RSU Backloaded Vesting Analysis',
        description: 'Understanding Amazon 5/15/40/40 vesting structure, sign-on bonus calculations, and counter-offers.',
        price: 799,
        durationMinutes: 30,
        deliverable: '4-Year Total Compensation Projection',
        isActive: true,
      },
    ],
    schedules: [
      { dayOfWeek: 0, startTimeUtc: '16:00:00', endTimeUtc: '20:00:00' },
      { dayOfWeek: 6, startTimeUtc: '16:00:00', endTimeUtc: '20:00:00' },
    ],
  },
  {
    id: 'b3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e',
    slug: 'sneha-roy',
    fullName: 'Sneha Roy',
    headline: 'Senior Machine Learning Engineer at Microsoft AI',
    bio: 'Specializing in Generative AI, LLM evaluation pipelines, and vector retrieval at scale. Mentored 80+ candidates into Applied Scientist and ML Engineer roles at Microsoft, Adobe, and top AI startups.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces',
    currentCompany: 'Microsoft AI',
    currentRole: 'Senior Machine Learning Engineer',
    pastCompanies: ['Adobe', 'InMobi'],
    yearsExperience: 7,
    isVerified: true,
    rollingRating: 4.94,
    totalReviews: 29,
    startingPriceInr: 699,
    marketsServed: ['CM-IN'],
    location: 'Hyderabad (IST)',
    languages: ['English', 'Bengali'],
    skills: ['Generative AI', 'LLM Fine-Tuning', 'ML System Design', 'PyTorch / Triton', 'RAG Pipelines'],
    activeServicesCount: 3,
    services: [
      {
        id: 'svc-14',
        slug: 'system-design',
        title: 'Machine Learning System Design Mock',
        description: 'Design real-time recommendation engines, vector search pipelines, and low-latency LLM serving architectures.',
        price: 1199,
        durationMinutes: 60,
        deliverable: 'ML Architecture Diagram & Evaluation Metrics',
        isActive: true,
      },
      {
        id: 'svc-15',
        slug: 'coding-dsa-prep',
        title: 'Python, NumPy & PyTorch Coding Round',
        description: 'Matrix vectorization, custom attention layer implementations, and mathematical ML coding.',
        price: 899,
        durationMinutes: 45,
        deliverable: 'Jupyter Code Sandbox & Solutions',
        isActive: true,
      },
      {
        id: 'svc-16',
        slug: 'resume-review',
        title: 'AI/ML Resume & Publications Review',
        description: 'Framing Kaggle grandmaster achievements, arXiv papers, and enterprise model metrics for Big Tech screeners.',
        price: 699,
        durationMinutes: 30,
        deliverable: 'Annotated ML Resume with Keyword Framing',
        isActive: true,
      },
    ],
    schedules: [
      { dayOfWeek: 2, startTimeUtc: '14:00:00', endTimeUtc: '17:00:00' },
      { dayOfWeek: 4, startTimeUtc: '14:00:00', endTimeUtc: '17:00:00' },
    ],
  },
  {
    id: 'c4d5e6f7-a8b9-0c1d-2e3f-4a5b6c7d8e9f',
    slug: 'rohan-mehta',
    fullName: 'Rohan Deshmukh',
    headline: 'Staff Frontend Architect at Atlassian · Ex-Swiggy',
    bio: 'Specialist in high-performance web applications, micro-frontends, and design systems. Guided engineers through Atlassian P40 and Google L5 web frontend loops.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
    currentCompany: 'Atlassian',
    currentRole: 'Staff Frontend Architect',
    pastCompanies: ['Swiggy', 'Zomato'],
    yearsExperience: 9,
    isVerified: true,
    rollingRating: 4.96,
    totalReviews: 52,
    startingPriceInr: 599,
    marketsServed: ['CM-IN', 'CM-US'],
    location: 'Bangalore (IST)',
    languages: ['English', 'Hindi', 'Marathi'],
    skills: ['React & Next.js Internals', 'Web Performance', 'Frontend System Design', 'State Machines', 'TypeScript Strict'],
    activeServicesCount: 4,
    services: [
      {
        id: 'svc-17',
        slug: 'system-design',
        title: 'Frontend System Design (Atlassian / Google L5)',
        description: 'Real-time collaborative editors, offline syncing, virtualized feeds, and web vitals optimization.',
        price: 1099,
        durationMinutes: 60,
        deliverable: 'Frontend Architecture Document + Component Tree',
        isActive: true,
      },
      {
        id: 'svc-18',
        slug: 'portfolio-review',
        title: 'Production React / Next.js Codebase Audit',
        description: 'In-depth code review assessing bundle splitting, re-render bottlenecks, and accessibility compliance.',
        price: 799,
        durationMinutes: 45,
        deliverable: 'GitHub PR Feedback + Lighthouse Audit',
        isActive: true,
      },
      {
        id: 'svc-19',
        slug: 'mock-interview',
        title: 'JavaScript Deep Dive & DOM Machine Coding',
        description: 'Build complex reactive components from scratch under time constraints: Autocomplete, Virtual List, Infinite Scroll.',
        price: 899,
        durationMinutes: 60,
        deliverable: 'Sandbox Solution + Performance Rubric',
        isActive: true,
      },
      {
        id: 'svc-20',
        slug: 'career-roadmap',
        title: 'Frontend Senior to Staff SWE Playbook',
        description: 'Navigating frontend organizational leadership, RFC driving, and multi-app architecture governance.',
        price: 599,
        durationMinutes: 30,
        deliverable: 'Staff Engineering Artifact Roadmap',
        isActive: true,
      },
    ],
    schedules: [
      { dayOfWeek: 1, startTimeUtc: '14:30:00', endTimeUtc: '17:30:00' },
      { dayOfWeek: 5, startTimeUtc: '14:30:00', endTimeUtc: '17:30:00' },
    ],
  },
];
