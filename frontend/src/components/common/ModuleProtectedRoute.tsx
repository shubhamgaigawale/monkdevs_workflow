import { Navigate } from 'react-router-dom'
import { useModuleStore } from '@/store/moduleStore'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, ArrowLeft } from 'lucide-react'

interface ModuleProtectedRouteProps {
  children: React.ReactNode
  moduleRequired: string
  permission?: string
}

/**
 * Protects routes that require specific modules to be enabled
 * Shows a friendly error message if the module is not licensed
 */
export function ModuleProtectedRoute({
  children,
  moduleRequired,
  permission,
}: ModuleProtectedRouteProps) {
  const { hasModule, isLoading } = useModuleStore()
  const { hasPermission } = usePermissions()

  // Show loading state while checking modules
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if module is enabled
  if (!hasModule(moduleRequired)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-orange-500" />
              <CardTitle>Module Not Available</CardTitle>
            </div>
            <CardDescription>
              The <strong>{moduleRequired}</strong> module is not included in your current subscription.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              To access this feature, please contact your administrator to upgrade your subscription plan.
            </p>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">What you can do:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Contact your system administrator</li>
                <li>Request access to the {moduleRequired} module</li>
                <li>Explore other available features</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.history.back()} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Check permission (if required)
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/access-denied" replace />
  }

  return <>{children}</>
}
