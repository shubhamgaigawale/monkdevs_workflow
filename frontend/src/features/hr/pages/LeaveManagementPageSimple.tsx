import { AppLayout } from '@/components/layout/AppLayout'

export function LeaveManagementPageSimple() {
  return (
    <AppLayout
      title="Leave Management"
      subtitle="Manage your leave requests and balances"
    >
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Leave Management Page</h2>
        <p className="text-gray-600">
          This is a test version to verify the page renders.
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="font-semibold">If you can see this, the page is rendering!</p>
        </div>
      </div>
    </AppLayout>
  )
}
