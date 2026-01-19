import { useState } from 'react'
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrServiceAPI } from '@/lib/api/services'
import { toast } from 'sonner'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PERMISSIONS } from '@/lib/constants/permissions'

interface SalaryComponent {
  id: string
  name: string
  code: string
  componentType: string
  calculationType: string
  percentage?: number
  isTaxable: boolean
  isFixed: boolean
  displayOrder: number
  status: string
}

interface ComponentForm {
  name: string
  code: string
  componentType: string
  calculationType: string
  percentage: string
  isTaxable: boolean
  isFixed: boolean
  displayOrder: string
}

export function SalaryComponentsPage() {
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [showDialog, setShowDialog] = useState(false)
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null)
  const [form, setForm] = useState<ComponentForm>({
    name: '',
    code: '',
    componentType: 'EARNING',
    calculationType: 'PERCENTAGE',
    percentage: '',
    isTaxable: true,
    isFixed: false,
    displayOrder: '1'
  })

  const queryClient = useQueryClient()

  // Fetch components
  const { data: components, isLoading: loadingComponents } = useQuery({
    queryKey: ['salary-components'],
    queryFn: async () => {
      const response = await hrServiceAPI.get('/api/salary/components')
      return response.data.data
    }
  })

  // Create/Update component mutation
  const saveComponent = useMutation({
    mutationFn: async (data: any) => {
      if (editingComponent) {
        const response = await hrServiceAPI.put(`/api/salary/components/${editingComponent.id}`, data)
        return response.data.data
      } else {
        const response = await hrServiceAPI.post('/api/salary/components', data)
        return response.data.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-components'] })
      toast.success(editingComponent ? 'Component updated successfully' : 'Component created successfully')
      handleCloseDialog()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save component')
    }
  })

  // Delete component mutation
  const deleteComponent = useMutation({
    mutationFn: async (id: string) => {
      await hrServiceAPI.delete(`/api/salary/components/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-components'] })
      toast.success('Component deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete component')
    }
  })

  const handleOpenCreate = () => {
    setEditingComponent(null)
    setForm({
      name: '',
      code: '',
      componentType: 'EARNING',
      calculationType: 'PERCENTAGE',
      percentage: '',
      isTaxable: true,
      isFixed: false,
      displayOrder: '1'
    })
    setShowDialog(true)
  }

  const handleOpenEdit = (component: SalaryComponent) => {
    setEditingComponent(component)
    setForm({
      name: component.name,
      code: component.code,
      componentType: component.componentType,
      calculationType: component.calculationType,
      percentage: component.percentage?.toString() || '',
      isTaxable: component.isTaxable,
      isFixed: component.isFixed,
      displayOrder: component.displayOrder.toString()
    })
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingComponent(null)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteComponent.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: form.name,
      code: form.code.toUpperCase(),
      componentType: form.componentType,
      calculationType: form.calculationType,
      percentage: form.percentage ? parseFloat(form.percentage) : null,
      isTaxable: form.isTaxable,
      isFixed: form.isFixed,
      displayOrder: parseInt(form.displayOrder)
    }

    saveComponent.mutate(payload)
  }

  if (checkingPermissions) {
    return (
      <AppLayout title="Salary Components" subtitle="Manage salary components">
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

  const earnings = components?.filter((c: SalaryComponent) => c.componentType === 'EARNING') || []
  const deductions = components?.filter((c: SalaryComponent) => c.componentType === 'DEDUCTION') || []

  return (
    <AppLayout title="Salary Components" subtitle="Manage salary components and configurations">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Configure salary components used in salary structures
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </Button>
        </div>

        {/* Stats */}
        {components && components.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{earnings.length}</p>
                    <p className="text-sm text-gray-600">Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{deductions.length}</p>
                    <p className="text-sm text-gray-600">Deductions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold">₹</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{components.length}</p>
                    <p className="text-sm text-gray-600">Total Components</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loadingComponents ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : components && components.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-lg">Earnings</h3>
                </div>

                {earnings.length > 0 ? (
                  <div className="space-y-2">
                    {earnings.map((component: SalaryComponent) => (
                      <div
                        key={component.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{component.name}</h4>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {component.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                            <span>{component.calculationType}</span>
                            {component.percentage && <span>{component.percentage}%</span>}
                            {component.isTaxable && (
                              <span className="text-orange-600">Taxable</span>
                            )}
                            {component.isFixed && (
                              <span className="text-blue-600">Fixed</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(component)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(component.id, component.name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No earnings components</p>
                )}
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-lg">Deductions</h3>
                </div>

                {deductions.length > 0 ? (
                  <div className="space-y-2">
                    {deductions.map((component: SalaryComponent) => (
                      <div
                        key={component.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{component.name}</h4>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {component.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                            <span>{component.calculationType}</span>
                            {component.percentage && <span>{component.percentage}%</span>}
                            {component.isFixed && (
                              <span className="text-blue-600">Fixed</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(component)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(component.id, component.name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No deduction components</p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No salary components configured</p>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Component
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        {showDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {editingComponent ? 'Edit Component' : 'Add New Component'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Component Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Basic Salary, HRA"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., BASIC, HRA"
                      required
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="componentType">Type *</Label>
                    <Select
                      value={form.componentType}
                      onValueChange={(value) => setForm({ ...form, componentType: value })}
                    >
                      <SelectTrigger id="componentType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EARNING">Earning</SelectItem>
                        <SelectItem value="DEDUCTION">Deduction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calculationType">Calculation Type *</Label>
                    <Select
                      value={form.calculationType}
                      onValueChange={(value) => setForm({ ...form, calculationType: value })}
                    >
                      <SelectTrigger id="calculationType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                        <SelectItem value="COMPUTED">Computed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {form.calculationType === 'PERCENTAGE' && (
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Default Percentage (%)</Label>
                    <Input
                      id="percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={form.percentage}
                      onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                      placeholder="e.g., 40"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order *</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    min="1"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-3">
                  {form.componentType === 'EARNING' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isTaxable"
                        checked={form.isTaxable}
                        onChange={(e) => setForm({ ...form, isTaxable: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="isTaxable" className="cursor-pointer">
                        Taxable Component
                      </Label>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFixed"
                      checked={form.isFixed}
                      onChange={(e) => setForm({ ...form, isFixed: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isFixed" className="cursor-pointer">
                      Fixed Component (same for all employees)
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveComponent.isPending}>
                    {saveComponent.isPending
                      ? editingComponent
                        ? 'Updating...'
                        : 'Creating...'
                      : editingComponent
                      ? 'Update Component'
                      : 'Create Component'}
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
