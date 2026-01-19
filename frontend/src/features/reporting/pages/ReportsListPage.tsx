import { useState } from 'react'
import { useReports } from '../hooks/useReports'
import { FileText, BarChart, TrendingUp, Users, Phone, Mail, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export function ReportsListPage() {
  const { data: reports, isLoading } = useReports()
  const [filter, setFilter] = useState<string>('ALL')

  const filteredReports = reports?.filter((report) => {
    if (filter === 'ALL') return true
    return report.type === filter
  })

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'LEAD_CONVERSION':
        return <TrendingUp className="w-5 h-5" />
      case 'CALL_ACTIVITY':
        return <Phone className="w-5 h-5" />
      case 'CAMPAIGN_PERFORMANCE':
        return <Mail className="w-5 h-5" />
      case 'SALES_REVENUE':
        return <BarChart className="w-5 h-5" />
      case 'USER_ACTIVITY':
        return <Users className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'LEAD_CONVERSION':
        return 'text-green-600 bg-green-100'
      case 'CALL_ACTIVITY':
        return 'text-blue-600 bg-blue-100'
      case 'CAMPAIGN_PERFORMANCE':
        return 'text-purple-600 bg-purple-100'
      case 'SALES_REVENUE':
        return 'text-orange-600 bg-orange-100'
      case 'USER_ACTIVITY':
        return 'text-pink-600 bg-pink-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Generate and view analytics reports
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Generate New Report
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          'ALL',
          'LEAD_CONVERSION',
          'CALL_ACTIVITY',
          'CAMPAIGN_PERFORMANCE',
          'SALES_REVENUE',
          'USER_ACTIVITY',
          'CUSTOM',
        ].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700'
            }`}
          >
            {filterOption.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Reports
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {reports?.length || 0}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Lead Reports
              </p>
              <p className="text-2xl font-bold text-green-600">
                {reports?.filter((r) => r.type === 'LEAD_CONVERSION').length || 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Call Reports
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {reports?.filter((r) => r.type === 'CALL_ACTIVITY').length || 0}
              </p>
            </div>
            <Phone className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Campaign Reports
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {reports?.filter((r) => r.type === 'CAMPAIGN_PERFORMANCE').length || 0}
              </p>
            </div>
            <Mail className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports && filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${getReportTypeColor(report.type)}`}
                >
                  {getReportTypeIcon(report.type)}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {report.name}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportTypeColor(
                    report.type
                  )}`}
                >
                  {report.type.replace('_', ' ')}
                </span>
              </div>

              {report.startDate && report.endDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(new Date(report.startDate), 'MMM dd')} -{' '}
                    {format(new Date(report.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-colors">
                  View
                </button>
                <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Download
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No reports found</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Generate Your First Report
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
