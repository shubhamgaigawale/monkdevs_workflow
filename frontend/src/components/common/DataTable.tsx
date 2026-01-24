import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

export interface Column<T> {
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  pagination?: {
    page: number
    size: number
    totalElements: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  onRowClick?: (row: T) => void
  selectedRows?: Set<string>
  onRowSelect?: (id: string) => void
  getRowId?: (row: T) => string
  emptyMessage?: string
  
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  pagination,
  onRowClick,
  selectedRows,
  onRowSelect,
  getRowId,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {selectedRows && onRowSelect && (
                <th className="h-12 px-4 text-left align-middle font-medium w-12">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={
                      data.length > 0 &&
                      data.every((row) =>
                        getRowId ? selectedRows.has(getRowId(row)) : false
                      )
                    }
                    onChange={(e) => {
                      if (getRowId && onRowSelect) {
                        data.forEach((row) => {
                          const id = getRowId(row)
                          if (e.target.checked && !selectedRows.has(id)) {
                            onRowSelect(id)
                          } else if (!e.target.checked && selectedRows.has(id)) {
                            onRowSelect(id)
                          }
                        })
                      }
                    }}
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectedRows ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <p className="text-muted-foreground">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const rowId = getRowId ? getRowId(row) : rowIndex.toString()
                const isSelected = selectedRows?.has(rowId)

                return (
                  <tr
                    key={rowId}
                    className={cn(
                      'border-b transition-colors',
                      onRowClick && 'cursor-pointer',
                      hoveredRow === rowIndex && 'bg-muted/50',
                      isSelected && 'bg-accent'
                    )}
                    onMouseEnter={() => setHoveredRow(rowIndex)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectedRows && onRowSelect && (
                      <td className="px-4 align-middle">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation()
                            onRowSelect(rowId)
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={cn('px-4 py-3 align-middle', column.className)}
                      >
                        {column.cell
                          ? column.cell(row)
                          : column.accessorKey
                            ? String(row[column.accessorKey] ?? '')
                            : ''}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {pagination.page * pagination.size + 1} to{' '}
            {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
            {pagination.totalElements} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(0)}
              disabled={pagination.page === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Page {pagination.page + 1} of {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.totalPages - 1)}
              disabled={pagination.page >= pagination.totalPages - 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
