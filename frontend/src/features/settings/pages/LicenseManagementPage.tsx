import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle, XCircle, Clock, Shield, Users, Calendar, Zap } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import api from '@/lib/api/services'
import { toast } from 'sonner'
import { usePagePermission } from '@/hooks/usePagePermission'
import { ROLES } from '@/lib/constants/permissions'

interface LicenseInfo {
  planName: string
  expiryDate: string
  daysUntilExpiry: number
  userLimit: number
  currentUsers: number
  enabledModules: string[]
  status: 'ACTIVE' | 'GRACE_PERIOD' | 'EXPIRED'
  gracePeriodActive: boolean
  gracePeriodDaysRemaining: number
}

interface Module {
  id: string
  code: string
  name: string
  description: string
  icon: string
  displayOrder: number
  isEnabled: boolean
  isCoreModule: boolean
  basePrice: number
}

export function LicenseManagementPage() {
  usePagePermission({ role: ROLES.ADMIN })

  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [formData, setFormData] = useState({
    planName: 'PROFESSIONAL',
    userLimit: 50,
    expiryYears: 1,
    billingCycle: 'YEARLY',
  })

  // Fetch current license info
  const { data: licenseInfo, isLoading: licenseLoading } = useQuery<LicenseInfo>({
    queryKey: ['license-info'],
    queryFn: async () => {
      const response = await api.get('/api/license/info')
      return response.data.data
    },
  })

  // Fetch all available modules
  const { data: allModules, isLoading: modulesLoading } = useQuery<Module[]>({
    queryKey: ['all-modules'],
    queryFn: async () => {
      const response = await api.get('/api/modules/all')
      return response.data.data
    },
  })

  // Update license mutation
  const updateLicense = useMutation({
    mutationFn: async (data: any) => {
      // Get current user's tenant ID from localStorage
      const user = JSON.parse(localStorage.getItem('auth-storage') || '{}')
      const tenantId = user.state?.user?.tenantId

      if (!tenantId) {
        throw new Error('Tenant ID not found')
      }

      const expiryDate = new Date()
      expiryDate.setFullYear(expiryDate.getFullYear() + data.expiryYears)

      const response = await api.post(`/api/license/admin/tenants/${tenantId}`, {
        planName: data.planName,
        modules: data.modules,
        userLimit: data.userLimit,
        expiryDate: expiryDate.toISOString(),
        billingCycle: data.billingCycle,
        gracePeriodDays: 30,
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('License updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['license-info'] })
      queryClient.invalidateQueries({ queryKey: ['modules-enabled'] })
      setIsEditing(false)

      // Force refresh modules in store
      window.location.reload()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to update license')
    },
  })

  // Initialize selected modules when entering edit mode
  const handleStartEditing = () => {
    if (licenseInfo) {
      setSelectedModules(licenseInfo.enabledModules)
      setFormData({
        planName: licenseInfo.planName || 'PROFESSIONAL',
        userLimit: licenseInfo.userLimit || 50,
        expiryYears: 1,
        billingCycle: 'YEARLY',
      })
    }
    setIsEditing(true)
  }

  const handleModuleToggle = (moduleCode: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleCode)
        ? prev.filter((code) => code !== moduleCode)
        : [...prev, moduleCode]
    )
  }

  const handleSubmit = () => {
    if (selectedModules.length === 0) {
      toast.error('Please select at least one module')
      return
    }

    updateLicense.mutate({
      ...formData,
      modules: selectedModules,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500'
      case 'GRACE_PERIOD':
        return 'bg-orange-500'
      case 'EXPIRED':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-5 w-5" />
      case 'GRACE_PERIOD':
        return <Clock className="h-5 w-5" />
      case 'EXPIRED':
        return <XCircle className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  if (licenseLoading || modulesLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">License Management</h1>
          <p className="text-muted-foreground">
            Manage your subscription plan and enabled modules
          </p>
        </div>

      {/* Current License Status */}
      {licenseInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current License Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Status</div>
                <Badge className={`${getStatusColor(licenseInfo.status)} text-white`}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(licenseInfo.status)}
                    {licenseInfo.status.replace('_', ' ')}
                  </span>
                </Badge>
              </div>

              {/* Plan */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Plan</div>
                <div className="text-lg font-semibold">{licenseInfo.planName}</div>
              </div>

              {/* Users */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Users
                </div>
                <div className="text-lg font-semibold">
                  {licenseInfo.currentUsers} / {licenseInfo.userLimit}
                </div>
              </div>

              {/* Expiry */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Expiry
                </div>
                <div className="text-lg font-semibold">
                  {licenseInfo.daysUntilExpiry > 0
                    ? `${licenseInfo.daysUntilExpiry} days`
                    : 'Expired'}
                </div>
              </div>
            </div>

            {/* Warning for expiring soon */}
            {licenseInfo.daysUntilExpiry <= 30 && licenseInfo.daysUntilExpiry > 0 && (
              <Alert className="border-orange-500">
                <Clock className="h-4 w-4 text-orange-500" />
                <AlertTitle>Subscription Expiring Soon</AlertTitle>
                <AlertDescription>
                  Your subscription will expire on{' '}
                  {new Date(licenseInfo.expiryDate).toLocaleDateString()}. Update your license to
                  continue using all features.
                </AlertDescription>
              </Alert>
            )}

            {/* Warning for grace period */}
            {licenseInfo.gracePeriodActive && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Grace Period Active</AlertTitle>
                <AlertDescription>
                  Your subscription has expired but you have {licenseInfo.gracePeriodDaysRemaining}{' '}
                  days remaining in the grace period. Update your license immediately to avoid
                  service disruption.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Module Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Enabled Modules
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Select the modules you want to enable'
                  : 'Modules currently enabled in your subscription'}
              </CardDescription>
            </div>
            {!isEditing && (
              <Button onClick={handleStartEditing}>Update License</Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <>
              {/* License Configuration Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="planName">Plan Name</Label>
                  <Select
                    value={formData.planName}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, planName: value }))
                    }
                  >
                    <SelectTrigger id="planName">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userLimit">User Limit</Label>
                  <Input
                    id="userLimit"
                    type="number"
                    min="1"
                    value={formData.userLimit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, userLimit: parseInt(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryYears">Validity (Years)</Label>
                  <Select
                    value={formData.expiryYears.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, expiryYears: parseInt(value) }))
                    }
                  >
                    <SelectTrigger id="expiryYears">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="3">3 Years</SelectItem>
                      <SelectItem value="5">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Module Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allModules?.map((module) => (
                  <div
                    key={module.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedModules.includes(module.code)
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-gray-300'
                    } ${module.isCoreModule ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !module.isCoreModule && handleModuleToggle(module.code)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedModules.includes(module.code)}
                        disabled={module.isCoreModule}
                        onCheckedChange={() => !module.isCoreModule && handleModuleToggle(module.code)}
                      />
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {module.name}
                          {module.isCoreModule && (
                            <Badge variant="secondary" className="text-xs">
                              Core
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {module.description}
                        </div>
                        {module.basePrice > 0 && (
                          <div className="text-sm font-medium mt-2">
                            ${module.basePrice}/month
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmit}
                  disabled={updateLicense.isPending || selectedModules.length === 0}
                >
                  {updateLicense.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update License'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={updateLicense.isPending}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Display Enabled Modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allModules
                  ?.filter((module) => licenseInfo?.enabledModules.includes(module.code))
                  .map((module) => (
                    <div key={module.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold">{module.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {module.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {licenseInfo && licenseInfo.enabledModules.length === 0 && (
                <Alert>
                  <AlertDescription>
                    No modules are currently enabled. Click "Update License" to enable modules.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  )
}
