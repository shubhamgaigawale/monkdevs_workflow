import { useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

export function StartOnboardingPage() {
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [selectedUserId, setSelectedUserId] = useState('')
  const [managerId, setManagerId] = useState('')
  const [buddyId, setBuddyId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [probationDays, setProbationDays] = useState('90')
  const [notes, setNotes] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [managerSearchQuery, setManagerSearchQuery] = useState('')
  const [buddySearchQuery, setBuddySearchQuery] = useState('')

  const queryClient = useQueryClient()

  // Fetch users
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userServiceAPI.get('/api/users')
      return response.data.data
    }
  })

  // Start onboarding mutation
  const startOnboarding = useMutation({
    mutationFn: async (data: any) => {
      const response = await hrServiceAPI.post('/api/onboarding/start', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboardings'] })
      toast.success('Onboarding started successfully!')
      handleReset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start onboarding')
    }
  })

  const filteredUsers = users?.filter((user: User) =>
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const filteredManagers = users?.filter((user: User) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(managerSearchQuery.toLowerCase())
  )

  const filteredBuddies = users?.filter((user: User) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(buddySearchQuery.toLowerCase())
  )

  const selectedUser = users?.find((u: User) => u.id === selectedUserId)
  const selectedManager = users?.find((u: User) => u.id === managerId)
  const selectedBuddy = users?.find((u: User) => u.id === buddyId)

  const calculateProbationEndDate = () => {
    if (!startDate || !probationDays) return ''
    const start = new Date(startDate)
    start.setDate(start.getDate() + parseInt(probationDays))
    return start.toISOString().split('T')[0]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUserId || !startDate) {
      toast.error('Please select employee and start date')
      return
    }

    const probationEndDate = calculateProbationEndDate()

    startOnboarding.mutate({
      userId: selectedUserId,
      startDate,
      managerId: managerId || undefined,
      buddyId: buddyId || undefined,
      probationEndDate: probationEndDate || undefined,
      notes: notes || undefined
    })
  }

  const handleReset = () => {
    setSelectedUserId('')
    setManagerId('')
    setBuddyId('')
    setStartDate(new Date().toISOString().split('T')[0])
    setProbationDays('90')
    setNotes('')
  }

  if (checkingPermissions) {
    return (
      <AppLayout title="Start Onboarding" subtitle="Start onboarding for new employees">
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
    <AppLayout title="Start Onboarding" subtitle="Start onboarding process for new employees">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Select Employee</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Search New Employee</Label>
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
            <h3 className="text-lg font-semibold mb-4">Onboarding Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              {/* Probation Period */}
              <div className="space-y-2">
                <Label htmlFor="probationDays">Probation Period (days)</Label>
                <Input
                  id="probationDays"
                  type="number"
                  min="0"
                  value={probationDays}
                  onChange={(e) => setProbationDays(e.target.value)}
                />
                {probationDays && startDate && (
                  <p className="text-sm text-gray-600">
                    End date: {calculateProbationEndDate()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Assign Manager & Buddy (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Manager */}
              <div className="space-y-2">
                <Label>Reporting Manager</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search manager..."
                    value={managerSearchQuery}
                    onChange={(e) => setManagerSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {managerSearchQuery && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {filteredManagers && filteredManagers.length > 0 ? (
                      filteredManagers.slice(0, 5).map((user: User) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setManagerId(user.id)
                            setManagerSearchQuery('')
                          }}
                          className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <p className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                        </button>
                      ))
                    ) : (
                      <p className="p-2 text-center text-sm text-gray-500">No users found</p>
                    )}
                  </div>
                )}
                {selectedManager && (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {selectedManager.firstName} {selectedManager.lastName}
                    <button
                      type="button"
                      onClick={() => setManagerId('')}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Buddy */}
              <div className="space-y-2">
                <Label>Onboarding Buddy</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search buddy..."
                    value={buddySearchQuery}
                    onChange={(e) => setBuddySearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {buddySearchQuery && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto">
                    {filteredBuddies && filteredBuddies.length > 0 ? (
                      filteredBuddies.slice(0, 5).map((user: User) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setBuddyId(user.id)
                            setBuddySearchQuery('')
                          }}
                          className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <p className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                        </button>
                      ))
                    ) : (
                      <p className="p-2 text-center text-sm text-gray-500">No users found</p>
                    )}
                  </div>
                )}
                {selectedBuddy && (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    {selectedBuddy.firstName} {selectedBuddy.lastName}
                    <button
                      type="button"
                      onClick={() => setBuddyId('')}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or notes for the onboarding process..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" disabled={!selectedUserId || startOnboarding.isPending}>
            {startOnboarding.isPending ? (
              'Starting...'
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Start Onboarding
              </>
            )}
          </Button>
        </div>
      </form>
    </AppLayout>
  )
}
