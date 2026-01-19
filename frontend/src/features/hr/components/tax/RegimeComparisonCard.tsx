import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, TrendingUp, ArrowRight } from 'lucide-react'
import type { TaxComparisonResponse } from '../../api/taxApi'

interface RegimeComparisonCardProps {
  comparison: TaxComparisonResponse
}

export function RegimeComparisonCard({ comparison }: RegimeComparisonCardProps) {
  const { oldRegime, newRegime, savingsAmount, recommendedRegime } = comparison

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const oldTotal = oldRegime.totalTax + oldRegime.cess
  const newTotal = newRegime.totalTax + newRegime.cess

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Regime Comparison</CardTitle>
        <CardDescription>
          Compare Old vs New tax regime to choose the best option
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Old Regime */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Old Regime</h3>
              {recommendedRegime === 'OLD' && (
                <Badge variant="success">Recommended</Badge>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Salary</span>
                <span className="font-medium">{formatCurrency(oldRegime.grossSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deductions</span>
                <span className="font-medium text-green-600">
                  - {formatCurrency(oldRegime.totalDeductions)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxable Income</span>
                <span className="font-medium">{formatCurrency(oldRegime.taxableIncome)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-muted-foreground">Total Tax</span>
                <span className="font-bold text-red-600">{formatCurrency(oldTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Income</span>
                <span className="font-bold text-green-600">{formatCurrency(oldRegime.netIncome)}</span>
              </div>
            </div>
          </div>

          {/* Comparison Arrow */}
          <div className="flex items-center justify-center">
            <div className="text-center space-y-2">
              <ArrowRight className="h-8 w-8 mx-auto text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">You save</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(savingsAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  with {recommendedRegime} regime
                </p>
              </div>
            </div>
          </div>

          {/* New Regime */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">New Regime</h3>
              {recommendedRegime === 'NEW' && (
                <Badge variant="success">Recommended</Badge>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Salary</span>
                <span className="font-medium">{formatCurrency(newRegime.grossSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deductions</span>
                <span className="font-medium text-green-600">
                  - {formatCurrency(newRegime.totalDeductions)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxable Income</span>
                <span className="font-medium">{formatCurrency(newRegime.taxableIncome)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-muted-foreground">Total Tax</span>
                <span className="font-bold text-red-600">{formatCurrency(newTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Income</span>
                <span className="font-bold text-green-600">{formatCurrency(newRegime.netIncome)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
