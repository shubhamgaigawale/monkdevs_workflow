import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { CampaignForm } from '../components/CampaignForm'
import { useCreateCampaign } from '../hooks/useCampaigns'
import { ROUTES } from '@/lib/constants/routes'
import type { CreateCampaignDto } from '../api/campaignsApi'

export function CampaignCreatePage() {
  const navigate = useNavigate()
  const createCampaign = useCreateCampaign()

  const handleSubmit = async (data: CreateCampaignDto) => {
    await createCampaign.mutateAsync(data)
    navigate(ROUTES.CAMPAIGNS)
  }

  const handleCancel = () => {
    navigate(ROUTES.CAMPAIGNS)
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Campaign</h1>
          <p className="text-muted-foreground mt-2">
            Design and schedule your email or SMS campaign
          </p>
        </div>

        <CampaignForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createCampaign.isPending}
        />
      </div>
    </AppLayout>
  )
}
