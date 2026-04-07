import { apiFetch } from "./client";

export const getSupporters = () => apiFetch<Record<string, unknown>[]>("/api/tables/supporters");

export const deleteSupporter = (supporterId: number) =>
	apiFetch<{ supporter_id: number; deleted: boolean }>(`/api/tables/supporters/${supporterId}?confirm=true`, {
		method: "DELETE",
	});
