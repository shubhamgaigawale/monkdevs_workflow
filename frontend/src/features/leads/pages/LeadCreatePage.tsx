import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LeadForm } from '../components/LeadForm'
import { useCreateLead } from '../hooks/useLeads'
import { ROUTES } from '@/lib/constants/routes'
import type { CreateLeadDto } from '../api/leadsApi'

export function LeadCreatePage() {
  const navigate = useNavigate()
  const createLead = useCreateLead()

  const handleSubmit = async (data: CreateLeadDto) => {
    await createLead.mutateAsync(data)
    navigate(ROUTES.LEADS)
  }

  const handleCancel = () => {
    navigate(ROUTES.LEADS)
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Lead</h1>
          <p className="text-muted-foreground mt-2">
            Add a new lead to your pipeline
          </p>
        </div>

        <LeadForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createLead.isPending}
        />
      </div>
    </AppLayout>
  )
}
