import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAddDeclarationItem } from '../../hooks/useTax'
import type { TaxDeclaration } from '../../api/taxApi'
import { TAX_SECTIONS, type TaxSection } from '../../types/tax'

interface InvestmentSectionProps {
  declaration: TaxDeclaration
  canEdit: boolean
}

export function InvestmentSection({ declaration, canEdit }: InvestmentSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [section, setSection] = useState<TaxSection>('80C')
  const [subSection, setSubSection] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  const addItem = useAddDeclarationItem()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addItem.mutate(
      {
        declarationId: declaration.id,
        request: {
          section,
          subSection: subSection || undefined,
          description,
          declaredAmount: parseFloat(amount),
        },
      },
      {
        onSuccess: () => {
          setIsOpen(false)
          setSection('80C')
          setSubSection('')
          setDescription('')
          setAmount('')
        },
      }
    )
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  // Group items by section
  const itemsBySection = declaration.items.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = []
    }
    acc[item.section].push(item)
    return acc
  }, {} as Record<string, typeof declaration.items>)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Investment Declarations</CardTitle>
            <CardDescription>
              Declare your investments and deductions
            </CardDescription>
          </div>
          {canEdit && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Investment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Investment</DialogTitle>
                  <DialogDescription>
                    Add a new investment or deduction item
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tax Section</Label>
                    <Select value={section} onValueChange={(v) => setSection(v as TaxSection)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TAX_SECTIONS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            <div>
                              <div className="font-medium">{value.label}</div>
                              <div className="text-xs text-muted-foreground">{value.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sub-section (Optional)</Label>
                    <Input
                      placeholder="e.g., PPF, ELSS, LIC"
                      value={subSection}
                      onChange={(e) => setSubSection(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Input
                      required
                      placeholder="e.g., Public Provident Fund"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amount *</Label>
                    <Input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={addItem.isPending}>
                      {addItem.isPending ? 'Adding...' : 'Add Investment'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(itemsBySection).length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No investments declared yet. Click "Add Investment" to get started.
          </p>
        ) : (
          <div className="space-y-6">
            {Object.entries(itemsBySection).map(([sectionKey, items]) => {
              const sectionInfo = TAX_SECTIONS[sectionKey as TaxSection]
              const sectionTotal = items.reduce((sum, item) => sum + item.declaredAmount, 0)

              return (
                <div key={sectionKey} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{sectionInfo.label}</h3>
                      <p className="text-sm text-muted-foreground">{sectionInfo.description}</p>
                    </div>
                    <Badge variant="secondary">
                      Total: {formatCurrency(sectionTotal)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.description}</p>
                            {item.subSection && (
                              <Badge variant="outline" className="text-xs">
                                {item.subSection}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Amount: {formatCurrency(item.declaredAmount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getVerificationIcon(item.verificationStatus)}
                          <span className="text-sm text-muted-foreground capitalize">
                            {item.verificationStatus.toLowerCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
