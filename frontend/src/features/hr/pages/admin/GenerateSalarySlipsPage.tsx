import { useState } from 'react'
import { FileText, Download, CheckCircle } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrServiceAPI, userServiceAPI } from '@/lib/api/services'
import { toast } from 'sonner'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PERMISSIONS } from '@/lib/constants/permissions'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface GenerationStatus {
  userId: string
  userName: string
  status: 'pending' | 'generating' | 'success' | 'error'
  error?: string
}

export function GenerateSalarySlipsPage() {
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString())
  const [selectedYear, setSelectedYear] = useState(currentYear.toString())
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const queryClient = useQueryClient()

  // Fetch users
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userServiceAPI.get('/api/users')
      return response.data.data
    }
  })

  // Generate slip mutation
  const generateSlip = async (userId: string, month: number, year: number) => {
    const response = await hrServiceAPI.post(
      `/api/salary/slips/generate?userId=${userId}&month=${month}&year=${year}`
    )
    return response.data.data
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users?.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users?.map((u: User) => u.id) || [])
    }
  }

  const handleToggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    } else {
      setSelectedUsers([...selectedUsers, userId])
    }
  }

  const handleGenerateSlips = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one employee')
      return
    }

    setIsGenerating(true)
    const month = parseInt(selectedMonth)
    const year = parseInt(selectedYear)

    // Initialize status
    const initialStatus: GenerationStatus[] = selectedUsers.map((userId) => {
      const user = users?.find((u: User) => u.id === userId)
      return {
        userId,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        status: 'pending' as const
      }
    })
    setGenerationStatus(initialStatus)

    // Generate slips sequentially
    for (let i = 0; i < selectedUsers.length; i++) {
      const userId = selectedUsers[i]

      // Update status to generating
      setGenerationStatus((prev) =>
        prev.map((s) => (s.userId === userId ? { ...s, status: 'generating' } : s))
      )

      try {
        await generateSlip(userId, month, year)

        // Update status to success
        setGenerationStatus((prev) =>
          prev.map((s) => (s.userId === userId ? { ...s, status: 'success' } : s))
        )
      } catch (error: any) {
        // Update status to error
        setGenerationStatus((prev) =>
          prev.map((s) =>
            s.userId === userId
              ? {
                  ...s,
                  status: 'error',
                  error: error.response?.data?.message || 'Generation failed'
                }
              : s
          )
        )
      }
    }

    setIsGenerating(false)
    queryClient.invalidateQueries({ queryKey: ['salary-slips'] })
    toast.success('Salary slip generation completed')
  }

  const getStatusColor = (status: GenerationStatus['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'generating':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (checkingPermissions) {
    return (
      <AppLayout title="Generate Salary Slips" subtitle="Bulk generate salary slips">
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

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <AppLayout
      title="Generate Salary Slips"
      subtitle="Bulk generate salary slips for employees"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Select Month & Year</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger id="month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger id="year">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Employees</h3>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedUsers.length === users?.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-2">
              {users?.map((user: User) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleToggleUser(user.id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">
                <strong>{selectedUsers.length}</strong> employee{selectedUsers.length !== 1 ? 's' : ''}{' '}
                selected
              </p>
            </div>
          </CardContent>
        </Card>

        {generationStatus.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Generation Status</h3>

              <div className="space-y-2">
                {generationStatus.map((status) => (
                  <div
                    key={status.userId}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{status.userName}</p>
                      {status.error && (
                        <p className="text-sm text-red-600 mt-1">{status.error}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(status.status)}`}>
                      {status.status === 'generating' && (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-800 border-t-transparent"></div>
                          Generating...
                        </span>
                      )}
                      {status.status === 'success' && (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Success
                        </span>
                      )}
                      {status.status === 'error' && 'Failed'}
                      {status.status === 'pending' && 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button onClick={handleGenerateSlips} disabled={isGenerating || selectedUsers.length === 0}>
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Salary Slips
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
