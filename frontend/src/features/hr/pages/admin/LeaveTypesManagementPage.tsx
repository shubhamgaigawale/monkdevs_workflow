import { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrServiceAPI } from '@/lib/api/services'
import { toast } from 'sonner'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PERMISSIONS } from '@/lib/constants/permissions'

interface LeaveType {
  id: string
  name: string
  code: string
  description?: string
  daysPerYear: number
  allowCarryForward: boolean
  maxCarryForwardDays?: number
  minNoticeDays: number
  maxConsecutiveDays?: number
  isPaid: boolean
  color?: string
  status: string
  isSystemDefined: boolean
}

interface LeaveTypeForm {
  name: string
  code: string
  description: string
  daysPerYear: string
  allowCarryForward: boolean
  maxCarryForwardDays: string
  minNoticeDays: string
  maxConsecutiveDays: string
  isPaid: boolean
  color: string
}

export function LeaveTypesManagementPage() {
  // Permission check
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [showDialog, setShowDialog] = useState(false)
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null)
  const [form, setForm] = useState<LeaveTypeForm>({
    name: '',
    code: '',
    description: '',
    daysPerYear: '',
    allowCarryForward: false,
    maxCarryForwardDays: '',
    minNoticeDays: '0',
    maxConsecutiveDays: '',
    isPaid: true,
    color: '#3B82F6'
  })

  const queryClient = useQueryClient()

  // Fetch leave types
  const { data: leaveTypes, isLoading } = useQuery({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const response = await hrServiceAPI.get('/api/leave/types')
      return response.data.data
    }
  })

  // Create leave type mutation
  const createLeaveType = useMutation({
    mutationFn: async (data: any) => {
      const response = await hrServiceAPI.post('/api/leave/types', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-types'] })
      toast.success('Leave type created successfully')
      handleCloseDialog()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create leave type')
    }
  })

  const handleOpenCreate = () => {
    setEditingLeaveType(null)
    setForm({
      name: '',
      code: '',
      description: '',
      daysPerYear: '',
      allowCarryForward: false,
      maxCarryForwardDays: '',
      minNoticeDays: '0',
      maxConsecutiveDays: '',
      isPaid: true,
      color: '#3B82F6'
    })
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingLeaveType(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: form.name,
      code: form.code.toUpperCase(),
      description: form.description || null,
      daysPerYear: parseFloat(form.daysPerYear),
      allowCarryForward: form.allowCarryForward,
      maxCarryForwardDays: form.maxCarryForwardDays ? parseFloat(form.maxCarryForwardDays) : null,
      minNoticeDays: parseInt(form.minNoticeDays),
      maxConsecutiveDays: form.maxConsecutiveDays ? parseInt(form.maxConsecutiveDays) : null,
      isPaid: form.isPaid,
      color: form.color
    }

    createLeaveType.mutate(payload)
  }

  // Permission check loading
  if (checkingPermissions) {
    return (
      <AppLayout title="Leave Types" subtitle="Manage leave types">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!hasAccess) {
    return <AccessDenied requiredPermission={PERMISSIONS.HR_MANAGE} />
  }

  return (
    <AppLayout title="Leave Types" subtitle="Manage leave types and configurations">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Configure leave types, allocations, and rules for your organization
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Leave Type
          </Button>
        </div>

        {/* Leave Types List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : leaveTypes && leaveTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveTypes.map((leaveType: LeaveType) => (
              <Card key={leaveType.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {leaveType.color && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: leaveType.color }}
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{leaveType.name}</h3>
                        <p className="text-sm text-gray-500">{leaveType.code}</p>
                      </div>
                    </div>
                    {leaveType.isSystemDefined && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        System
                      </span>
                    )}
                  </div>

                  {leaveType.description && (
                    <p className="text-sm text-gray-600 mb-4">{leaveType.description}</p>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days per year:</span>
                      <span className="font-medium">{leaveType.daysPerYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{leaveType.isPaid ? 'Paid' : 'Unpaid'}</span>
                    </div>
                    {leaveType.allowCarryForward && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Carry forward:</span>
                        <span className="font-medium">{leaveType.maxCarryForwardDays} days</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Notice required:</span>
                      <span className="font-medium">{leaveType.minNoticeDays} days</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        leaveType.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {leaveType.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No leave types configured</p>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Leave Type
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        {showDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {editingLeaveType ? 'Edit Leave Type' : 'Create New Leave Type'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Leave Type Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Paternity Leave"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., PL"
                      required
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of this leave type..."
                    rows={3}
                  />
                </div>

                {/* Days Configuration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="daysPerYear">Days per Year *</Label>
                    <Input
                      id="daysPerYear"
                      type="number"
                      step="0.5"
                      min="0"
                      value={form.daysPerYear}
                      onChange={(e) => setForm({ ...form, daysPerYear: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minNoticeDays">Min Notice Days *</Label>
                    <Input
                      id="minNoticeDays"
                      type="number"
                      min="0"
                      value={form.minNoticeDays}
                      onChange={(e) => setForm({ ...form, minNoticeDays: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxConsecutiveDays">Max Consecutive Days</Label>
                    <Input
                      id="maxConsecutiveDays"
                      type="number"
                      min="1"
                      value={form.maxConsecutiveDays}
                      onChange={(e) => setForm({ ...form, maxConsecutiveDays: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPaid"
                      checked={form.isPaid}
                      onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isPaid" className="cursor-pointer">
                      Paid Leave
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allowCarryForward"
                      checked={form.allowCarryForward}
                      onChange={(e) => setForm({ ...form, allowCarryForward: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="allowCarryForward" className="cursor-pointer">
                      Allow Carry Forward
                    </Label>
                  </div>

                  {form.allowCarryForward && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="maxCarryForwardDays">Max Carry Forward Days</Label>
                      <Input
                        id="maxCarryForwardDays"
                        type="number"
                        step="0.5"
                        min="0"
                        value={form.maxCarryForwardDays}
                        onChange={(e) => setForm({ ...form, maxCarryForwardDays: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLeaveType.isPending}>
                    {createLeaveType.isPending ? 'Creating...' : 'Create Leave Type'}
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
