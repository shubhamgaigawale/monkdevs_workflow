import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingDown } from 'lucide-react'
import { useTaxCalculation } from '../../hooks/useTax'
import type { TaxDeclaration } from '../../api/taxApi'
import type { TaxRegimeType } from '../../types/tax'

interface TaxSummaryProps {
  declaration: TaxDeclaration
  financialYear: string
  regimeType: TaxRegimeType
}

export function TaxSummary({ declaration, financialYear, regimeType }: TaxSummaryProps) {
  const { data: calculation, isLoading } = useTaxCalculation(financialYear, regimeType)

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  if (isLoading || !calculation) {
    return null
  }

  const totalTax = calculation.totalTax + calculation.cess

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Summary</CardTitle>
        <CardDescription>
          Your estimated tax for FY {financialYear} ({regimeType} Regime)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Gross Salary</p>
            <p className="text-2xl font-bold">{formatCurrency(calculation.grossSalary)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Deductions</p>
            <p className="text-2xl font-bold text-green-600">
              <TrendingDown className="inline h-5 w-5 mr-1" />
              {formatCurrency(calculation.totalDeductions)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Taxable Income</p>
            <p className="text-2xl font-bold">{formatCurrency(calculation.taxableIncome)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Tax (incl. cess)</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totalTax)}
            </p>
            <p className="text-xs text-muted-foreground">
              Monthly TDS: {formatCurrency(calculation.tdsMonthly)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
