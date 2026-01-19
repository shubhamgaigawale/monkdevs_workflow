import { useState } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import { Mail, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'

export function NotificationsListPage() {
  const { data: notifications, isLoading } = useNotifications()
  const [filter, setFilter] = useState<'ALL' | 'EMAIL' | 'SMS' | 'PENDING' | 'SENT' | 'FAILED'>('ALL')

  const filteredNotifications = notifications?.filter((notification) => {
    if (filter === 'ALL') return true
    if (filter === 'EMAIL' || filter === 'SMS') return notification.type === filter
    return notification.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'text-green-600 bg-green-100'
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100'
      case 'FAILED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="w-4 h-4" />
      case 'PENDING':
        return <Clock className="w-4 h-4" />
      case 'FAILED':
        return <XCircle className="w-4 h-4" />
      default:
        return null
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          View and manage email and SMS notifications
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'EMAIL', 'SMS', 'PENDING', 'SENT', 'FAILED'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700'
            }`}
          >
            {filterOption}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {notifications?.length || 0}
              </p>
            </div>
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sent</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications?.filter((n) => n.status === 'SENT').length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {notifications?.filter((n) => n.status === 'PENDING').length || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {notifications?.filter((n) => n.status === 'FAILED').length || 0}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subject/Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications && filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {notification.type === 'EMAIL' ? (
                          <Mail className="w-5 h-5 text-blue-500 mr-2" />
                        ) : (
                          <MessageSquare className="w-5 h-5 text-green-500 mr-2" />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {notification.recipient}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {notification.subject || notification.content.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          notification.status
                        )}`}
                      >
                        {getStatusIcon(notification.status)}
                        {notification.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Mail className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No notifications found
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
