import { useState } from 'react'
import { FileText, CheckCircle, XCircle, Eye, Download, Filter } from 'lucide-react'
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

interface Document {
  id: string
  userId: string
  userName?: string
  documentType: string
  documentName: string
  filePath: string
  fileSize: number
  mimeType: string
  status: string
  verifiedBy?: string
  verifiedDate?: string
  verificationNotes?: string
  createdAt: string
}

interface VerificationForm {
  status: string
  notes: string
}

export function DocumentVerificationPage() {
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.HR_MANAGE
  })

  const [statusFilter, setStatusFilter] = useState<string>('PENDING_VERIFICATION')
  const [searchQuery, setSearchQuery] = useState('')
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [verificationForm, setVerificationForm] = useState<VerificationForm>({
    status: 'VERIFIED',
    notes: ''
  })

  const queryClient = useQueryClient()

  // Fetch documents
  const { data: documents, isLoading: loadingDocuments } = useQuery({
    queryKey: ['employee-documents', statusFilter],
    queryFn: async () => {
      const response = await hrServiceAPI.get('/api/onboarding/documents', {
        params: { status: statusFilter || undefined }
      })
      return response.data.data
    }
  })

  // Fetch users for name mapping
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userServiceAPI.get('/api/users')
      return response.data.data
    }
  })

  // Verify document mutation
  const verifyDocument = useMutation({
    mutationFn: async ({ documentId, data }: { documentId: string; data: any }) => {
      const response = await hrServiceAPI.post(`/api/onboarding/documents/${documentId}/verify`, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] })
      toast.success('Document verification updated successfully')
      handleCloseDialog()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify document')
    }
  })

  const handleOpenVerify = (document: Document) => {
    setSelectedDocument(document)
    setVerificationForm({
      status: 'VERIFIED',
      notes: document.verificationNotes || ''
    })
    setShowVerifyDialog(true)
  }

  const handleCloseDialog = () => {
    setShowVerifyDialog(false)
    setSelectedDocument(null)
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDocument) return

    verifyDocument.mutate({
      documentId: selectedDocument.id,
      data: {
        status: verificationForm.status,
        notes: verificationForm.notes || null
      }
    })
  }

  const getUserName = (userId: string) => {
    const user = users?.find((u: any) => u.id === userId)
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const filteredDocuments = documents?.filter((doc: Document) => {
    const userName = getUserName(doc.userId)
    const searchLower = searchQuery.toLowerCase()
    return (
      userName.toLowerCase().includes(searchLower) ||
      doc.documentType.toLowerCase().includes(searchLower) ||
      doc.documentName.toLowerCase().includes(searchLower)
    )
  })

  if (checkingPermissions) {
    return (
      <AppLayout title="Document Verification" subtitle="Verify employee documents">
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

  const pendingCount = documents?.filter((d: Document) => d.status === 'PENDING_VERIFICATION').length || 0
  const verifiedCount = documents?.filter((d: Document) => d.status === 'VERIFIED').length || 0
  const rejectedCount = documents?.filter((d: Document) => d.status === 'REJECTED').length || 0

  return (
    <AppLayout title="Document Verification" subtitle="Verify and manage employee documents">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-yellow-600" />
                </div>
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
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
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
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rejectedCount}</p>
                  <p className="text-sm text-gray-600">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by employee name, document type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Documents</SelectItem>
                    <SelectItem value="PENDING_VERIFICATION">Pending</SelectItem>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {loadingDocuments ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredDocuments && filteredDocuments.length > 0 ? (
          <div className="space-y-3">
            {filteredDocuments.map((document: Document) => (
              <Card key={document.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold">{document.documentName}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(document.status)}`}>
                            {document.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{getUserName(document.userId)}</span>
                            <span>•</span>
                            <span>{document.documentType}</span>
                            <span>•</span>
                            <span>{formatFileSize(document.fileSize)}</span>
                          </div>
                          <div>
                            Uploaded: {new Date(document.createdAt).toLocaleDateString()}
                          </div>
                          {document.verificationNotes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <span className="font-semibold">Notes:</span> {document.verificationNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {document.status === 'PENDING_VERIFICATION' && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenVerify(document)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify
                        </Button>
                      )}
                      {document.status !== 'PENDING_VERIFICATION' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenVerify(document)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents found</p>
              {statusFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusFilter('')}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Verification Dialog */}
        {showVerifyDialog && selectedDocument && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Document Verification</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Document Details */}
                <div className="space-y-3 p-4 bg-gray-50 rounded">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-semibold">Employee:</span>
                      <p>{getUserName(selectedDocument.userId)}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Document Type:</span>
                      <p>{selectedDocument.documentType}</p>
                    </div>
                    <div>
                      <span className="font-semibold">File Name:</span>
                      <p className="truncate">{selectedDocument.documentName}</p>
                    </div>
                    <div>
                      <span className="font-semibold">File Size:</span>
                      <p>{formatFileSize(selectedDocument.fileSize)}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Uploaded:</span>
                      <p>{new Date(selectedDocument.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-semibold">Current Status:</span>
                      <p>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedDocument.status)}`}>
                          {selectedDocument.status.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification Form */}
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verificationStatus">Verification Status *</Label>
                    <Select
                      value={verificationForm.status}
                      onValueChange={(value) =>
                        setVerificationForm({ ...verificationForm, status: value })
                      }
                    >
                      <SelectTrigger id="verificationStatus">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VERIFIED">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span>Verify Document</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="REJECTED">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span>Reject Document</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="PENDING_VERIFICATION">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-yellow-600" />
                            <span>Mark as Pending</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      Verification Notes {verificationForm.status === 'REJECTED' && '*'}
                    </Label>
                    <Textarea
                      id="notes"
                      value={verificationForm.notes}
                      onChange={(e) =>
                        setVerificationForm({ ...verificationForm, notes: e.target.value })
                      }
                      placeholder={
                        verificationForm.status === 'REJECTED'
                          ? 'Please provide reason for rejection...'
                          : 'Optional notes about this verification...'
                      }
                      rows={4}
                      required={verificationForm.status === 'REJECTED'}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={verifyDocument.isPending}>
                      {verifyDocument.isPending ? 'Saving...' : 'Save Verification'}
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
