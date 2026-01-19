import { useCurrentSubscription, usePaymentHistory, useCancelSubscription } from '../hooks/useBilling'
import { CreditCard, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PERMISSIONS } from '@/lib/constants/permissions'
import { AppLayout } from '@/components/layout/AppLayout'

export function BillingPage() {
  // Internal permission check
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.BILLING_READ
  })

  const { data: subscription, isLoading: subLoading } = useCurrentSubscription()
  const { data: payments, isLoading: paymentsLoading } = usePaymentHistory()
  const cancelSubscription = useCancelSubscription()

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'BASIC':
        return 'text-blue-600 bg-blue-100'
      case 'PROFESSIONAL':
        return 'text-purple-600 bg-purple-100'
      case 'ENTERPRISE':
        return 'text-orange-600 bg-orange-100'
      case 'CUSTOM':
        return 'text-pink-600 bg-pink-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'COMPLETED':
        return 'text-green-600 bg-green-100'
      case 'TRIAL':
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'CANCELLED':
      case 'EXPIRED':
      case 'FAILED':
        return 'text-red-600 bg-red-100'
      case 'SUSPENDED':
      case 'REFUNDED':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'CANCELLED':
      case 'FAILED':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription?.id) return
    if (confirm('Are you sure you want to cancel your subscription?')) {
      await cancelSubscription.mutateAsync(subscription.id)
    }
  }

  // Show loading while checking permissions
  if (checkingPermissions) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Show access denied if user doesn't have permission
  if (!hasAccess) {
    return <AccessDenied requiredPermission={PERMISSIONS.BILLING_READ} />
  }

  if (subLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your subscription and view payment history
        </p>
      </div>

      {/* Current Subscription */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Current Subscription
        </h2>

        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(
                      subscription.planType
                    )}`}
                  >
                    {subscription.planType}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      subscription.status
                    )}`}
                  >
                    {getStatusIcon(subscription.status)}
                    {subscription.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {subscription.currency} {subscription.amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Billing Cycle:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {subscription.billingCycle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(subscription.startDate), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {subscription.endDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(subscription.endDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Auto Renew:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {subscription.autoRenew ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {subscription.status === 'ACTIVE' && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelSubscription.isPending}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No active subscription</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Choose a Plan
            </button>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {payments && payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900 dark:text-white">
                        {payment.transactionId || payment.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.currency} {payment.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payment.paymentMethod.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No payment history found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
