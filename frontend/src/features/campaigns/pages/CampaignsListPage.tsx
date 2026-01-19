import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Mail } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, type Column } from '@/components/common/DataTable'
import { CampaignStatusBadge } from '../components/CampaignStatusBadge'
import { useCampaigns } from '../hooks/useCampaigns'
import { useDebounce } from '@/hooks/useDebounce'
import { ROUTES } from '@/lib/constants/routes'
import { formatDateTime, formatPercentage } from '@/lib/utils/formatters'
import type { Campaign, CampaignStatus } from '@/types/models'

export function CampaignsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | ''>('')

  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading } = useCampaigns(page, 20, {
    search: debouncedSearch,
    status: statusFilter || undefined,
  })

  const columns: Column<Campaign>[] = [
    {
      header: 'Campaign',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-muted-foreground">{row.subject}</p>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (row) => (
        <span className="text-sm">
          {row.campaignType}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <CampaignStatusBadge status={row.status} />,
    },
    {
      header: 'Recipients',
      cell: (row) => (
        <div className="text-sm">
          <p className="font-medium">{row.totalRecipients}</p>
          <p className="text-muted-foreground">{row.emailsSent} sent</p>
        </div>
      ),
    },
    {
      header: 'Open Rate',
      cell: (row) => (
        <span className="text-sm">
          {formatPercentage(row.openRate)}
        </span>
      ),
    },
    {
      header: 'Click Rate',
      cell: (row) => (
        <span className="text-sm">
          {formatPercentage(row.clickRate)}
        </span>
      ),
    },
    {
      header: 'Created',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage email and SMS campaigns
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(ROUTES.CAMPAIGNS + '/templates')}>
              <Mail className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button onClick={() => navigate(ROUTES.CAMPAIGNS + '/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | '')}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="SENDING">Sending</option>
            <option value="SENT">Sent</option>
            <option value="PAUSED">Paused</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data?.content || []}
          isLoading={isLoading}
          pagination={
            data
              ? {
                  page: data.number,
                  size: data.size,
                  totalElements: data.totalElements,
                  totalPages: data.totalPages,
                  onPageChange: setPage,
                }
              : undefined
          }
          onRowClick={(campaign) => navigate(`${ROUTES.CAMPAIGNS}/${campaign.id}`)}
          emptyMessage="No campaigns found. Create your first campaign to get started."
        />
      </div>
    </AppLayout>
  )
}
