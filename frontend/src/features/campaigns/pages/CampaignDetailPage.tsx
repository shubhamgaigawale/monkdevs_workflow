import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Send, Play, Pause } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatsCard } from '@/components/common/StatsCard'
import { CampaignStatusBadge } from '../components/CampaignStatusBadge'
import { CampaignForm } from '../components/CampaignForm'
import {
  useCampaignDetail,
  useUpdateCampaign,
  useDeleteCampaign,
  useSendCampaign,
  usePauseCampaign,
  useResumeCampaign,
} from '../hooks/useCampaigns'
import { ROUTES } from '@/lib/constants/routes'
import { formatDateTime, formatPercentage } from '@/lib/utils/formatters'
import type { UpdateCampaignDto } from '../api/campaignsApi'

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)

  const { data: campaign, isLoading } = useCampaignDetail(id!)
  const updateCampaign = useUpdateCampaign()
  const deleteCampaign = useDeleteCampaign()
  const sendCampaign = useSendCampaign()
  const pauseCampaign = usePauseCampaign()
  const resumeCampaign = useResumeCampaign()

  const handleUpdate = async (data: UpdateCampaignDto) => {
    await updateCampaign.mutateAsync({ id: id!, data })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    await deleteCampaign.mutateAsync(id!)
    navigate(ROUTES.CAMPAIGNS)
  }

  const handleSend = async () => {
    if (!confirm('Are you sure you want to send this campaign now?')) return
    await sendCampaign.mutateAsync(id!)
  }

  const handlePause = async () => {
    await pauseCampaign.mutateAsync(id!)
  }

  const handleResume = async () => {
    await resumeCampaign.mutateAsync(id!)
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

  if (!campaign) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Campaign not found</p>
          <Button onClick={() => navigate(ROUTES.CAMPAIGNS)} className="mt-4">
            Back to Campaigns
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
              <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
              <p className="text-muted-foreground mt-2">
                Update campaign information
              </p>
            </div>
          </div>

          <CampaignForm
            campaign={campaign}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isSubmitting={updateCampaign.isPending}
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
              onClick={() => navigate(ROUTES.CAMPAIGNS)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
              <p className="text-muted-foreground mt-1">{campaign.subject}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {campaign.status === 'DRAFT' && (
              <Button onClick={handleSend}>
                <Send className="h-4 w-4 mr-2" />
                Send Now
              </Button>
            )}
            {campaign.status === 'SENDING' && (
              <Button variant="outline" onClick={handlePause}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {campaign.status === 'PAUSED' && (
              <Button onClick={handleResume}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
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

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Total Recipients"
            value={campaign.totalRecipients}
          />
          <StatsCard
            title="Sent"
            value={campaign.emailsSent}
          />
          <StatsCard
            title="Opens"
            value={`${campaign.uniqueOpens} (${formatPercentage(campaign.openRate)})`}
          />
          <StatsCard
            title="Clicks"
            value={`${campaign.uniqueClicks} (${formatPercentage(campaign.clickRate)})`}
          />
          <StatsCard
            title="Bounces"
            value={`${campaign.bounces} (${formatPercentage(campaign.bounceRate)})`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Information */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <CampaignStatusBadge status={campaign.status} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="mt-1">{campaign.campaignType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">From</p>
                    <p className="mt-1">{campaign.fromName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reply To</p>
                    <p className="mt-1">{campaign.replyTo || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                    <p className="mt-1">
                      {campaign.scheduledAt ? formatDateTime(campaign.scheduledAt) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sent</p>
                    <p className="mt-1">
                      {campaign.sentAt ? formatDateTime(campaign.sentAt) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="mt-1">{formatDateTime(campaign.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap text-sm">
                    {campaign.content || 'No content'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Open Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(campaign.openRate)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${campaign.openRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Click Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(campaign.clickRate)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${campaign.clickRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {formatPercentage(campaign.bounceRate)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${campaign.bounceRate}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
