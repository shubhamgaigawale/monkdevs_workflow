import { AppLayout } from '@/components/layout/AppLayout'
import { useLeaveBalances, useLeaveTypes, useMyLeaveRequests } from '../hooks/useLeave'

export function LeaveManagementPageDebug() {
  const { data: balances, isLoading: balancesLoading, error: balancesError } = useLeaveBalances()
  const { data: leaveTypes, isLoading: typesLoading, error: typesError } = useLeaveTypes()
  const { data: requests, isLoading: requestsLoading, error: requestsError } = useMyLeaveRequests(0, 20)

  return (
    <AppLayout
      title="Leave Management - Debug"
      subtitle="Checking API connections"
    >
      <div className="space-y-4">
        {/* Leave Types Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">Leave Types API</h3>
          {typesLoading && <p className="text-blue-600">Loading...</p>}
          {typesError && <p className="text-red-600">Error: {(typesError as any)?.message || 'Unknown error'}</p>}
          {leaveTypes && (
            <div>
              <p className="text-green-600">✅ Success! Found {leaveTypes.length} leave types</p>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(leaveTypes, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Leave Balances Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">Leave Balances API</h3>
          {balancesLoading && <p className="text-blue-600">Loading...</p>}
          {balancesError && <p className="text-red-600">Error: {(balancesError as any)?.message || 'Unknown error'}</p>}
          {balances && (
            <div>
              <p className="text-green-600">✅ Success! Found {balances.length} balances</p>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(balances, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Leave Requests Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">Leave Requests API</h3>
          {requestsLoading && <p className="text-blue-600">Loading...</p>}
          {requestsError && <p className="text-red-600">Error: {(requestsError as any)?.message || 'Unknown error'}</p>}
          {requests && (
            <div>
              <p className="text-green-600">✅ Success! Found {requests.content?.length || 0} requests</p>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(requests, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
