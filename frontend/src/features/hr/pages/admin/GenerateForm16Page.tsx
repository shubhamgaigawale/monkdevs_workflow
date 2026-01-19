import { useState } from 'react'
import { Download, FileText, Calendar, Users, CheckCircle, Search } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  email: string
  panNumber?: string
  hasSalaryData: boolean
  hasTaxDeclaration: boolean
}

interface Form16Record {
  id: string
  employeeId: string
  employeeName: string
  financialYear: string
  generatedDate: string
  totalIncome: number
  taxDeducted: number
  filePath?: string
}

export function GenerateForm16Page() {
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [selectedYear, setSelectedYear] = useState<string>(getCurrentFinancialYear())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])

  const queryClient = useQueryClient()

  // Fetch employees eligible for Form 16
  const { data: employees, isLoading: loadingEmployees } = useQuery({
    queryKey: ['form16-eligible-employees', selectedYear],
    queryFn: async () => {
      const response = await hrServiceAPI.get(`/api/tax/form16/eligible?year=${selectedYear}`)
      return response.data.data
    }
  })

  // Fetch existing Form 16 records
  const { data: form16Records, isLoading: loadingRecords } = useQuery({
    queryKey: ['form16-records', selectedYear],
    queryFn: async () => {
      const response = await hrServiceAPI.get(`/api/tax/form16/records?year=${selectedYear}`)
      return response.data.data
    }
  })

  // Generate Form 16 mutation
  const generateForm16 = useMutation({
    mutationFn: async (data: { employeeIds: string[]; financialYear: string }) => {
      const response = await hrServiceAPI.post('/api/tax/form16/generate', data)
      return response.data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['form16-records'] })
      toast.success(`Form 16 generated for ${data.successCount} employee(s)`)
      setSelectedEmployees([])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate Form 16')
    }
  })

  // Download Form 16
  const downloadForm16 = async (recordId: string, employeeName: string) => {
    try {
      const response = await hrServiceAPI.get(`/api/tax/form16/${recordId}/download`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Form16_${employeeName}_${selectedYear}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Form 16 downloaded successfully')
    } catch (error: any) {
      toast.error('Failed to download Form 16')
    }
  }

  const handleGenerateForm16 = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee')
      return
    }

    generateForm16.mutate({
      employeeIds: selectedEmployees,
      financialYear: selectedYear
    })
  }

  const handleSelectAll = () => {
    if (selectedEmployees.length === eligibleEmployees.length) {
      setSelectedEmployees([])
    } else {
      setSelectedEmployees(eligibleEmployees.map((emp: Employee) => emp.id))
    }
  }

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  if (checkingPermissions) {
    return (
      <AppLayout title="Generate Form 16" subtitle="Generate tax certificates">
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

  const eligibleEmployees = employees?.filter((emp: Employee) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const totalEmployees = employees?.length || 0
  const generatedCount = form16Records?.length || 0
  const pendingCount = totalEmployees - generatedCount
  const totalTaxDeducted = form16Records?.reduce((sum: number, r: Form16Record) => sum + r.taxDeducted, 0) || 0

  return (
    <AppLayout title="Generate Form 16" subtitle="Generate and manage Form 16 tax certificates">
      <div className="space-y-6">
        {/* Header with Controls */}
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getFinancialYears().map((year) => (
                    <SelectItem key={year} value={year}>
                      FY {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateForm16}
            disabled={selectedEmployees.length === 0 || generateForm16.isPending}
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Form 16 ({selectedEmployees.length})
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{totalEmployees}</p>
                  <p className="text-sm text-gray-600">Eligible Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{generatedCount}</p>
                  <p className="text-sm text-gray-600">Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">₹</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{(totalTaxDeducted / 100000).toFixed(1)}L</p>
                  <p className="text-sm text-gray-600">Total TDS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Eligible Employees */}
          <Card>
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Eligible Employees</h3>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedEmployees.length === eligibleEmployees.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <CardContent className="p-0">
              {loadingEmployees ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : eligibleEmployees.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto">
                  {eligibleEmployees.map((employee: Employee) => {
                    const isGenerated = form16Records?.some(
                      (r: Form16Record) => r.employeeId === employee.id
                    )

                    return (
                      <div
                        key={employee.id}
                        className={`p-4 border-b hover:bg-gray-50 ${
                          selectedEmployees.includes(employee.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={() => handleSelectEmployee(employee.id)}
                            disabled={isGenerated}
                            className="mt-1 w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{employee.name}</p>
                                <p className="text-xs text-gray-500">{employee.employeeId}</p>
                                <p className="text-xs text-gray-500">{employee.department}</p>
                              </div>
                              {isGenerated && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Generated
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              {employee.hasSalaryData && (
                                <span className="text-green-600">✓ Salary Data</span>
                              )}
                              {employee.hasTaxDeclaration && (
                                <span className="text-green-600">✓ Tax Declaration</span>
                              )}
                              {employee.panNumber && (
                                <span className="text-blue-600">PAN: {employee.panNumber}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No eligible employees found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Form 16 Records */}
          <Card>
            <div className="p-4 border-b">
              <h3 className="font-semibold">Generated Form 16 Records</h3>
            </div>
            <CardContent className="p-0">
              {loadingRecords ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : form16Records && form16Records.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto">
                  {form16Records.map((record: Form16Record) => (
                    <div key={record.id} className="p-4 border-b hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{record.employeeName}</p>
                          <p className="text-xs text-gray-500">
                            Generated on {new Date(record.generatedDate).toLocaleDateString()}
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">
                              <span className="text-gray-600">Total Income:</span>{' '}
                              <span className="font-medium">₹{record.totalIncome.toLocaleString()}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-600">Tax Deducted:</span>{' '}
                              <span className="font-medium text-green-600">
                                ₹{record.taxDeducted.toLocaleString()}
                              </span>
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadForm16(record.id, record.employeeName)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No Form 16 generated yet for {selectedYear}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

// Helper functions
function getCurrentFinancialYear(): string {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1

  if (currentMonth >= 4) {
    return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
  } else {
    return `${currentYear - 1}-${currentYear.toString().slice(-2)}`
  }
}

function getFinancialYears(): string[] {
  const currentYear = new Date().getFullYear()
  const years = []

  for (let i = 0; i < 5; i++) {
    const year = currentYear - i
    years.push(`${year}-${(year + 1).toString().slice(-2)}`)
  }

  return years
}
