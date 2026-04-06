import { apiFetch } from "./client";

export const getPublicImpactSnapshots = () => apiFetch<Record<string, unknown>[]>("/api/tables/public_impact_snapshots");
export const getSafehouseMonthlyMetrics = () => apiFetch<Record<string, unknown>[]>("/api/tables/safehouse_monthly_metrics");
