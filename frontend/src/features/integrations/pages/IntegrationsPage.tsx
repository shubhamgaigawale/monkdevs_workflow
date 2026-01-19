import { Calendar, Phone, FileText, Mail, Link as LinkIcon } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { useIntegrations, useEnableIntegration, useDisableIntegration } from '../hooks/useIntegrations'
import { formatDateTime } from '@/lib/utils/formatters'
import { integrationsApi } from '../api/integrationsApi'
import type { IntegrationType } from '@/types/models'
import { usePagePermission } from '@/hooks/usePagePermission'
import { AccessDenied } from '@/components/common/AccessDenied'
import { PermissionGate } from '@/components/common/PermissionGate'
import { PERMISSIONS } from '@/lib/constants/permissions'

interface IntegrationCardData {
  type: IntegrationType
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  features: string[]
}

const integrationCards: IntegrationCardData[] = [
  {
    type: 'CALENDLY',
    name: 'Calendly',
    description: 'Sync appointments and schedules automatically',
    icon: Calendar,
    color: 'text-blue-600',
    features: ['Appointment sync', 'Calendar integration', 'Automatic lead updates'],
  },
  {
    type: 'RINGCENTRAL',
    name: 'RingCentral',
    description: 'Make and track calls directly from the CRM',
    icon: Phone,
    color: 'text-orange-600',
    features: ['Call tracking', 'Call recording', 'SMS messaging'],
  },
  {
    type: 'PANDADOC',
    name: 'PandaDoc',
    description: 'Create and send documents with e-signature',
    icon: FileText,
    color: 'text-green-600',
    features: ['Document templates', 'E-signatures', 'Contract management'],
  },
  {
    type: 'DOCUSIGN',
    name: 'DocuSign',
    description: 'Send and track digital signatures',
    icon: FileText,
    color: 'text-blue-600',
    features: ['E-signatures', 'Document tracking', 'Legal compliance'],
  },
  {
    type: 'MAILCHIMP',
    name: 'Mailchimp',
    description: 'Send email campaigns and newsletters',
    icon: Mail,
    color: 'text-yellow-600',
    features: ['Email campaigns', 'Audience management', 'Analytics'],
  },
]

export function IntegrationsPage() {
  // Internal permission check
  const { hasAccess, isLoading: checkingPermissions } = usePagePermission({
    permission: PERMISSIONS.INTEGRATIONS_READ
  })

  const { data: integrations, isLoading } = useIntegrations()
  const enableIntegration = useEnableIntegration()
  const disableIntegration = useDisableIntegration()

  const handleConnect = async (type: IntegrationType) => {
    try {
      const { authUrl } = await integrationsApi.getOAuthUrl(type)
      window.location.href = authUrl
    } catch (error: any) {
      console.error('Failed to get OAuth URL:', error)
    }
  }

  const handleDisconnect = async (type: IntegrationType) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return
    await disableIntegration.mutateAsync(type)
  }

  const getIntegrationStatus = (type: IntegrationType) => {
    return integrations?.find((i) => i.integrationType === type)
  }

  // Show loading while checking permissions
  if (checkingPermissions) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Show access denied if user doesn't have permission
  if (!hasAccess) {
    return <AccessDenied requiredPermission={PERMISSIONS.INTEGRATIONS_READ} />
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Connect your favorite tools and automate your workflow
          </p>
        </div>

        {/* Integration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrationCards.map((integration) => {
            const status = getIntegrationStatus(integration.type)
            const isConnected = status?.isConnected
            const isEnabled = status?.isEnabled
            const Icon = integration.icon

            return (
              <Card key={integration.type}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${integration.color}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        {isConnected && (
                          <div className="flex items-center gap-1 mt-1">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-xs text-muted-foreground">
                              Connected
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Features */}
                    <div>
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {integration.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Last Synced */}
                    {isConnected && status?.lastSyncedAt && (
                      <div className="text-xs text-muted-foreground">
                        Last synced: {formatDateTime(status.lastSyncedAt)}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!isConnected ? (
                        <Button
                          className="w-full"
                          onClick={() => handleConnect(integration.type)}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      ) : (
                        <>
                          {isEnabled ? (
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleDisconnect(integration.type)}
                            >
                              Disconnect
                            </Button>
                          ) : (
                            <Button
                              className="flex-1"
                              onClick={() => enableIntegration.mutate(integration.type)}
                            >
                              Enable
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
