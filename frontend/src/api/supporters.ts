import { apiFetch } from "./client";

export const getSupporters = () => apiFetch<Record<string, unknown>[]>("/api/tables/supporters");

// ── Donor Churn Risk ML model output ─────────────────────────────────────────
// Served by DonorChurnRiskController.cs (admin only).
// Scores are computed server-side from the logistic regression weights
// derived in ml-pipelines/donor-retention.ipynb.

export interface ChurnRiskDriver {
  feature: string
  rawKey: string
  value: number
}

export interface DonorChurnEntry {
  supporterId: number
  displayName: string
  churnProbability: number
  churnTier: 'At Risk' | 'Moderate' | 'Stable'
  churnFlag: boolean
  recencyDays: number
  frequency: number
  topRiskDriver: ChurnRiskDriver | null
}

export interface DonorChurnRisk {
  generatedAt: string
  totalScored: number
  atRiskCount: number
  moderateCount: number
  modelVersion: string
  disclaimer: string
  donors: DonorChurnEntry[]
}

export const getDonorChurnRisk = () =>
  apiFetch<DonorChurnRisk>('/api/donors/churn-risk')

export const deleteSupporter = (supporterId: number) =>
	apiFetch<{ supporter_id: number; deleted: boolean }>(`/api/tables/supporters/${supporterId}?confirm=true`, {
		method: "DELETE",
	});

// ── Donor Upgrade Potential ML model output ───────────────────────────────────
// Served by DonorUpgradePotentialController.cs (admin only).
// Scores are computed server-side from logistic regression weights
// derived from ml-pipelines/donor-upgrade-potential.ipynb.

export interface UpgradeSignal {
  feature: string
  rawKey: string
  value: number
}

export interface DonorUpgradeEntry {
  supporterId: number
  displayName: string
  upgradeProbability: number
  upgradeTier: 'HIGH' | 'MEDIUM' | 'LOW'
  upgradeFlag: boolean
  recencyDays: number
  frequency: number
  givingSlope: number
  pctIncreases: number
  topUpgradeSignal: UpgradeSignal | null
}

export interface DonorUpgradePotential {
  generatedAt: string
  totalScored: number
  highCount: number
  mediumCount: number
  modelVersion: string
  disclaimer: string
  donors: DonorUpgradeEntry[]
}

export const getDonorUpgradePotential = () =>
  apiFetch<DonorUpgradePotential>('/api/donors/upgrade-potential')
