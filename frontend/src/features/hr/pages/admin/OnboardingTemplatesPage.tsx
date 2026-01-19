import { useState } from 'react'
import { Plus, Edit, Trash2, CheckCircle, Clock, ListChecks } from 'lucide-react'
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

interface OnboardingTemplate {
  id: string
  name: string
  description: string
  durationDays: number
  isDefault: boolean
  status: string
  taskCount?: number
}

interface TemplateForm {
  name: string
  description: string
  durationDays: string
  isDefault: boolean
}

export function OnboardingTemplatesPage() {
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [showDialog, setShowDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<OnboardingTemplate | null>(null)
  const [form, setForm] = useState<TemplateForm>({
    name: '',
    description: '',
    durationDays: '90',
    isDefault: false
  })

  const queryClient = useQueryClient()

  // Fetch templates
  const { data: templates, isLoading: loadingTemplates } = useQuery({
    queryKey: ['onboarding-templates'],
    queryFn: async () => {
      const response = await hrServiceAPI.get('/api/onboarding/templates')
      return response.data.data
    }
  })

  // Create/Update template mutation
  const saveTemplate = useMutation({
    mutationFn: async (data: any) => {
      if (editingTemplate) {
        const response = await hrServiceAPI.put(`/api/onboarding/templates/${editingTemplate.id}`, data)
        return response.data.data
      } else {
        const response = await hrServiceAPI.post('/api/onboarding/templates', data)
        return response.data.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-templates'] })
      toast.success(editingTemplate ? 'Template updated successfully' : 'Template created successfully')
      handleCloseDialog()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save template')
    }
  })

  // Delete template mutation
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      await hrServiceAPI.delete(`/api/onboarding/templates/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-templates'] })
      toast.success('Template deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete template')
    }
  })

  const handleOpenCreate = () => {
    setEditingTemplate(null)
    setForm({
      name: '',
      description: '',
      durationDays: '90',
      isDefault: false
    })
    setShowDialog(true)
  }

  const handleOpenEdit = (template: OnboardingTemplate) => {
    setEditingTemplate(template)
    setForm({
      name: template.name,
      description: template.description,
      durationDays: template.durationDays.toString(),
      isDefault: template.isDefault
    })
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingTemplate(null)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete template "${name}"?`)) {
      deleteTemplate.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: form.name,
      description: form.description,
      durationDays: parseInt(form.durationDays),
      isDefault: form.isDefault
    }

    saveTemplate.mutate(payload)
  }

  if (checkingPermissions) {
    return (
      <AppLayout title="Onboarding Templates" subtitle="Manage onboarding templates">
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

  const activeTemplates = templates?.filter((t: OnboardingTemplate) => t.status === 'ACTIVE') || []
  const defaultTemplate = templates?.find((t: OnboardingTemplate) => t.isDefault)

  return (
    <AppLayout title="Onboarding Templates" subtitle="Manage onboarding workflows and checklists">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Create and manage templates for employee onboarding process
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Stats */}
        {templates && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ListChecks className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{templates.length}</p>
                    <p className="text-sm text-gray-600">Total Templates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{activeTemplates.length}</p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {defaultTemplate?.durationDays || 0}
                    </p>
                    <p className="text-sm text-gray-600">Default Duration (days)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 font-bold">★</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{defaultTemplate ? '1' : '0'}</p>
                    <p className="text-sm text-gray-600">Default Template</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {loadingTemplates ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : templates && templates.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Template Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tasks
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {templates.map((template: OnboardingTemplate) => (
                      <tr key={template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{template.name}</span>
                            {template.isDefault && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {template.description}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {template.durationDays} days
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded ${
                              template.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {template.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {template.taskCount || 0} tasks
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(template)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            {!template.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(template.id, template.name)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No onboarding templates created yet</p>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Template
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
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Standard Onboarding, Manager Onboarding"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of this onboarding template"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duration (days) *</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min="1"
                    max="365"
                    value={form.durationDays}
                    onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Total duration for completing all onboarding tasks
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={form.isDefault}
                    onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">
                    Set as default template
                  </Label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveTemplate.isPending}>
                    {saveTemplate.isPending
                      ? editingTemplate
                        ? 'Updating...'
                        : 'Creating...'
                      : editingTemplate
                      ? 'Update Template'
                      : 'Create Template'}
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
