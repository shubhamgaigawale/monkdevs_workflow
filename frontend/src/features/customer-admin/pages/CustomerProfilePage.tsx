import { useCustomerProfile } from '../hooks/useCustomerProfile'
import { Building, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

export function CustomerProfilePage() {
  const { data: profile, isLoading } = useCustomerProfile()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100'
      case 'TRIAL':
        return 'text-blue-600 bg-blue-100'
      case 'SUSPENDED':
        return 'text-orange-600 bg-orange-100'
      case 'CLOSED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />
      case 'TRIAL':
        return <Clock className="w-4 h-4" />
      case 'SUSPENDED':
      case 'CLOSED':
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

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Building className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No customer profile found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Profile</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            View and manage your company profile
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Edit Profile
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.companyName}
              </h2>
              {profile.domain && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{profile.domain}</p>
              )}
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              profile.accountStatus
            )}`}
          >
            {getStatusIcon(profile.accountStatus)}
            {profile.accountStatus}
          </span>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Company Information
            </h3>

            {profile.industry && (
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Industry</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {profile.industry}
                  </p>
                </div>
              </div>
            )}

            {profile.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {profile.address}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {format(new Date(profile.createdAt), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact Information
            </h3>

            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Contact Person</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile.contactPerson}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  {profile.contactEmail}
                </a>
              </div>
            </div>

            {profile.contactPhone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <a
                    href={`tel:${profile.contactPhone}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {profile.contactPhone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {profile.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.notes}</p>
          </div>
        )}
      </div>

      {/* Account Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Account Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {format(new Date(profile.updatedAt), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Account Created</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {format(new Date(profile.createdAt), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
