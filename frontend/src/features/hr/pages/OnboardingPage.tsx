import { useState } from 'react'
import { CheckCircle2, Circle, FileText, Laptop } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useMyOnboarding, useCompleteTask, useMyDocuments, useMyEquipment } from '../hooks/useOnboarding'

export function OnboardingPage() {
  const { data: onboarding, isLoading } = useMyOnboarding()
  const { data: documents } = useMyDocuments()
  const { data: equipment } = useMyEquipment()
  const completeTask = useCompleteTask()

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask.mutateAsync({ taskId, data: {} })
    } catch (error) {
      console.error('Complete task error:', error)
    }
  }

  if (isLoading) {
    return (
      <AppLayout title="My Onboarding" subtitle="Track your onboarding progress">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading onboarding data...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!onboarding) {
    return (
      <AppLayout title="My Onboarding" subtitle="Track your onboarding progress">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No onboarding process found for your account.</p>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  const progressPercentage = onboarding.completionPercentage || 0

  return (
    <AppLayout title="My Onboarding" subtitle="Track your onboarding progress">
      <div className="space-y-6">
        {/* Progress Overview */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Onboarding Progress</h3>
                  <p className="text-sm text-gray-600">
                    {onboarding.tasks?.filter((t) => t.status === 'COMPLETED').length || 0} of{' '}
                    {onboarding.tasks?.length || 0} tasks completed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{Math.round(progressPercentage)}%</p>
                  <p className="text-xs text-gray-600">Complete</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Key Dates */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-600">Start Date</p>
                  <p className="font-medium">{new Date(onboarding.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Expected Completion</p>
                  <p className="font-medium">
                    {new Date(onboarding.expectedCompletionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Checklist */}
        {onboarding.tasks && onboarding.tasks.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Onboarding Tasks
              </h3>
              <div className="space-y-2">
                {onboarding.tasks.map((task) => {
                  const isCompleted = task.status === 'COMPLETED'
                  const isPending = task.status === 'PENDING'

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isCompleted
                          ? 'bg-green-50 border-green-200'
                          : isPending
                          ? 'bg-white border-gray-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className={`font-medium ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-xs text-gray-600">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                            {task.assignedToRole && (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-700">
                                {task.assignedToRole}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!isCompleted && task.assignedToRole === 'EMPLOYEE' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={completeTask.isPending}
                        >
                          {completeTask.isPending ? 'Completing...' : 'Mark Complete'}
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {documents && documents.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                My Documents
              </h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{doc.documentName}</p>
                      <p className="text-sm text-gray-600">{doc.documentType}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        doc.status === 'VERIFIED'
                          ? 'bg-green-100 text-green-800'
                          : doc.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {doc.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Equipment */}
        {equipment && equipment.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Laptop className="h-5 w-5" />
                Assigned Equipment
              </h3>
              <div className="space-y-2">
                {equipment.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex-1">
                      <p className="font-medium">{item.equipmentName}</p>
                      <p className="text-sm text-gray-600">
                        {item.equipmentType} {item.serialNumber && `• S/N: ${item.serialNumber}`}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Badge */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="text-lg font-semibold capitalize">{onboarding.status.replace('_', ' ')}</p>
              </div>
              {onboarding.probationEndDate && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Probation Ends</p>
                  <p className="text-lg font-semibold">
                    {new Date(onboarding.probationEndDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
