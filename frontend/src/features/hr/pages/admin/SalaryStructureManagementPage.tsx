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

interface SalaryComponent {
  id: string
  name: string
  code: string
  componentType: string
}

interface SalaryStructureComponent {
  componentId: string
  componentName?: string
  percentage?: number
  fixedAmount?: number
}

interface SalaryStructure {
  id: string
  name: string
  description?: string
  effectiveFrom: string
  effectiveTo?: string
  status: string
  components: SalaryStructureComponent[]
}

interface StructureForm {
  name: string
  description: string
  effectiveFrom: string
  components: SalaryStructureComponent[]
}

export function SalaryStructureManagementPage() {
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [showDialog, setShowDialog] = useState(false)
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null)
  const [form, setForm] = useState<StructureForm>({
    name: '',
    description: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    components: []
  })

  const queryClient = useQueryClient()

  // Fetch salary structures
  const { data: structures, isLoading: loadingStructures } = useQuery({
    queryKey: ['salary-structures'],
    queryFn: async () => {
      const response = await hrServiceAPI.get('/api/salary/structures')
      return response.data.data
    }
  })

  // Fetch salary components
  const { data: components } = useQuery({
    queryKey: ['salary-components'],
    queryFn: async () => {
      const response = await hrServiceAPI.get('/api/salary/components')
      return response.data.data
    }
  })

  // Create structure mutation
  const createStructure = useMutation({
    mutationFn: async (data: any) => {
      const response = await hrServiceAPI.post('/api/salary/structures', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary-structures'] })
      toast.success('Salary structure created successfully')
      handleCloseDialog()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create salary structure')
    }
  })

  const handleOpenCreate = () => {
    setEditingStructure(null)
    setForm({
      name: '',
      description: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      components: []
    })
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingStructure(null)
  }

  const handleAddComponent = (componentId: string) => {
    const component = components?.find((c: SalaryComponent) => c.id === componentId)
    if (!component) return

    if (form.components.some((c) => c.componentId === componentId)) {
      toast.error('Component already added')
      return
    }

    setForm({
      ...form,
      components: [
        ...form.components,
        {
          componentId,
          componentName: component.name,
          percentage: 0,
          fixedAmount: 0
        }
      ]
    })
  }

  const handleUpdateComponent = (index: number, field: string, value: number) => {
    const updated = [...form.components]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setForm({ ...form, components: updated })
  }

  const handleRemoveComponent = (index: number) => {
    setForm({
      ...form,
      components: form.components.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (form.components.length === 0) {
      toast.error('Please add at least one component')
      return
    }

    const payload = {
      name: form.name,
      description: form.description || null,
      effectiveFrom: form.effectiveFrom,
      components: form.components.map((c) => ({
        componentId: c.componentId,
        percentage: c.percentage || null,
        fixedAmount: c.fixedAmount || null
      }))
    }

    createStructure.mutate(payload)
  }

  const getTotalPercentage = () => {
    return form.components.reduce((sum, c) => sum + (c.percentage || 0), 0)
  }

  if (checkingPermissions) {
    return (
      <AppLayout title="Salary Structures" subtitle="Manage salary structures">
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
    <AppLayout title="Salary Structures" subtitle="Manage salary structures and components">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Configure salary structures with different component breakups
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Structure
          </Button>
        </div>

        {/* Structures List */}
        {loadingStructures ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : structures && structures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {structures.map((structure: SalaryStructure) => (
              <Card key={structure.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{structure.name}</h3>
                      {structure.description && (
                        <p className="text-sm text-gray-600 mt-1">{structure.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        structure.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {structure.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effective From:</span>
                      <span className="font-medium">{structure.effectiveFrom}</span>
                    </div>
                    {structure.effectiveTo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Effective To:</span>
                        <span className="font-medium">{structure.effectiveTo}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Components:</span>
                      <span className="font-medium">{structure.components?.length || 0}</span>
                    </div>
                  </div>

                  {structure.components && structure.components.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Component Breakdown:</p>
                      <div className="space-y-1">
                        {structure.components.map((comp, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span>{comp.componentName}</span>
                            <span className="text-gray-600">
                              {comp.percentage
                                ? `${comp.percentage}%`
                                : comp.fixedAmount
                                ? `₹${comp.fixedAmount}`
                                : '-'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No salary structures configured</p>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Structure
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Dialog */}
        {showDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {editingStructure ? 'Edit Salary Structure' : 'Create New Salary Structure'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Structure Name *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Standard Structure, Executive Structure"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Brief description of this salary structure..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effectiveFrom">Effective From *</Label>
                    <Input
                      id="effectiveFrom"
                      type="date"
                      value={form.effectiveFrom}
                      onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Components Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Salary Components</Label>
                    <select
                      className="border rounded px-3 py-1 text-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddComponent(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    >
                      <option value="">+ Add Component</option>
                      {components?.map((comp: SalaryComponent) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name} ({comp.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {form.components.length > 0 ? (
                    <div className="border rounded-lg divide-y">
                      {form.components.map((comp, index) => (
                        <div key={index} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium">{comp.componentName}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveComponent(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Percentage (%)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={comp.percentage || ''}
                                onChange={(e) =>
                                  handleUpdateComponent(
                                    index,
                                    'percentage',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="e.g., 40"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Fixed Amount (₹)</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={comp.fixedAmount || ''}
                                onChange={(e) =>
                                  handleUpdateComponent(
                                    index,
                                    'fixedAmount',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="e.g., 50000"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="p-3 bg-gray-50 flex justify-between items-center">
                        <span className="text-sm font-medium">Total Percentage</span>
                        <span
                          className={`font-semibold ${
                            getTotalPercentage() === 100
                              ? 'text-green-600'
                              : 'text-orange-600'
                          }`}
                        >
                          {getTotalPercentage()}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500">
                        No components added yet. Add components from the dropdown above.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createStructure.isPending}>
                    {createStructure.isPending ? 'Creating...' : 'Create Structure'}
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
