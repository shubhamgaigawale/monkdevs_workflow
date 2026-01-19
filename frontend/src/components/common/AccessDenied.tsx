import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'

interface AccessDeniedProps {
  message?: string
  requiredPermission?: string
  showBackButton?: boolean
}

export function AccessDenied({
  message = "You don't have permission to access this page",
  requiredPermission,
  showBackButton = true
}: AccessDeniedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-4">
              <ShieldAlert className="h-12 w-12 text-red-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>

          <p className="text-gray-600 mb-4">
            {message}
          </p>

          {requiredPermission && (
            <div className="bg-gray-100 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                Required permission: <code className="font-mono text-xs bg-white px-2 py-1 rounded">{requiredPermission}</code>
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-6">
            If you believe this is an error, please contact your administrator.
          </p>

          <div className="flex gap-3 justify-center">
            {showBackButton && (
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}

            <Link to={ROUTES.DASHBOARD}>
              <Button>
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
