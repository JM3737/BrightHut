import { apiFetch } from './client'

export interface DonorDonationResponse {
  donation_id: number
  amount_php: number
  amount_usd: number
}

/** Record a demo monetary gift (no payment processor); persists to SQLite as PHP. */
export function createDonorDemoDonation(payload: {
  amountUsd: number
  notes?: string
  campaignName?: string
}): Promise<DonorDonationResponse> {
  return apiFetch<DonorDonationResponse>('/api/donor/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amountUsd: payload.amountUsd,
      notes: payload.notes ?? '',
      campaignName: payload.campaignName ?? '',
    }),
  })
}
