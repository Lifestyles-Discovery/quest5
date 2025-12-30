import type { UserRights } from './auth.types';

/**
 * Admin user view (includes password for admin display)
 */
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  rights: UserRights;
}

/**
 * Form data for creating a new user/employee
 */
export interface CreateUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAgent: boolean;
}

/**
 * Form data for updating user from admin
 */
export interface UpdateUserFormData {
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * User rights update (as string array for API)
 * Note: "search" is the API field for agent capability
 */
export type UserRightsUpdate = {
  admin: boolean;
  search: boolean; // Agent capability
  searchFree: boolean;
};

/**
 * Evaluation usage statistics
 */
export interface EvaluationUsage {
  discoveryCount: number;
  questCount: number;
  discoveryPortion: number;
  questPortion: number;
  totalEvaluationsCount: number;
  propertiesCount: number;
  notesCount: number;
  documentsCount: number;
  connectionsCount: number;
  marketCounts: MarketCount[];
  stageCounts: StageCount[];
}

export interface MarketCount {
  market: string;
  count: number;
}

export interface StageCount {
  stage: string;
  count: number;
}

/**
 * Date filter for evaluation usage
 */
export interface EvaluationUsageFilter {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}
