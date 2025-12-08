import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header, PageContainer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Phone,
  Upload,
  Search,
  CheckSquare,
  AlertTriangle,
  XSquare,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Volume2,
  FileText,
  Pencil,
  X,
  Loader2,
  Copy,
  Check,
  Filter,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import { useCallSummariesQuery } from '@/hooks'
import { cn } from '@/lib/utils'
import type { CallSummary } from '@/types'

/**
 * CallsPage - Call Library matching Figma design
 *
 * Features:
 * - Stats cards (Total calls, Flags breakdown, Average Score)
 * - Search and filters
 * - Detailed calls table
 * - Pagination
 */
export default function CallsPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('today')
  const [flagFilter, setFlagFilter] = useState('all')
  const [scoreFilter, setScoreFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCall, setSelectedCall] = useState<CallSummary | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(45) // mock: 45 seconds
  const [duration] = useState(312) // mock: 5:12 total
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [showDateRangeModal, setShowDateRangeModal] = useState(false)
  const [showScoreFilterModal, setShowScoreFilterModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [dateRangeFrom, setDateRangeFrom] = useState('')
  const [dateRangeTo, setDateRangeTo] = useState('')
  const [includeCreationDate, setIncludeCreationDate] = useState(true)
  const [includeAIAnalysisDate, setIncludeAIAnalysisDate] = useState(false)
  const [includeManualReviewDate, setIncludeManualReviewDate] = useState(false)
  const [scoreType, setScoreType] = useState<'final' | 'ai'>('final')
  const [scoreRangeMin, setScoreRangeMin] = useState(0)
  const [scoreRangeMax, setScoreRangeMax] = useState(100)
  const [uploadFiles, setUploadFiles] = useState<Array<{
    id: number
    name: string
    duration: string
    status: 'completed' | 'uploading' | 'failed' | 'validating'
    progress: number
  }>>([])
  const [applyMetadataToAll, setApplyMetadataToAll] = useState(true)
  const searchRef = useRef<HTMLDivElement>(null)
  const itemsPerPage = 6

  const { data: calls = [], isLoading } = useCallSummariesQuery()

  // Get unique agent names for autocomplete
  const agentSuggestions = useMemo(() => {
    if (!searchQuery) return []
    const uniqueAgents = [...new Set(calls.map(c => c.agentName).filter(Boolean))]
    return uniqueAgents.filter(name =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)
  }, [calls, searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle play button click
  const handlePlayCall = (call: CallSummary, e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedCall?.transactionId === call.transactionId) {
      setIsPlaying(!isPlaying)
    } else {
      setSelectedCall(call)
      setIsPlaying(true)
      setCurrentTime(45)
    }
  }

  // Close audio player
  const handleClosePlayer = () => {
    setSelectedCall(null)
    setIsPlaying(false)
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Calculate stats
  const stats = useMemo(() => {
    const totalCalls = calls.length
    const greenFlags = calls.filter(c => !c.Flagged && c.scoreCard >= 75).length
    const yellowFlags = calls.filter(c => c.scoreCard >= 60 && c.scoreCard < 75).length
    const redFlags = calls.filter(c => c.Flagged || c.scoreCard < 60).length
    const avgScore = totalCalls > 0
      ? Math.round(calls.reduce((acc, c) => acc + (c.scoreCard || 0), 0) / totalCalls)
      : 0
    return { totalCalls, greenFlags, yellowFlags, redFlags, avgScore }
  }, [calls])

  // Filter calls
  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          call.callId?.toLowerCase().includes(query) ||
          call.agentName?.toLowerCase().includes(query) ||
          call.audioName?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Flag filter
      if (flagFilter !== 'all') {
        const score = call.scoreCard || 0
        if (flagFilter === 'good' && (call.Flagged || score < 75)) return false
        if (flagFilter === 'warning' && (score < 60 || score >= 75)) return false
        if (flagFilter === 'critical' && !call.Flagged && score >= 60) return false
      }

      // Score filter
      if (scoreFilter !== 'all') {
        const score = call.scoreCard || 0
        if (scoreFilter === 'high' && score < 80) return false
        if (scoreFilter === 'medium' && (score < 60 || score >= 80)) return false
        if (scoreFilter === 'low' && score >= 60) return false
      }

      return true
    })
  }, [calls, searchQuery, flagFilter, scoreFilter])

  // Paginate
  const paginatedCalls = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCalls.slice(start, start + itemsPerPage)
  }, [filteredCalls, currentPage])

  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage)

  // Get flag display
  const getFlagDisplay = (call: typeof calls[0]) => {
    if (call.Flagged || call.scoreCard < 60) {
      return (
        <div className="flex items-center gap-2">
          <XSquare className="h-4 w-4 text-red-500" />
          <span className="text-sm">Critical</span>
        </div>
      )
    }
    if (call.scoreCard < 75) {
      return (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span className="text-sm">Warning</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-green-500" />
        <span className="text-sm">Good</span>
      </div>
    )
  }

  // Get sentiment display
  const getSentimentDisplay = (score: number, isProcessing?: boolean) => {
    if (isProcessing) return { icon: 'spinner', label: 'Processing', color: 'text-slate-500' }
    if (score >= 80) return { icon: '😊', label: 'Happy', color: 'text-green-600' }
    if (score >= 60) return { icon: '😐', label: 'Calm', color: 'text-slate-600' }
    if (score >= 40) return { icon: '😔', label: 'Sad', color: 'text-yellow-600' }
    return { icon: '😠', label: 'Upset', color: 'text-red-600' }
  }

  return (
    <>
      <Header title="Call Library" />
      <PageContainer>
        <div className="space-y-6">
          {/* Header with title and upload button */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              Call Library
            </h1>
            <Button
              className="bg-slate-900 hover:bg-slate-800"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload new file
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* Total Calls */}
            <div className="border border-slate-200 rounded-lg p-6 bg-white">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-slate-500" />
                <span className="text-slate-600">Total calls</span>
                <span className="text-3xl font-bold text-slate-900 ml-auto">
                  {isLoading ? <Skeleton className="h-9 w-16" /> : stats.totalCalls}
                </span>
              </div>
            </div>

            {/* Flags Breakdown */}
            <div className="border border-slate-200 rounded-lg p-6 bg-white">
              <div className="flex items-center gap-4">
                <span className="text-slate-600">Flags</span>
                <div className="flex items-center gap-4 ml-auto">
                  <div className="flex items-center gap-1">
                    <CheckSquare className="h-4 w-4 text-green-500" />
                    <span className="font-bold">{stats.greenFlags}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">{stats.yellowFlags}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XSquare className="h-4 w-4 text-red-500" />
                    <span className="font-bold">{stats.redFlags}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Score */}
            <div className="border border-slate-200 rounded-lg p-6 bg-white">
              <div className="flex items-center gap-3">
                <span className="text-slate-600">Average Score</span>
                <span className="text-3xl font-bold text-slate-900 ml-auto">
                  {isLoading ? <Skeleton className="h-9 w-20" /> : `${stats.avgScore}/100`}
                </span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            {/* Agent Search with Autocomplete */}
            <div className="relative flex-1 max-w-md" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by ID, Agent, Keyword..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchDropdown(true)
                }}
                onFocus={() => setShowSearchDropdown(true)}
                className="pl-10"
              />
              {/* Autocomplete Dropdown */}
              {showSearchDropdown && agentSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  {agentSuggestions.map((name, i) => (
                    <button
                      key={name}
                      className={cn(
                        'w-full px-3 py-2 text-left text-sm hover:bg-blue-50',
                        i === 1 && 'bg-blue-100'
                      )}
                      onClick={() => {
                        setSearchQuery(name)
                        setShowSearchDropdown(false)
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Today" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">
                  <span className="flex items-center gap-2">
                    <Check className="h-3 w-3" /> Today
                  </span>
                </SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="thismonth">This month</SelectItem>
                <SelectItem value="lastmonth">Last month</SelectItem>
                <SelectItem value="custom">Custom Range...</SelectItem>
              </SelectContent>
            </Select>

            {/* Flag Filter */}
            <Select value={flagFilter} onValueChange={setFlagFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Flag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <Check className="h-3 w-3" /> All Flags
                  </span>
                </SelectItem>
                <SelectItem value="good">
                  <span className="flex items-center gap-2">
                    <CheckSquare className="h-3 w-3 text-green-500" /> Good
                  </span>
                </SelectItem>
                <SelectItem value="warning">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-yellow-500" /> Warning
                  </span>
                </SelectItem>
                <SelectItem value="critical">
                  <span className="flex items-center gap-2">
                    <XSquare className="h-3 w-3 text-red-500" /> Critical
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Score Filter */}
            <Select value={scoreFilter} onValueChange={(value) => {
              if (value === 'custom') {
                setShowScoreFilterModal(true)
              } else {
                setScoreFilter(value)
              }
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Scores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <Check className="h-3 w-3" /> All Scores
                  </span>
                </SelectItem>
                <SelectItem value="low">Below 60 (Critical)</SelectItem>
                <SelectItem value="medium">60 - 79 (Need Improvement)</SelectItem>
                <SelectItem value="high">80 - 100 (Good)</SelectItem>
                <SelectItem value="custom">Custom Range...</SelectItem>
              </SelectContent>
            </Select>

            {/* More Filters Button */}
            <Button
              variant="outline"
              onClick={() => setShowDateRangeModal(true)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>

          {/* Record Count */}
          <p className="text-sm text-slate-600">
            Showing {filteredCalls.length} records
          </p>

          {/* Calls Table */}
          {isLoading ? (
            <CallsTableSkeleton />
          ) : (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-slate-300 hover:bg-transparent">
                    <TableHead className="text-sm font-bold text-slate-500">Call ID</TableHead>
                    <TableHead className="text-sm font-bold text-slate-500">Date / Time</TableHead>
                    <TableHead className="text-sm font-bold text-slate-500">Agent</TableHead>
                    <TableHead className="text-sm font-bold text-slate-500">Company - Project</TableHead>
                    <TableHead className="text-sm font-bold text-slate-500">AI Score</TableHead>
                    <TableHead className="text-sm font-bold text-slate-500">Flag</TableHead>
                    <TableHead className="text-sm font-bold text-slate-500">Sentiment</TableHead>
                    <TableHead className="text-sm font-bold text-slate-500">Final Score</TableHead>
                    <TableHead className="text-sm font-bold text-slate-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCalls.map((call, index) => {
                    const sentiment = getSentimentDisplay(call.scoreCard || 70)
                    const isSelected = selectedCall?.transactionId === call.transactionId
                    return (
                      <TableRow
                        key={call.transactionId}
                        className={cn(
                          'border-b border-slate-200 hover:bg-slate-50 cursor-pointer',
                          isSelected && 'bg-slate-100'
                        )}
                        onClick={() => navigate(`/calls/${call.transactionId}`)}
                      >
                        <TableCell className="text-sm text-slate-900 font-medium">
                          {String(call.id || index + 1).padStart(5, '0')}
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {new Date(call.processDate).toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {call.agentName}
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {call.audioName}
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {call.scoreCard || '-'}
                        </TableCell>
                        <TableCell>{getFlagDisplay(call)}</TableCell>
                        <TableCell>
                          <div className={cn('flex items-center gap-2', sentiment.color)}>
                            {sentiment.icon === 'spinner' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <span>{sentiment.icon}</span>
                            )}
                            <span className="text-sm">{sentiment.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* Final Score with Tooltip */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="flex items-center gap-2 hover:bg-slate-100 px-2 py-1 rounded -ml-2">
                                <span className="text-sm font-medium">{call.scoreCard || '-'}</span>
                                {!call.Flagged && call.scoreCard >= 75 && (
                                  <CheckSquare className="h-4 w-4 text-green-500" />
                                )}
                                {call.Flagged && (
                                  <XSquare className="h-4 w-4 text-red-500" />
                                )}
                                {/* Override indicator */}
                                {call.scoreCard >= 80 && <Copy className="h-3 w-3 text-slate-400" />}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-72 p-3" align="start">
                              <div className="space-y-2 text-sm">
                                <p className="font-medium">
                                  Final Score: <span className="text-green-600">{call.scoreCard}</span>
                                  <span className="text-slate-500 ml-1">(Overridden)</span>
                                </p>
                                <p className="text-slate-600">
                                  AI Score: {Math.round((call.scoreCard || 70) * 0.95)} | Confidence: 0.86
                                </p>
                                <p className="flex items-center gap-2 text-slate-600">
                                  Flag: <CheckSquare className="h-3 w-3 text-green-500" /> Good
                                </p>
                                <p className="text-slate-600">
                                  Overridden by: <span className="font-medium">QC_Maria</span> ({new Date(call.processDate).toISOString().split('T')[0]})
                                </p>
                                <p className="text-slate-600">
                                  Reason: <span className="italic">"AI missed ID verification"</span>
                                </p>
                                <p className="text-slate-600">
                                  Notes: 2 feedback comments
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell>
                          <button
                            className="p-1 hover:bg-slate-200 rounded"
                            onClick={(e) => handlePlayCall(call, e)}
                          >
                            {isSelected && isPlaying ? (
                              <Pause className="h-5 w-5 text-slate-600" />
                            ) : (
                              <Play className="h-5 w-5 text-slate-600" />
                            )}
                          </button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {paginatedCalls.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-slate-500 py-8">
                        No calls found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'w-8 h-8 rounded text-sm',
                    currentPage === page
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {page}
                </button>
              ))}
              {totalPages > 3 && <span className="text-slate-400">...</span>}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Add padding at bottom when player is visible */}
          {selectedCall && <div className="h-20" />}
        </div>
      </PageContainer>

      {/* Audio Player Footer */}
      {selectedCall && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 z-50">
          <div className="flex items-center gap-6">
            {/* Call Info */}
            <p className="text-sm text-slate-900 whitespace-nowrap">
              {String(selectedCall.id || 1).padStart(5, '0')} | {selectedCall.audioName} | {selectedCall.agentName} | {new Date(selectedCall.processDate).toLocaleDateString('en-CA')} {new Date(selectedCall.processDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </p>

            {/* Play/Pause Button */}
            <button
              className="p-2 hover:bg-slate-100 rounded-full"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-slate-900" />
              ) : (
                <Play className="h-6 w-6 text-slate-900" />
              )}
            </button>

            {/* Volume Icon */}
            <Volume2 className="h-6 w-6 text-slate-600" />

            {/* Progress Slider */}
            <div className="flex-1 max-w-md">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={(value) => setCurrentTime(value[0])}
                className="cursor-pointer"
              />
            </div>

            {/* Time Display */}
            <span className="text-sm text-slate-900 whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Transcript Button */}
            <button
              className="flex items-center gap-2 px-3 py-1 hover:bg-slate-100 rounded text-sm text-slate-900"
              onClick={() => navigate(`/calls/${selectedCall.transactionId}`)}
            >
              <FileText className="h-5 w-5" />
              Transcript
            </button>

            {/* Notes Button */}
            <button
              className="flex items-center gap-2 px-3 py-1 hover:bg-slate-100 rounded text-sm text-slate-900"
              onClick={() => navigate(`/calls/${selectedCall.transactionId}?tab=overrides`)}
            >
              <Pencil className="h-5 w-5" />
              Notes
            </button>

            {/* Close Button */}
            <button
              className="p-1 hover:bg-slate-100 rounded"
              onClick={handleClosePlayer}
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
        </div>
      )}

      {/* Date Range Modal */}
      <Dialog open={showDateRangeModal} onOpenChange={setShowDateRangeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data Range</label>
              <div className="grid grid-cols-2 gap-4">
                <Select value={dateRangeFrom} onValueChange={setDateRangeFrom}>
                  <SelectTrigger>
                    <SelectValue placeholder="From:" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-01-01">Jan 1, 2025</SelectItem>
                    <SelectItem value="2025-06-01">Jun 1, 2025</SelectItem>
                    <SelectItem value="2025-09-01">Sep 1, 2025</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRangeTo} onValueChange={setDateRangeTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="To:" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-12-31">Dec 31, 2025</SelectItem>
                    <SelectItem value="2025-09-30">Sep 30, 2025</SelectItem>
                    <SelectItem value="2025-10-15">Oct 15, 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Include</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Call creation date</span>
                  <Switch
                    checked={includeCreationDate}
                    onCheckedChange={setIncludeCreationDate}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">AI analysis date</span>
                  <Switch
                    checked={includeAIAnalysisDate}
                    onCheckedChange={setIncludeAIAnalysisDate}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Manual review date</span>
                  <Switch
                    checked={includeManualReviewDate}
                    onCheckedChange={setIncludeManualReviewDate}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDateRangeModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowDateRangeModal(false)}>
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Score Filter Modal */}
      <Dialog open={showScoreFilterModal} onOpenChange={setShowScoreFilterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter by Score</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Score Type</label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={scoreType === 'final'}
                    onCheckedChange={(checked) => setScoreType(checked ? 'final' : 'ai')}
                  />
                  <span className="text-sm text-slate-600">Final Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={scoreType === 'ai'}
                    onCheckedChange={(checked) => setScoreType(checked ? 'ai' : 'final')}
                  />
                  <span className="text-sm text-slate-600">AI Score</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Score Range</label>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{scoreRangeMin}</span>
                <span>{scoreRangeMax}</span>
              </div>
              <Slider
                value={[scoreRangeMin, scoreRangeMax]}
                min={0}
                max={100}
                step={1}
                onValueChange={([min, max]) => {
                  setScoreRangeMin(min)
                  setScoreRangeMax(max)
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-slate-500">Presets:</span>
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => { setScoreRangeMin(0); setScoreRangeMax(59) }}
              >
                &lt;60 Critical
              </button>
              <span className="text-slate-300">|</span>
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => { setScoreRangeMin(60); setScoreRangeMax(79) }}
              >
                60 - 79 Warning
              </button>
              <span className="text-slate-300">|</span>
              <button
                className="text-xs text-blue-600 hover:underline"
                onClick={() => { setScoreRangeMin(80); setScoreRangeMax(100) }}
              >
                80 - 100 Good
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowScoreFilterModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setScoreFilter('custom')
                setShowScoreFilterModal(false)
              }}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Audio Files Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Audio Files</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Drop Zone */}
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-10 w-10 text-slate-400 mb-3" />
              <p className="font-medium text-slate-900">Upload Files</p>
              <p className="text-sm text-slate-500">Drag and Drop or click to upload</p>
            </div>

            {/* Files Selected */}
            {uploadFiles.length > 0 && (
              <div className="space-y-3">
                <p className="font-medium text-slate-900">Files Selected:</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left text-slate-600">#</th>
                        <th className="px-3 py-2 text-left text-slate-600">File Name</th>
                        <th className="px-3 py-2 text-left text-slate-600">Duration</th>
                        <th className="px-3 py-2 text-left text-slate-600">Status</th>
                        <th className="px-3 py-2 text-left text-slate-600">Progress</th>
                        <th className="px-3 py-2 text-left text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadFiles.map((file, i) => (
                        <tr key={file.id} className="border-b last:border-0">
                          <td className="px-3 py-2">{i + 1}</td>
                          <td className="px-3 py-2 text-blue-600">{file.name}</td>
                          <td className="px-3 py-2">{file.duration || '-'}</td>
                          <td className="px-3 py-2">
                            <span className={cn(
                              'flex items-center gap-1.5',
                              file.status === 'completed' && 'text-green-600',
                              file.status === 'uploading' && 'text-blue-600',
                              file.status === 'failed' && 'text-red-600',
                              file.status === 'validating' && 'text-yellow-600'
                            )}>
                              {file.status === 'completed' && <Check className="h-4 w-4" />}
                              {file.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
                              {file.status === 'failed' && <X className="h-4 w-4" />}
                              {file.status === 'validating' && <Filter className="h-4 w-4" />}
                              {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {file.progress > 0 && (
                              <div className="flex items-center gap-2">
                                <Progress value={file.progress} className="h-2 w-16" />
                                <span className="text-xs">{file.progress}%</span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              {file.status === 'failed' && (
                                <button className="p-1 hover:bg-slate-100 rounded">
                                  <RotateCcw className="h-4 w-4 text-slate-500" />
                                </button>
                              )}
                              <button className="p-1 hover:bg-slate-100 rounded">
                                <Trash2 className="h-4 w-4 text-slate-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Apply Metadata Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={applyMetadataToAll}
                onCheckedChange={setApplyMetadataToAll}
              />
              <span className="text-sm text-slate-600">Apply Metadata to all files</span>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Company</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Company..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acme">Acme Corp</SelectItem>
                    <SelectItem value="softline">Softline Solutions</SelectItem>
                    <SelectItem value="fintek">Fintek Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Project</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Project..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retention">Retention Q3</SelectItem>
                    <SelectItem value="support">Customer Support</SelectItem>
                    <SelectItem value="sales">Sales Outreach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Agent</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Agent..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="david">David Kim</SelectItem>
                    <SelectItem value="aisha">Aisha Mohamed</SelectItem>
                    <SelectItem value="michael">Michael Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              <strong>Individual Metadata Overrides:</strong> (click ✏️ to edit per file)
            </p>

            <p className="text-xs text-slate-500">
              <strong>Limits:</strong> Max 5 files / 25 min per call. Unsupported formats (.zip, .ogg) blocked.
            </p>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Mock files for demo
                setUploadFiles([
                  { id: 1, name: 'call_01234.mp3', duration: '05:15', status: 'completed', progress: 100 },
                  { id: 2, name: 'call_01235.mp3', duration: '06:40', status: 'uploading', progress: 45 },
                  { id: 3, name: 'call_01236.mp3', duration: '-', status: 'failed', progress: 0 },
                  { id: 4, name: 'call_01237.mp3', duration: '03:12', status: 'validating', progress: 40 },
                ])
              }}>
                Upload
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Loading skeleton for the calls table
 */
function CallsTableSkeleton() {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-300 hover:bg-transparent">
            {['Call ID', 'Date / Time', 'Agent', 'Company - Project', 'AI Score', 'Flag', 'Sentiment', 'Final Score', 'Actions'].map(
              (header) => (
                <TableHead key={header} className="text-sm font-bold text-slate-500">
                  {header}
                </TableHead>
              )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="border-b border-slate-200">
              <TableCell><Skeleton className="h-5 w-14" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-28" /></TableCell>
              <TableCell><Skeleton className="h-5 w-40" /></TableCell>
              <TableCell><Skeleton className="h-5 w-10" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell><Skeleton className="h-5 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
