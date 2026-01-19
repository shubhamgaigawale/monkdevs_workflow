import { useQuery } from '@tanstack/react-query'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, XCircle, Clock } from 'lucide-react'
import api from '@/lib/api/services'

interface LicenseInfo {
  planName: string
  expiryDate: string
  daysUntilExpiry: number
  userLimit: number
  currentUsers: number
  enabledModules: string[]
  status: 'ACTIVE' | 'GRACE_PERIOD' | 'EXPIRED'
  gracePeriodActive: boolean
  gracePeriodDaysRemaining: number
}

/**
 * Shows a warning banner when the license is expiring soon or has expired
 * Displays different messages based on the status (expiring soon, grace period, expired)
 */
export function LicenseExpiryBanner() {
  const { data: licenseInfo } = useQuery<LicenseInfo>({
    queryKey: ['license-info'],
    queryFn: async () => {
      const response = await api.get('/api/license/info')
      return response.data.data
    },
    refetchInterval: 1000 * 60 * 60, // Check every hour
    retry: false, // Don't retry if license info not found
  })

  if (!licenseInfo) {
    return null // No license info available (might be super admin or license not configured)
  }

  // Don't show if more than 30 days until expiry
  if (licenseInfo.status === 'ACTIVE' && licenseInfo.daysUntilExpiry > 30) {
    return null
  }

  // License expired (beyond grace period)
  if (licenseInfo.status === 'EXPIRED' && !licenseInfo.gracePeriodActive) {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Subscription Expired</AlertTitle>
        <AlertDescription>
          Your subscription has expired. Some features may be disabled. Please contact your
          administrator to renew your subscription immediately.
        </AlertDescription>
      </Alert>
    )
  }

  // License expired but in grace period
  if (licenseInfo.status === 'GRACE_PERIOD' || (licenseInfo.status === 'EXPIRED' && licenseInfo.gracePeriodActive)) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Subscription Expired - Grace Period Active</AlertTitle>
        <AlertDescription>
          Your subscription expired on {new Date(licenseInfo.expiryDate).toLocaleDateString()}. You
          have{' '}
          <strong>
            {licenseInfo.gracePeriodDaysRemaining} day
            {licenseInfo.gracePeriodDaysRemaining !== 1 ? 's' : ''}
          </strong>{' '}
          remaining in the grace period before features are disabled. Please contact your
          administrator to renew immediately.
        </AlertDescription>
      </Alert>
    )
  }

  // License expiring soon (within 30 days)
  if (licenseInfo.daysUntilExpiry <= 30 && licenseInfo.daysUntilExpiry > 0) {
    const severity = licenseInfo.daysUntilExpiry <= 7 ? 'destructive' : 'default'
    const Icon = licenseInfo.daysUntilExpiry <= 7 ? AlertTriangle : Clock

    return (
      <Alert variant={severity} className="mb-4 border-orange-500">
        <Icon className="h-4 w-4 text-orange-500" />
        <AlertTitle>Subscription Expiring Soon</AlertTitle>
        <AlertDescription>
          Your <strong>{licenseInfo.planName}</strong> subscription will expire in{' '}
          <strong>
            {licenseInfo.daysUntilExpiry} day
            {licenseInfo.daysUntilExpiry !== 1 ? 's' : ''}
          </strong>{' '}
          (on {new Date(licenseInfo.expiryDate).toLocaleDateString()}). Please contact your
          administrator to renew your subscription and avoid service interruption.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
