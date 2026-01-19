import { useState } from 'react'
import { CheckCircle, XCircle, FileText, Download, Eye, Filter } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hrServiceAPI } from '@/lib/api/services'
import { toast } from 'sonner'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PERMISSIONS } from '@/lib/constants/permissions'

interface TaxDeclarationItem {
  id: string
  declarationId: string
  employeeName: string
  employeeId: string
  section: string
  subSection: string
  description: string
  declaredAmount: number
  proofFilePath?: string
  verificationStatus: string
  verifiedBy?: string
  verifiedDate?: string
  verificationNotes?: string
}

interface VerificationForm {
  approved: boolean
  notes: string
}

export function TaxProofVerificationPage() {
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [statusFilter, setStatusFilter] = useState<string>('PENDING')
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<TaxDeclarationItem | null>(null)
  const [verificationForm, setVerificationForm] = useState<VerificationForm>({
    approved: true,
    notes: ''
  })

  const queryClient = useQueryClient()

  // Fetch tax declaration items
  const { data: items, isLoading: loadingItems } = useQuery({
    queryKey: ['tax-declarations', statusFilter],
    queryFn: async () => {
      const response = await hrServiceAPI.get(`/api/tax/declarations/items?status=${statusFilter}`)
      return response.data.data
    }
  })

  // Verify proof mutation
  const verifyProof = useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: any }) => {
      const response = await hrServiceAPI.post(`/api/tax/declarations/items/${itemId}/verify`, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-declarations'] })
      toast.success('Proof verification completed')
      handleCloseDialog()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify proof')
    }
  })

  const handleOpenVerify = (item: TaxDeclarationItem) => {
    setSelectedItem(item)
    setVerificationForm({
      approved: true,
      notes: ''
    })
    setShowVerifyDialog(true)
  }

  const handleCloseDialog = () => {
    setShowVerifyDialog(false)
    setSelectedItem(null)
  }

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return

    verifyProof.mutate({
      itemId: selectedItem.id,
      data: {
        approved: verificationForm.approved,
        notes: verificationForm.notes
      }
    })
  }

  const handleDownloadProof = (filePath: string) => {
    // Download file logic
    window.open(`/api/files/download?path=${encodeURIComponent(filePath)}`, '_blank')
  }

  if (checkingPermissions) {
    return (
      <AppLayout title="Tax Proof Verification" subtitle="Verify employee tax investment proofs">
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

  const pendingCount = items?.filter((i: TaxDeclarationItem) => i.verificationStatus === 'PENDING').length || 0
  const verifiedCount = items?.filter((i: TaxDeclarationItem) => i.verificationStatus === 'VERIFIED').length || 0
  const rejectedCount = items?.filter((i: TaxDeclarationItem) => i.verificationStatus === 'REJECTED').length || 0
  const totalAmount = items?.reduce((sum: number, i: TaxDeclarationItem) => sum + i.declaredAmount, 0) || 0

  return (
    <AppLayout title="Tax Proof Verification" subtitle="Review and verify employee tax investment proofs">
      <div className="space-y-6">
        {/* Header with Filter */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Verify tax investment proofs submitted by employees
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending Verification</SelectItem>
                  <SelectItem value="VERIFIED">Verified</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="ALL">All Proofs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-gray-600">Pending Verification</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{verifiedCount}</p>
                  <p className="text-sm text-gray-600">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                  <p className="text-sm text-gray-600">Rejected</p>
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
                  <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Declared</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loadingItems ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : items && items.length > 0 ? (
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
                        Section
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
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
                    {items.map((item: TaxDeclarationItem) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{item.employeeName}</p>
                            <p className="text-xs text-gray-500">{item.employeeId}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">{item.section}</p>
                            {item.subSection && (
                              <p className="text-xs text-gray-500">{item.subSection}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm max-w-xs truncate">
                          {item.description}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ₹{item.declaredAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded ${
                              item.verificationStatus === 'VERIFIED'
                                ? 'bg-green-100 text-green-800'
                                : item.verificationStatus === 'REJECTED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {item.verificationStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.proofFilePath && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadProof(item.proofFilePath!)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Proof
                              </Button>
                            )}
                            {item.verificationStatus === 'PENDING' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenVerify(item)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Verify
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
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tax proofs found for the selected filter</p>
            </CardContent>
          </Card>
        )}

        {/* Verification Dialog */}
        {showVerifyDialog && selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Verify Tax Proof</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Item Details */}
                <div className="bg-gray-50 p-4 rounded space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Employee</Label>
                      <p className="font-medium">{selectedItem.employeeName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Section</Label>
                      <p className="font-medium">{selectedItem.section}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Description</Label>
                    <p className="font-medium">{selectedItem.description}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Declared Amount</Label>
                    <p className="text-2xl font-bold">₹{selectedItem.declaredAmount.toLocaleString()}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitVerification} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="decision">Verification Decision *</Label>
                    <Select
                      value={verificationForm.approved ? 'APPROVE' : 'REJECT'}
                      onValueChange={(value) =>
                        setVerificationForm({ ...verificationForm, approved: value === 'APPROVE' })
                      }
                    >
                      <SelectTrigger id="decision">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPROVE">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Approve
                          </div>
                        </SelectItem>
                        <SelectItem value="REJECT">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Reject
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Verification Notes</Label>
                    <Textarea
                      id="notes"
                      value={verificationForm.notes}
                      onChange={(e) =>
                        setVerificationForm({ ...verificationForm, notes: e.target.value })
                      }
                      placeholder="Add any comments or notes about this verification"
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={verifyProof.isPending}
                      className={
                        verificationForm.approved
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }
                    >
                      {verifyProof.isPending
                        ? 'Processing...'
                        : verificationForm.approved
                        ? 'Approve Proof'
                        : 'Reject Proof'}
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
