import { useState } from 'react'
import { Plus, Edit, Trash2, Calendar } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrServiceAPI } from '@/lib/api/services'
import { toast } from 'sonner'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PERMISSIONS } from '@/lib/constants/permissions'

interface Holiday {
  id: string
  name: string
  date: string
  type: string
  description?: string
  isOptional: boolean
}

interface HolidayForm {
  name: string
  date: string
  type: string
  description: string
  isOptional: boolean
}

export function ManageHolidaysPage() {
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [showDialog, setShowDialog] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [form, setForm] = useState<HolidayForm>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: 'PUBLIC',
    description: '',
    isOptional: false
  })
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  const queryClient = useQueryClient()

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i)

  // Fetch holidays
  const { data: holidays, isLoading: loadingHolidays } = useQuery({
    queryKey: ['holidays', selectedYear],
    queryFn: async () => {
      const response = await hrServiceAPI.get('/api/leave/holidays', {
        params: { year: selectedYear }
      })
      return response.data.data
    }
  })

  // Create/Update holiday mutation
  const saveHoliday = useMutation({
    mutationFn: async (data: any) => {
      if (editingHoliday) {
        const response = await hrServiceAPI.put(`/api/leave/holidays/${editingHoliday.id}`, data)
        return response.data.data
      } else {
        const response = await hrServiceAPI.post('/api/leave/holidays', data)
        return response.data.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      toast.success(editingHoliday ? 'Holiday updated successfully' : 'Holiday added successfully')
      handleCloseDialog()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save holiday')
    }
  })

  // Delete holiday mutation
  const deleteHoliday = useMutation({
    mutationFn: async (id: string) => {
      await hrServiceAPI.delete(`/api/leave/holidays/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] })
      toast.success('Holiday deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete holiday')
    }
  })

  const handleOpenCreate = () => {
    setEditingHoliday(null)
    setForm({
      name: '',
      date: new Date().toISOString().split('T')[0],
      type: 'PUBLIC',
      description: '',
      isOptional: false
    })
    setShowDialog(true)
  }

  const handleOpenEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday)
    setForm({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      description: holiday.description || '',
      isOptional: holiday.isOptional
    })
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    setEditingHoliday(null)
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteHoliday.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: form.name,
      date: form.date,
      type: form.type,
      description: form.description || null,
      isOptional: form.isOptional
    }

    saveHoliday.mutate(payload)
  }

  const groupHolidaysByMonth = (holidays: Holiday[]) => {
    const grouped: { [key: string]: Holiday[] } = {}

    holidays?.forEach((holiday) => {
      const month = new Date(holiday.date).toLocaleString('default', { month: 'long' })
      if (!grouped[month]) {
        grouped[month] = []
      }
      grouped[month].push(holiday)
    })

    return grouped
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PUBLIC':
        return 'bg-blue-100 text-blue-800'
      case 'FESTIVAL':
        return 'bg-purple-100 text-purple-800'
      case 'NATIONAL':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (checkingPermissions) {
    return (
      <AppLayout title="Manage Holidays" subtitle="Manage company holidays">
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

  const groupedHolidays = groupHolidaysByMonth(holidays || [])

  return (
    <AppLayout title="Manage Holidays" subtitle="Manage company holiday calendar">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Label htmlFor="year">Year:</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Holiday
          </Button>
        </div>

        {/* Stats */}
        {holidays && holidays.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{holidays.length}</p>
                    <p className="text-sm text-gray-600">Total Holidays</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {holidays.filter((h: Holiday) => !h.isOptional).length}
                    </p>
                    <p className="text-sm text-gray-600">Mandatory</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {holidays.filter((h: Holiday) => h.isOptional).length}
                    </p>
                    <p className="text-sm text-gray-600">Optional</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Holidays List */}
        {loadingHolidays ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : holidays && holidays.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedHolidays).map(([month, monthHolidays]) => (
              <Card key={month}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">{month}</h3>
                  <div className="space-y-3">
                    {monthHolidays.map((holiday: Holiday) => (
                      <div
                        key={holiday.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{holiday.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(holiday.type)}`}>
                              {holiday.type}
                            </span>
                            {holiday.isOptional && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                                Optional
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              {new Date(holiday.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          {holiday.description && (
                            <p className="text-sm text-gray-600 mt-2">{holiday.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(holiday)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(holiday.id, holiday.name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No holidays configured for {selectedYear}</p>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Holiday
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
                  {editingHoliday ? 'Edit Holiday' : 'Add New Holiday'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Holiday Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Diwali, Christmas, Independence Day"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select value={form.type} onValueChange={(value) => setForm({ ...form, type: value })}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUBLIC">Public Holiday</SelectItem>
                        <SelectItem value="FESTIVAL">Festival</SelectItem>
                        <SelectItem value="NATIONAL">National Holiday</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description of the holiday..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isOptional"
                    checked={form.isOptional}
                    onChange={(e) => setForm({ ...form, isOptional: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isOptional" className="cursor-pointer">
                    Optional Holiday (employees can choose to work)
                  </Label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveHoliday.isPending}>
                    {saveHoliday.isPending
                      ? editingHoliday
                        ? 'Updating...'
                        : 'Adding...'
                      : editingHoliday
                      ? 'Update Holiday'
                      : 'Add Holiday'}
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
