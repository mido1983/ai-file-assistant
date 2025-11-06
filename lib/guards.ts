import type { User, SubscriptionPlan } from '../types/user';
import { PLAN_LIMITS } from '../types/plan';

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

export function canUploadMoreFiles(
  user: User,
  filesUploadedThisMonth: number,
): boolean {
  const planLimits = PLAN_LIMITS[user.plan];
  return filesUploadedThisMonth < planLimits.maxFilesPerMonth;
}

export function canUseAiAnalysis(user: User): boolean {
  return PLAN_LIMITS[user.plan].aiAnalysisIncluded;
}

