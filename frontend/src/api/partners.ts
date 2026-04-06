import { apiFetch } from "./client";

export const getPartners = () => apiFetch<Record<string, unknown>[]>("/api/tables/partners");
export const getPartnerAssignments = () => apiFetch<Record<string, unknown>[]>("/api/tables/partner_assignments");
