import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Upload, UserPlus, Download, Search, Eye, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable, type Column } from '@/components/common/DataTable'
import { LeadStatusBadge } from '../components/LeadStatusBadge'
import { useLeads, useDeleteLead } from '../hooks/useLeads'
import { useDebounce } from '@/hooks/useDebounce'
import { ROUTES } from '@/lib/constants/routes'
import { formatDateTime } from '@/lib/utils/formatters'
import type { Lead, LeadStatus } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function LeadsListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('')
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())

  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading } = useLeads(page, 20, {
    search: debouncedSearch,
    status: statusFilter || undefined,
  })
  const deleteLead = useDeleteLead()

  const columns: Column<Lead>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <div>
          <p className="font-medium">
            {row.firstName} {row.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Company',
      accessorKey: 'company',
      cell: (row) => row.company || '-',
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      cell: (row) => row.phone || '-',
    },
    {
      header: 'Status',
      cell: (row) => <LeadStatusBadge status={row.status} />,
    },
    {
      header: 'Source',
      accessorKey: 'source',
    },
    {
      header: 'Assigned To',
      cell: (row) => row.assignedToName || '-',
    },
    {
      header: 'Created',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`${ROUTES.LEADS}/${row.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`${ROUTES.LEADS}/${row.id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                if (confirm('Are you sure you want to delete this lead?')) {
                  await deleteLead.mutateAsync(row.id)
                }
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: 'w-[70px]',
    },
  ]

  const handleRowSelect = (id: string) => {
    setSelectedLeads((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedLeads.size} leads?`)) return

    for (const id of selectedLeads) {
      await deleteLead.mutateAsync(id)
    }
    setSelectedLeads(new Set())
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
            <p className="text-muted-foreground mt-2">
              Manage and track your sales leads
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(ROUTES.LEADS + '/import')}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => navigate(ROUTES.LEADS + '/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Lead
            </Button>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          {selectedLeads.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedLeads.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(ROUTES.LEADS + '/assign')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                Delete
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          )}
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
          onRowClick={(lead) => navigate(`${ROUTES.LEADS}/${lead.id}`)}
          selectedRows={selectedLeads}
          onRowSelect={handleRowSelect}
          getRowId={(lead) => lead.id}
          emptyMessage="No leads found. Create your first lead to get started."
        />
      </div>
    </AppLayout>
  )
}
