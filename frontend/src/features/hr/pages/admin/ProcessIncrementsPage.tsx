import { useState } from 'react'
import { TrendingUp, Users, DollarSign, Calendar, Search } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrServiceAPI } from '@/lib/api/services'
import { toast } from 'sonner'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PERMISSIONS } from '@/lib/constants/permissions'

interface Employee {
  id: string
  name: string
  employeeId: string
  department: string
  designation: string
  currentCTC: number
  joiningDate: string
  lastIncrementDate?: string
}

interface IncrementForm {
  userId: string
  incrementType: string
  incrementPercentage: string
  incrementAmount: string
  effectiveFrom: string
  reason: string
  newCTC: string
}

export function ProcessIncrementsPage() {
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [showIncrementDialog, setShowIncrementDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [form, setForm] = useState<IncrementForm>({
    userId: '',
    incrementType: 'PERCENTAGE',
    incrementPercentage: '',
    incrementAmount: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    reason: '',
    newCTC: ''
  })

  const queryClient = useQueryClient()

  // Fetch employees
  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees-for-increment'],
    queryFn: async () => {
      const response = await hrServiceAPI.get('/api/salary/employees')
      return response.data.data
    }
  })

  // Process increment mutation
  const processIncrement = useMutation({
    mutationFn: async (data: any) => {
      const response = await hrServiceAPI.post('/api/salary/increment', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees-for-increment'] })
      toast.success('Salary increment processed successfully')
      handleCloseDialog()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process increment')
    }
  })

  const handleOpenIncrement = (employee: Employee) => {
    setSelectedEmployee(employee)
    setForm({
      userId: employee.id,
      incrementType: 'PERCENTAGE',
      incrementPercentage: '10',
      incrementAmount: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      reason: 'Annual Increment',
      newCTC: ''
    })
    calculateNewCTC(employee.currentCTC, 'PERCENTAGE', '10')
    setShowIncrementDialog(true)
  }

  const handleCloseDialog = () => {
    setShowIncrementDialog(false)
    setSelectedEmployee(null)
  }

  const calculateNewCTC = (currentCTC: number, type: string, value: string) => {
    let newCTC = currentCTC
    if (type === 'PERCENTAGE' && value) {
      const percentage = parseFloat(value)
      newCTC = currentCTC * (1 + percentage / 100)
    } else if (type === 'FIXED' && value) {
      newCTC = currentCTC + parseFloat(value)
    }
    setForm((prev) => ({ ...prev, newCTC: newCTC.toFixed(2) }))
  }

  const handleIncrementTypeChange = (type: string) => {
    setForm((prev) => ({ ...prev, incrementType: type }))
    if (selectedEmployee) {
      const value = type === 'PERCENTAGE' ? form.incrementPercentage : form.incrementAmount
      calculateNewCTC(selectedEmployee.currentCTC, type, value)
    }
  }

  const handleValueChange = (value: string) => {
    const field = form.incrementType === 'PERCENTAGE' ? 'incrementPercentage' : 'incrementAmount'
    setForm((prev) => ({ ...prev, [field]: value }))
    if (selectedEmployee) {
      calculateNewCTC(selectedEmployee.currentCTC, form.incrementType, value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      userId: form.userId,
      incrementType: form.incrementType,
      incrementPercentage: form.incrementType === 'PERCENTAGE' ? parseFloat(form.incrementPercentage) : null,
      incrementAmount: form.incrementType === 'FIXED' ? parseFloat(form.incrementAmount) : null,
      effectiveFrom: form.effectiveFrom,
      reason: form.reason,
      newCTC: parseFloat(form.newCTC)
    }

    processIncrement.mutate(payload)
  }

  if (checkingPermissions) {
    return (
      <AppLayout title="Process Increments" subtitle="Manage salary increments">
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

  const filteredEmployees = employees?.filter((emp: Employee) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const totalEmployees = employees?.length || 0
  const avgCTC = employees?.reduce((sum: number, emp: Employee) => sum + emp.currentCTC, 0) / totalEmployees || 0
  const dueForIncrement = employees?.filter((emp: Employee) => {
    if (!emp.lastIncrementDate) return true
    const lastIncrement = new Date(emp.lastIncrementDate)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    return lastIncrement < oneYearAgo
  }).length || 0

  return (
    <AppLayout title="Process Increments" subtitle="Manage annual salary increments and revisions">
      <div className="space-y-6">
        {/* Header with Search */}
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{totalEmployees}</p>
                  <p className="text-sm text-gray-600">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{dueForIncrement}</p>
                  <p className="text-sm text-gray-600">Due for Increment</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">₹{(avgCTC / 100000).toFixed(1)}L</p>
                  <p className="text-sm text-gray-600">Average CTC</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{new Date().getFullYear()}</p>
                  <p className="text-sm text-gray-600">Cycle Year</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loadingEmployees ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredEmployees.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Current CTC
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Last Increment
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEmployees.map((employee: Employee) => {
                      const isDue = !employee.lastIncrementDate ||
                        new Date(employee.lastIncrementDate) < new Date(new Date().setFullYear(new Date().getFullYear() - 1))

                      return (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-xs text-gray-500">{employee.employeeId}</p>
                              <p className="text-xs text-gray-500">{employee.designation}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {employee.department}
                          </td>
                          <td className="px-6 py-4 font-medium">
                            ₹{employee.currentCTC.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {employee.lastIncrementDate ? (
                              <div>
                                <p>{new Date(employee.lastIncrementDate).toLocaleDateString()}</p>
                                {isDue && (
                                  <span className="text-xs text-orange-600">Due for review</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">Never</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenIncrement(employee)}
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Process Increment
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No employees found</p>
            </CardContent>
          </Card>
        )}

        {/* Increment Dialog */}
        {showIncrementDialog && selectedEmployee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Process Salary Increment</h2>
              </div>

              <div className="p-6">
                {/* Employee Details */}
                <div className="bg-gray-50 p-4 rounded mb-6 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Employee Name</Label>
                      <p className="font-medium">{selectedEmployee.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Employee ID</Label>
                      <p className="font-medium">{selectedEmployee.employeeId}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Department</Label>
                      <p className="font-medium">{selectedEmployee.department}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Designation</Label>
                      <p className="font-medium">{selectedEmployee.designation}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Current CTC</Label>
                    <p className="text-2xl font-bold">₹{selectedEmployee.currentCTC.toLocaleString()}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="incrementType">Increment Type *</Label>
                      <Select
                        value={form.incrementType}
                        onValueChange={handleIncrementTypeChange}
                      >
                        <SelectTrigger id="incrementType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                          <SelectItem value="FIXED">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="value">
                        {form.incrementType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (₹)'} *
                      </Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.incrementType === 'PERCENTAGE' ? form.incrementPercentage : form.incrementAmount}
                        onChange={(e) => handleValueChange(e.target.value)}
                        required
                      />
                    </div>
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

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason *</Label>
                    <Textarea
                      id="reason"
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                      placeholder="e.g., Annual Increment, Performance Based, Promotion"
                      rows={3}
                      required
                    />
                  </div>

                  {/* New CTC Preview */}
                  <div className="bg-green-50 p-4 rounded border border-green-200">
                    <Label className="text-xs text-green-700">New CTC After Increment</Label>
                    <p className="text-3xl font-bold text-green-700">₹{parseFloat(form.newCTC).toLocaleString()}</p>
                    <p className="text-sm text-green-600 mt-1">
                      Increment: ₹{(parseFloat(form.newCTC) - selectedEmployee.currentCTC).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={processIncrement.isPending}>
                      {processIncrement.isPending ? 'Processing...' : 'Process Increment'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
