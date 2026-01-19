import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react'
import {
  useCurrentDeclaration,
  useCreateDeclaration,
  useCompareRegimes,
  useSubmitDeclaration,
} from '../hooks/useTax'
import { RegimeComparisonCard } from '../components/tax/RegimeComparisonCard'
import { InvestmentSection } from '../components/tax/InvestmentSection'
import { HraSection } from '../components/tax/HraSection'
import { TaxSummary } from '../components/tax/TaxSummary'

const CURRENT_FY = '2025-26'

export function TaxDeclarationPage() {
  const [selectedRegime, setSelectedRegime] = useState<'OLD' | 'NEW'>('OLD')

  // Queries
  const { data: declaration, isLoading, error } = useCurrentDeclaration(CURRENT_FY)
  const { data: comparison } = useCompareRegimes(CURRENT_FY)

  // Mutations
  const createDeclaration = useCreateDeclaration()
  const submitDeclaration = useSubmitDeclaration()

  const handleCreateDeclaration = () => {
    createDeclaration.mutate({
      financialYear: CURRENT_FY,
      regimeType: selectedRegime,
    })
  }

  const handleSubmit = () => {
    if (!declaration) return
    submitDeclaration.mutate(declaration.id)
  }

  if (isLoading) {
    return (
      <AppLayout title="Tax Declaration" subtitle="Declare your investments and calculate tax">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AppLayout>
    )
  }

  if (error && !declaration) {
    return (
      <AppLayout title="Tax Declaration" subtitle="Declare your investments and calculate tax">
        <Card>
          <CardHeader>
            <CardTitle>Get Started with Tax Declaration</CardTitle>
            <CardDescription>
              Create your tax declaration for FY {CURRENT_FY} to start saving tax
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Choose your preferred tax regime to create a declaration
              </AlertDescription>
            </Alert>

            {comparison && <RegimeComparisonCard comparison={comparison} />}

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={selectedRegime === 'OLD' ? 'default' : 'outline'}
                  onClick={() => setSelectedRegime('OLD')}
                >
                  Old Regime
                </Button>
                <Button
                  variant={selectedRegime === 'NEW' ? 'default' : 'outline'}
                  onClick={() => setSelectedRegime('NEW')}
                >
                  New Regime
                </Button>
              </div>
              <Button
                onClick={handleCreateDeclaration}
                disabled={createDeclaration.isPending}
              >
                {createDeclaration.isPending ? 'Creating...' : 'Create Declaration'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  if (!declaration) {
    return null
  }

  const canEdit = declaration.status === 'DRAFT'

  return (
    <AppLayout
      title="Tax Declaration"
      subtitle={`Financial Year ${CURRENT_FY}`}
    >
      <div className="space-y-6">
        {/* Status Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tax Declaration Status</CardTitle>
                <CardDescription>
                  Regime: {declaration.regimeType} | Status: {' '}
                  <Badge variant={
                    declaration.status === 'APPROVED' ? 'success' :
                    declaration.status === 'REJECTED' ? 'destructive' :
                    declaration.status === 'SUBMITTED' ? 'default' : 'secondary'
                  }>
                    {declaration.status}
                  </Badge>
                </CardDescription>
              </div>
              {canEdit && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitDeclaration.isPending || declaration.items.length === 0}
                >
                  {submitDeclaration.isPending ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Regime Comparison */}
        {comparison && <RegimeComparisonCard comparison={comparison} />}

        {/* Tax Summary */}
        <TaxSummary
          declaration={declaration}
          financialYear={CURRENT_FY}
          regimeType={declaration.regimeType}
        />

        {/* Investment Declarations */}
        <InvestmentSection
          declaration={declaration}
          canEdit={canEdit}
        />

        {/* HRA Declaration */}
        <HraSection
          declaration={declaration}
          canEdit={canEdit}
        />
      </div>
    </AppLayout>
  )
}
