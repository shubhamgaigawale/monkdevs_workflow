import { useState } from 'react'
import { Search, DollarSign } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface SalaryStructure {
  id: string
  name: string
  description?: string
  components: Array<{
    componentId: string
    componentName: string
    percentage?: number
    fixedAmount?: number
  }>
}

interface SalaryBreakdown {
  componentName: string
  amount: number
  type: string
}

export function AssignSalaryPage() {
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedStructureId, setSelectedStructureId] = useState('')
  const [ctc, setCtc] = useState('')
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().split('T')[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [breakdown, setBreakdown] = useState<SalaryBreakdown[]>([])

  const queryClient = useQueryClient()

  // Fetch users
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userServiceAPI.get('/api/users')
      return response.data.data
    }
  })

  // Fetch salary structures
  const { data: structures } = useQuery({
    queryKey: ['salary-structures'],
    queryFn: async () => {
      const response = await hrServiceAPI.get('/api/salary/structures')
      return response.data.data
    }
  })

  // Assign salary mutation
  const assignSalary = useMutation({
    mutationFn: async (data: any) => {
      const response = await hrServiceAPI.post('/api/salary/assign', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-salaries'] })
      toast.success('Salary assigned successfully!')
      handleReset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign salary')
    }
  })

  const filteredUsers = users?.filter((user: User) =>
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const selectedUser = users?.find((u: User) => u.id === selectedUserId)
  const selectedStructure = structures?.find((s: SalaryStructure) => s.id === selectedStructureId)

  const calculateBreakdown = () => {
    if (!ctc || !selectedStructure) {
      setBreakdown([])
      return
    }

    const ctcAmount = parseFloat(ctc)
    const calculated: SalaryBreakdown[] = []

    selectedStructure.components.forEach((comp) => {
      let amount = 0
      if (comp.fixedAmount) {
        amount = comp.fixedAmount
      } else if (comp.percentage) {
        amount = (ctcAmount * comp.percentage) / 100
      }

      calculated.push({
        componentName: comp.componentName,
        amount: Math.round(amount * 100) / 100,
        type: comp.fixedAmount ? 'Fixed' : 'Percentage'
      })
    })

    setBreakdown(calculated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserId || !selectedStructureId || !ctc) {
      toast.error('Please fill all required fields')
      return
    }

    assignSalary.mutate({
      userId: selectedUserId,
      salaryStructureId: selectedStructureId,
      ctc: parseFloat(ctc),
      effectiveFrom
    })
  }

  const handleReset = () => {
    setSelectedUserId('')
    setSelectedStructureId('')
    setCtc('')
    setEffectiveFrom(new Date().toISOString().split('T')[0])
    setBreakdown([])
  }

  if (checkingPermissions) {
    return (
      <AppLayout title="Assign Salary" subtitle="Assign salary structure to employees">
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
    <AppLayout title="Assign Salary" subtitle="Assign salary structure to employees">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Employee Selection</h3>

            {/* Search Users */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search Employee</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* User List */}
              {searchQuery && (
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user: User) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUserId(user.id)
                          setSearchQuery('')
                        }}
                        className={`w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 ${
                          selectedUserId === user.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-center text-gray-500">No users found</p>
                  )}
                </div>
              )}

              {/* Selected User */}
              {selectedUser && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600">Selected Employee:</p>
                  <p className="font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Salary Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Salary Structure */}
              <div className="space-y-2">
                <Label htmlFor="structure">Salary Structure *</Label>
                <Select value={selectedStructureId} onValueChange={setSelectedStructureId}>
                  <SelectTrigger id="structure">
                    <SelectValue placeholder="Select structure" />
                  </SelectTrigger>
                  <SelectContent>
                    {structures?.map((structure: SalaryStructure) => (
                      <SelectItem key={structure.id} value={structure.id}>
                        {structure.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStructure?.description && (
                  <p className="text-sm text-gray-600">{selectedStructure.description}</p>
                )}
              </div>

              {/* CTC */}
              <div className="space-y-2">
                <Label htmlFor="ctc">Annual CTC (₹) *</Label>
                <Input
                  id="ctc"
                  type="number"
                  step="0.01"
                  min="0"
                  value={ctc}
                  onChange={(e) => setCtc(e.target.value)}
                  placeholder="e.g., 1200000"
                  required
                />
              </div>

              {/* Effective From */}
              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">Effective From *</Label>
                <Input
                  id="effectiveFrom"
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  required
                />
              </div>

              {/* Calculate Button */}
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={calculateBreakdown}
                  disabled={!ctc || !selectedStructureId}
                  className="w-full"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Calculate Breakdown
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary Breakdown Preview */}
        {breakdown.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Salary Breakdown Preview</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded font-semibold">
                  <span>Annual CTC</span>
                  <span>₹{parseFloat(ctc).toLocaleString('en-IN')}</span>
                </div>

                <div className="border rounded-lg divide-y">
                  {breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3">
                      <div>
                        <span className="font-medium">{item.componentName}</span>
                        <span className="text-xs text-gray-500 ml-2">({item.type})</span>
                      </div>
                      <span className="font-medium">₹{item.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded font-semibold">
                  <span>Monthly Gross</span>
                  <span>
                    ₹
                    {(
                      breakdown.reduce((sum, item) => sum + item.amount, 0) / 12
                    ).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button
            type="submit"
            disabled={
              !selectedUserId || !selectedStructureId || !ctc || assignSalary.isPending
            }
          >
            {assignSalary.isPending ? 'Assigning...' : 'Assign Salary'}
          </Button>
        </div>
      </form>
    </AppLayout>
  )
}
