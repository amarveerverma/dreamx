export type CareerDimension =
  | 'resume'
  | 'technical'
  | 'interview'
  | 'communication'
  | 'career_planning'
  | 'linkedin'
  | 'portfolio'
  | 'confidence';

export interface DimensionDetail {
  score: number;
  weight: number;
  has_evidence: boolean;
  status_label: string;
  delta?: string;
  assessed_at?: string | null;
}

export interface CareerScoreResponse {
  overall_score: number;
  displayed_score: string;
  max_score: number;
  tier_label: string;
  calculated_at: string;
  dimensions: Record<CareerDimension, DimensionDetail>;
  history: Array<{
    calculated_at: string;
    overall_score: number;
  }>;
  ai_opportunity: {
    weakest_dimension: CareerDimension;
    opportunity_text: string;
    suggested_service_slug: string;
  };
  cohort_benchmark?: {
    percentile: number;
    total_peers: number;
  } | null;
}

export type JourneyStageStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface JourneyStageItem {
  stage: number;
  name: string;
  description: string;
  status: JourneyStageStatus;
  prerequisites: number[];
  started_at?: string | null;
  completed_at?: string | null;
  completion_source?: string | null;
  notes?: string | null;
  recommended_service_slug?: string;
}

export interface JourneyProgressResponse {
  overall_progress_percentage: number;
  active_stage: number;
  stages: JourneyStageItem[];
}

export type RecommendationType =
  | 'service'
  | 'program'
  | 'membership'
  | 'action'
  | 'mentor'
  | 'journey_stage';

export interface RecommendationItem {
  id: string;
  type: RecommendationType;
  target_slug: string;
  target_name: string;
  title: string;
  reason: string;
  action_url: string;
  action_label: string;
  price_formatted?: string;
  priority: number;
  score: number;
  created_at: string;
}

export interface MentorAnalyticsResponse {
  period: string;
  metrics: {
    total_earnings_inr: number;
    pending_payout_inr: number;
    released_payout_inr: number;
    completed_sessions: number;
    average_rating: number;
    total_reviews: number;
    response_rate_percentage: number | null;
    acceptance_rate_percentage: number | null;
    average_response_time_minutes: number | null;
  };
  rating_histogram: {
    '5_star': number;
    '4_star': number;
    '3_star': number;
    '2_star': number;
    '1_star': number;
  };
  sub_ratings: {
    average_punctuality: number;
    average_actionability: number;
  };
  top_services: Array<{
    slug: string;
    title: string;
    completed_count: number;
    revenue_inr: number;
  }>;
}
