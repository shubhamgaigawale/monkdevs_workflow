import { useState } from 'react'
import { Building2, CheckCircle, XCircle, Users, Search, Eye } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useQuery } from '@tanstack/react-query'
import { hrServiceAPI } from '@/lib/api/services'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PERMISSIONS } from '@/lib/constants/permissions'

interface BankDetails {
  id: string
  userId: string
  employeeName: string
  employeeId: string
  bankName: string
  accountNumber: string
  ifscCode: string
  branchName: string
  accountHolderName: string
  isPrimary: boolean
  status: string
}

export function BankDetailsManagementPage() {
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedDetails, setSelectedDetails] = useState<BankDetails | null>(null)

  // Fetch all employee bank details
  const { data: bankDetailsList, isLoading: loadingDetails } = useQuery({
    queryKey: ['all-bank-details'],
    queryFn: async () => {
      const response = await hrServiceAPI.get('/api/salary/bank-details/all')
      return response.data.data
    }
  })

  const handleViewDetails = (details: BankDetails) => {
    setSelectedDetails(details)
    setShowDetailsDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDetailsDialog(false)
    setSelectedDetails(null)
  }

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return ''
    const visibleDigits = 4
    const maskedPart = '*'.repeat(Math.max(0, accountNumber.length - visibleDigits))
    return maskedPart + accountNumber.slice(-visibleDigits)
  }

  if (checkingPermissions) {
    return (
      <AppLayout title="Bank Details Management" subtitle="View employee bank details">
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

  const filteredDetails = bankDetailsList?.filter((details: BankDetails) =>
    details.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    details.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    details.bankName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const totalEmployees = bankDetailsList?.length || 0
  const activeAccounts = bankDetailsList?.filter((d: BankDetails) => d.status === 'ACTIVE').length || 0
  const verifiedAccounts = bankDetailsList?.filter((d: BankDetails) => d.status === 'VERIFIED').length || 0
  const uniqueBanks = new Set(bankDetailsList?.map((d: BankDetails) => d.bankName)).size || 0

  return (
    <AppLayout title="Bank Details Management" subtitle="View and manage employee bank account details">
      <div className="space-y-6">
        {/* Header with Search */}
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by employee name, ID, or bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredDetails.length} of {totalEmployees} employees
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
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{verifiedAccounts}</p>
                  <p className="text-sm text-gray-600">Verified Accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{uniqueBanks}</p>
                  <p className="text-sm text-gray-600">Unique Banks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 font-bold">%</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalEmployees > 0 ? Math.round((activeAccounts / totalEmployees) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Active Accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loadingDetails ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredDetails.length > 0 ? (
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
                        Bank Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Account Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        IFSC Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDetails.map((details: BankDetails) => (
                      <tr key={details.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{details.employeeName}</p>
                            <p className="text-xs text-gray-500">{details.employeeId}</p>
                            {details.isPrimary && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mt-1 inline-block">
                                Primary
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{details.bankName}</span>
                          </div>
                          {details.branchName && (
                            <p className="text-xs text-gray-500 ml-6">{details.branchName}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                          {maskAccountNumber(details.accountNumber)}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                          {details.ifscCode}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded ${
                              details.status === 'VERIFIED'
                                ? 'bg-green-100 text-green-800'
                                : details.status === 'ACTIVE'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {details.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(details)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
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
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No bank details found matching your search' : 'No bank details available'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Details Dialog */}
        {showDetailsDialog && selectedDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Bank Account Details</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Employee Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Employee Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Employee Name</Label>
                      <p className="font-medium">{selectedDetails.employeeName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Employee ID</Label>
                      <p className="font-medium">{selectedDetails.employeeId}</p>
                    </div>
                  </div>
                </div>

                {/* Bank Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Bank Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500">Bank Name</Label>
                        <p className="font-medium">{selectedDetails.bankName}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Branch Name</Label>
                        <p className="font-medium">{selectedDetails.branchName || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border">
                      <Label className="text-xs text-gray-500">Account Holder Name</Label>
                      <p className="font-medium text-lg">{selectedDetails.accountHolderName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded border border-blue-200">
                        <Label className="text-xs text-blue-700">Account Number</Label>
                        <p className="font-mono font-bold text-lg text-blue-900">
                          {selectedDetails.accountNumber}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded border border-purple-200">
                        <Label className="text-xs text-purple-700">IFSC Code</Label>
                        <p className="font-mono font-bold text-lg text-purple-900">
                          {selectedDetails.ifscCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4">
                        {selectedDetails.isPrimary && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-600 font-medium">Primary Account</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          {selectedDetails.status === 'VERIFIED' ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600 font-medium">Verified</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Not Verified</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleCloseDialog}>Close</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
