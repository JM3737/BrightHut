import { useEffect, useReducer } from 'react'
import DonationsDashboard from '../pages/DonationsDashboard'
import MyContributions from '../pages/MyContributions'
import { getStoredRole, isStaffLikeRole } from '../lib/storedRole'

/**
 * Staff/admin see org-wide donation overview; donors see personal contributions.
 * Re-renders on auth-change / cross-tab storage so role updates aren't stuck on an old branch.
 */
export default function DonorsLanding() {
  const [, bump] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    const on = () => bump()
    window.addEventListener('storage', on)
    window.addEventListener('auth-change', on)
    return () => {
      window.removeEventListener('storage', on)
      window.removeEventListener('auth-change', on)
    }
  }, [])

  const role = getStoredRole()
  return isStaffLikeRole(role) ? <DonationsDashboard /> : <MyContributions />
}
