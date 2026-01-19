import { useState } from 'react'
import { UserPlus, CheckCircle2, XCircle, Eye } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTeamOnboardings, useStartOnboarding, useMyDocuments, useVerifyDocument } from '../hooks/useOnboarding'
import type { StartOnboardingRequest, DocumentVerificationRequest } from '../api/onboardingApi'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PERMISSIONS } from '@/lib/constants/permissions'

export function ManageOnboardingsPage() {
  // Internal permission check - only HR managers can access
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [showStartDialog, setShowStartDialog] = useState(false)
  const [selectedOnboardingId, setSelectedOnboardingId] = useState<string | null>(null)
  const [startForm, setStartForm] = useState<StartOnboardingRequest>({
    userId: '',
    startDate: new Date().toISOString().split('T')[0],
    templateId: undefined,
    managerId: undefined,
    buddyId: undefined,
    probationEndDate: undefined,
    notes: '',
  })

  const { data: onboardings, isLoading } = useTeamOnboardings()
  const startOnboarding = useStartOnboarding()
  const verifyDocument = useVerifyDocument()

  const handleStartOnboarding = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await startOnboarding.mutateAsync(startForm)
      setShowStartDialog(false)
      setStartForm({
        userId: '',
        startDate: new Date().toISOString().split('T')[0],
        templateId: undefined,
        managerId: undefined,
        buddyId: undefined,
        probationEndDate: undefined,
        notes: '',
      })
    } catch (error) {
      console.error('Start onboarding error:', error)
    }
  }

  const handleVerifyDocument = async (documentId: string, approved: boolean) => {
    try {
      await verifyDocument.mutateAsync({
        documentId,
        data: { approved, verificationNotes: approved ? 'Verified by HR' : 'Rejected by HR' },
      })
    } catch (error) {
      console.error('Verify document error:', error)
    }
  }

  // Show loading while checking permissions
  if (checkingPermissions) {
    return (
      <AppLayout title="Manage Onboardings" subtitle="View and manage employee onboardings">
        <div className="flex items-center justify-center h-64">
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
    return <AccessDenied requiredPermission={PERMISSIONS.HR_MANAGE} />
  }

  if (isLoading) {
    return (
      <AppLayout title="Manage Onboardings" subtitle="View and manage employee onboardings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading onboardings...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Manage Onboardings" subtitle="View and manage employee onboardings">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <Button onClick={() => setShowStartDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Start Onboarding
          </Button>
        </div>

        {/* Onboardings List */}
        {onboardings && onboardings.length > 0 ? (
          <div className="space-y-4">
            {onboardings.map((onboarding) => (
              <Card key={onboarding.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Employee: {onboarding.userId.substring(0, 8)}...</h3>
                      <p className="text-sm text-gray-600">
                        Started: {new Date(onboarding.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {Math.round(onboarding.completionPercentage || 0)}%
                        </p>
                        <p className="text-xs text-gray-600">Complete</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          onboarding.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : onboarding.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {onboarding.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${onboarding.completionPercentage || 0}%` }}
                    />
                  </div>

                  {/* Task Summary */}
                  {onboarding.tasks && onboarding.tasks.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <p className="font-semibold text-lg">
                          {onboarding.tasks.filter((t) => t.status === 'COMPLETED').length}
                        </p>
                        <p className="text-gray-600">Completed</p>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          {onboarding.tasks.filter((t) => t.status === 'PENDING').length}
                        </p>
                        <p className="text-gray-600">Pending</p>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{onboarding.tasks.length}</p>
                        <p className="text-gray-600">Total Tasks</p>
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedOnboardingId(
                          selectedOnboardingId === onboarding.id ? null : onboarding.id
                        )
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {selectedOnboardingId === onboarding.id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {selectedOnboardingId === onboarding.id && onboarding.tasks && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <h4 className="font-semibold mb-2">Tasks</h4>
                      {onboarding.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              task.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : task.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No onboardings found. Start onboarding for a new employee!</p>
            </CardContent>
          </Card>
        )}

        {/* Start Onboarding Dialog */}
        {showStartDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold">Start Onboarding</h3>
                <button
                  onClick={() => setShowStartDialog(false)}
                  className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleStartOnboarding} className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">Employee User ID *</Label>
                  <Input
                    id="userId"
                    value={startForm.userId}
                    onChange={(e) => setStartForm((prev) => ({ ...prev, userId: e.target.value }))}
                    placeholder="Enter UUID of the employee"
                    required
                  />
                  <p className="text-xs text-gray-600">Enter the UUID of the employee to onboard</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startForm.startDate}
                    onChange={(e) => setStartForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={startForm.notes}
                    onChange={(e) => setStartForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowStartDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={startOnboarding.isPending}>
                    {startOnboarding.isPending ? 'Starting...' : 'Start Onboarding'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
