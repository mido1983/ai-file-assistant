import type { SubscriptionPlan } from './user';

export interface PlanLimits {
  maxFilesPerMonth: number;
  maxFileSizeMB: number;
  aiAnalysisIncluded: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    maxFilesPerMonth: 20,
    maxFileSizeMB: 10,
    aiAnalysisIncluded: false,
  },
  pro: {
    maxFilesPerMonth: 200,
    maxFileSizeMB: 200,
    aiAnalysisIncluded: true,
  },
  business: {
    maxFilesPerMonth: 2000,
    maxFileSizeMB: 1024,
    aiAnalysisIncluded: true,
  },
};

