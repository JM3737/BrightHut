import { apiFetch } from "./client";

export const getResidents = () => apiFetch<Record<string, unknown>[]>("/api/tables/residents");
export const getProcessRecordings = () => apiFetch<Record<string, unknown>[]>("/api/tables/process_recordings");
export const getHomeVisitations = () => apiFetch<Record<string, unknown>[]>("/api/tables/home_visitations");
export const getEducationRecords = () => apiFetch<Record<string, unknown>[]>("/api/tables/education_records");
export const getHealthRecords = () => apiFetch<Record<string, unknown>[]>("/api/tables/health_wellbeing_records");
export const getInterventionPlans = () => apiFetch<Record<string, unknown>[]>("/api/tables/intervention_plans");
export const getIncidentReports = () => apiFetch<Record<string, unknown>[]>("/api/tables/incident_reports");
