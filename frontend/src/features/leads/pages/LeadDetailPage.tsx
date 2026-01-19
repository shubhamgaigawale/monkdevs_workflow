import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, UserPlus, Phone, Mail } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { LeadStatusBadge } from '../components/LeadStatusBadge'
import { LeadForm } from '../components/LeadForm'
import { useLeadDetail, useUpdateLead, useDeleteLead, useLeadHistory } from '../hooks/useLeads'
import { ROUTES } from '@/lib/constants/routes'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/formatters'
import type { UpdateLeadDto } from '../api/leadsApi'

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [showLogCallDialog, setShowLogCallDialog] = useState(false)
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)

  const { data: lead, isLoading } = useLeadDetail(id!)
  const { data: history, isLoading: historyLoading } = useLeadHistory(id!)
  const updateLead = useUpdateLead()
  const deleteLead = useDeleteLead()

  const handleUpdate = async (data: UpdateLeadDto) => {
    await updateLead.mutateAsync({ id: id!, data })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    await deleteLead.mutateAsync(id!)
    navigate(ROUTES.LEADS)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </AppLayout>
    )
  }

  if (!lead) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Lead not found</p>
          <Button onClick={() => navigate(ROUTES.LEADS)} className="mt-4">
            Back to Leads
          </Button>
        </div>
      </AppLayout>
    )
  }

  if (isEditing) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Lead</h1>
              <p className="text-muted-foreground mt-2">
                Update lead information
              </p>
            </div>
          </div>

          <LeadForm
            lead={lead}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isSubmitting={updateLead.isPending}
          />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(ROUTES.LEADS)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {lead.firstName} {lead.lastName}
              </h1>
              <p className="text-muted-foreground mt-1">{lead.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Information */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <LeadStatusBadge status={lead.status} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                    <p className="mt-1">{lead.priority}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Company</p>
                    <p className="mt-1">{lead.company || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="mt-1">{lead.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Source</p>
                    <p className="mt-1">{lead.source}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                    <p className="mt-1">{lead.assignedToName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="mt-1">{formatDateTime(lead.createdAt)}</p>
                  </div>
                </div>

                {lead.notes && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{lead.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <p className="text-sm text-muted-foreground">Loading activity...</p>
                ) : !history || history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <div className="flex-1 w-px bg-border" />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-medium">{item.action}</p>
                          {item.field && (
                            <p className="text-sm text-muted-foreground">
                              {item.field}: {item.oldValue} → {item.newValue}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{item.changedBy}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(item.changedAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(ROUTES.CALLS, { state: { openLogForm: true, leadId: id, leadName: `${lead.firstName} ${lead.lastName}`, phoneNumber: lead.phone } })}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Log Call
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.location.href = `mailto:${lead.email}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowAssignDialog(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Lead
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Assign Lead Dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Lead</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Assign this lead to a team member
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-900">Select User</label>
                  <select className="w-full mt-1 h-10 rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select a user...</option>
                    <option value="user1">John Doe (Sales Agent)</option>
                    <option value="user2">Jane Smith (Sales Manager)</option>
                    <option value="user3">Mike Johnson (Account Executive)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-900">Notes (Optional)</label>
                  <textarea
                    className="w-full mt-1 min-h-[80px] rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes about this assignment..."
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // TODO: Implement actual assignment logic
                  alert('Lead assignment functionality will be implemented soon!')
                  setShowAssignDialog(false)
                }}
              >
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
