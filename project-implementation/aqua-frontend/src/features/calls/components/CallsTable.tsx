import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Phone,
  FileAudio,
  Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CallSummary } from '@/types'
import { FlagBadge } from './FlagBadge'
import { StatusBadge } from './StatusBadge'
import { ScoreIndicator } from './ScoreIndicator'

interface CallsTableProps {
  data: CallSummary[]
  isLoading?: boolean
  searchQuery?: string
}

/**
 * CallsTable - Data table for displaying call summaries
 *
 * Features:
 * - Sortable columns (click header to sort)
 * - Client-side pagination
 * - Search filtering
 * - Clickable rows for navigation to call details
 * - Loading skeletons
 * - Empty state
 */
export function CallsTable({ data, isLoading, searchQuery = '' }: CallsTableProps) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // Define table columns
  const columns = useMemo<ColumnDef<CallSummary>[]>(
    () => [
      {
        accessorKey: 'callId',
        header: ({ column }) => (
          <SortableHeader column={column} title="Call ID" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-900">
              {row.getValue('callId')}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'agentName',
        header: ({ column }) => (
          <SortableHeader column={column} title="Agent" />
        ),
        cell: ({ row }) => (
          <span className="text-slate-700">{row.getValue('agentName')}</span>
        ),
      },
      {
        accessorKey: 'date',
        header: ({ column }) => (
          <SortableHeader column={column} title="Date" />
        ),
        cell: ({ row }) => {
          const date = row.getValue('date') as string
          return (
            <span className="text-slate-600 tabular-nums">
              {formatDate(date)}
            </span>
          )
        },
      },
      {
        accessorKey: 'duration',
        header: ({ column }) => (
          <SortableHeader column={column} title="Duration" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-slate-600">
            <FileAudio className="h-4 w-4 text-slate-400" />
            <span className="tabular-nums">{row.getValue('duration')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'overallScore',
        header: ({ column }) => (
          <SortableHeader column={column} title="Score" />
        ),
        cell: ({ row }) => (
          <ScoreIndicator
            score={row.getValue('overallScore')}
            size="sm"
            showBar={true}
          />
        ),
      },
      {
        accessorKey: 'flag',
        header: ({ column }) => (
          <SortableHeader column={column} title="Flag" />
        ),
        cell: ({ row }) => (
          <FlagBadge flag={row.getValue('flag')} showLabel size="sm" />
        ),
        filterFn: (row, id, filterValue) => {
          if (filterValue === 'all') return true
          return row.getValue(id) === filterValue
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <SortableHeader column={column} title="Status" />
        ),
        cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
        filterFn: (row, id, filterValue) => {
          if (filterValue === 'all') return true
          return row.getValue(id) === filterValue
        },
      },
    ],
    []
  )

  // Apply global search filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase()
    return data.filter(
      (call) =>
        call.callId.toLowerCase().includes(query) ||
        call.agentName.toLowerCase().includes(query) ||
        call.transactionId.toLowerCase().includes(query)
    )
  }, [data, searchQuery])

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  // Handle row click - navigate to call detail
  const handleRowClick = (call: CallSummary) => {
    navigate(`/calls/${call.transactionId}`)
  }

  // Loading state
  if (isLoading) {
    return <CallsTableSkeleton />
  }

  // Empty state
  if (filteredData.length === 0) {
    return (
      <EmptyState
        hasSearchQuery={!!searchQuery.trim()}
        searchQuery={searchQuery}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-slate-50 hover:bg-slate-50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-slate-600 font-semibold"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => handleRowClick(row.original)}
                className="cursor-pointer hover:bg-blue-50/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination table={table} />
    </div>
  )
}

/**
 * Sortable column header component
 */
function SortableHeader({
  column,
  title,
}: {
  column: {
    getCanSort: () => boolean
    getIsSorted: () => false | 'asc' | 'desc'
    toggleSorting: (desc?: boolean) => void
  }
  title: string
}) {
  const isSorted = column.getIsSorted()

  if (!column.getCanSort()) {
    return <span>{title}</span>
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent hover:bg-slate-100"
      onClick={() => column.toggleSorting(isSorted === 'asc')}
    >
      {title}
      {isSorted === 'desc' ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : isSorted === 'asc' ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  )
}

/**
 * Pagination controls
 */
function Pagination({
  table,
}: {
  table: ReturnType<typeof useReactTable<CallSummary>>
}) {
  const pageCount = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1

  return (
    <div className="flex items-center justify-between px-2">
      {/* Page info */}
      <div className="text-sm text-slate-500">
        Showing{' '}
        <span className="font-medium text-slate-700">
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}
        </span>{' '}
        to{' '}
        <span className="font-medium text-slate-700">
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}
        </span>{' '}
        of{' '}
        <span className="font-medium text-slate-700">
          {table.getFilteredRowModel().rows.length}
        </span>{' '}
        calls
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {generatePageNumbers(currentPage, pageCount).map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  'h-8 w-8',
                  page === currentPage && 'pointer-events-none'
                )}
                onClick={() => table.setPageIndex(page - 1)}
              >
                {page}
              </Button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

/**
 * Generate array of page numbers to display
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number
): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, '...', totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ]
}

/**
 * Loading skeleton for the table
 */
function CallsTableSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            {['Call ID', 'Agent', 'Date', 'Duration', 'Score', 'Flag', 'Status'].map(
              (header) => (
                <TableHead key={header} className="text-slate-600 font-semibold">
                  {header}
                </TableHead>
              )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/**
 * Empty state component
 */
function EmptyState({
  hasSearchQuery,
  searchQuery,
}: {
  hasSearchQuery: boolean
  searchQuery: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-slate-100 p-4 mb-4">
          <Inbox className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          {hasSearchQuery ? 'No results found' : 'No calls yet'}
        </h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          {hasSearchQuery
            ? `No calls match "${searchQuery}". Try adjusting your search or filters.`
            : 'Upload audio files to start analyzing call center conversations.'}
        </p>
      </div>
    </div>
  )
}

/**
 * Format date string for display
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

/**
 * Export table column filter setter for external use
 */
export function useCallsTableFilters() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const setFlagFilter = (flag: string) => {
    setColumnFilters((prev) => {
      const existing = prev.filter((f) => f.id !== 'flag')
      if (flag === 'all') return existing
      return [...existing, { id: 'flag', value: flag }]
    })
  }

  const setStatusFilter = (status: string) => {
    setColumnFilters((prev) => {
      const existing = prev.filter((f) => f.id !== 'status')
      if (status === 'all') return existing
      return [...existing, { id: 'status', value: status }]
    })
  }

  return {
    columnFilters,
    setColumnFilters,
    setFlagFilter,
    setStatusFilter,
  }
}
