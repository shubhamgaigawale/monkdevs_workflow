import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Home } from 'lucide-react'
import { useUpdateHraDeclaration } from '../../hooks/useTax'
import type { TaxDeclaration } from '../../api/taxApi'

interface HraSectionProps {
  declaration: TaxDeclaration
  canEdit: boolean
}

export function HraSection({ declaration, canEdit }: HraSectionProps) {
  const [rentMonthly, setRentMonthly] = useState('')
  const [landlordName, setLandlordName] = useState('')
  const [landlordPan, setLandlordPan] = useState('')
  const [landlordAddress, setLandlordAddress] = useState('')
  const [isMetro, setIsMetro] = useState(false)

  const updateHra = useUpdateHraDeclaration()

  // Load existing HRA data
  useEffect(() => {
    if (declaration.hraDeclaration) {
      const hra = declaration.hraDeclaration
      setRentMonthly(hra.rentPaidMonthly.toString())
      setLandlordName(hra.landlordName)
      setLandlordPan(hra.landlordPan || '')
      setLandlordAddress(hra.landlordAddress)
      setIsMetro(hra.metroCity)
    }
  }, [declaration.hraDeclaration])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    updateHra.mutate({
      declarationId: declaration.id,
      request: {
        rentPaidMonthly: parseFloat(rentMonthly),
        landlordName,
        landlordPan: landlordPan || undefined,
        landlordAddress,
        metroCity: isMetro,
      },
    })
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const hasHra = !!declaration.hraDeclaration

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          <div>
            <CardTitle>HRA Declaration</CardTitle>
            <CardDescription>
              House Rent Allowance exemption details
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasHra && !canEdit ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="text-lg font-medium">
                  {formatCurrency(declaration.hraDeclaration!.rentPaidMonthly)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calculated Exemption</p>
                <p className="text-lg font-medium text-green-600">
                  {declaration.hraDeclaration!.calculatedExemption
                    ? formatCurrency(declaration.hraDeclaration!.calculatedExemption)
                    : 'Calculating...'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Landlord Name</p>
                <p className="text-lg font-medium">{declaration.hraDeclaration!.landlordName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">City Type</p>
                <p className="text-lg font-medium">
                  {declaration.hraDeclaration!.metroCity ? 'Metro' : 'Non-Metro'}
                </p>
              </div>
            </div>
            {declaration.hraDeclaration!.landlordAddress && (
              <div>
                <p className="text-sm text-muted-foreground">Landlord Address</p>
                <p className="text-sm">{declaration.hraDeclaration!.landlordAddress}</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Monthly Rent *</Label>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="15000"
                  value={rentMonthly}
                  onChange={(e) => setRentMonthly(e.target.value)}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label>Landlord Name *</Label>
                <Input
                  required
                  placeholder="John Doe"
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  disabled={!canEdit}
                />
              </div>

              <div className="space-y-2">
                <Label>Landlord PAN (if rent &gt; ₹1L/year)</Label>
                <Input
                  placeholder="ABCDE1234F"
                  value={landlordPan}
                  onChange={(e) => setLandlordPan(e.target.value.toUpperCase())}
                  maxLength={10}
                  disabled={!canEdit}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="metro"
                  checked={isMetro}
                  onCheckedChange={setIsMetro}
                  disabled={!canEdit}
                />
                <Label htmlFor="metro">Living in Metro City</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Landlord Address *</Label>
              <Input
                required
                placeholder="Complete address of landlord"
                value={landlordAddress}
                onChange={(e) => setLandlordAddress(e.target.value)}
                disabled={!canEdit}
              />
            </div>

            {hasHra && declaration.hraDeclaration?.calculatedExemption && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Calculated HRA Exemption:</span>{' '}
                  {formatCurrency(declaration.hraDeclaration.calculatedExemption)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  This amount will be deducted from your taxable income
                </p>
              </div>
            )}

            {canEdit && (
              <Button type="submit" disabled={updateHra.isPending}>
                {updateHra.isPending ? 'Saving...' : hasHra ? 'Update HRA' : 'Add HRA'}
              </Button>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  )
}
