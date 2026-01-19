import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { CreateCallDto } from '../api/callsApi'

interface CallLogFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateCallDto) => Promise<void>
  leadId?: string
  phoneNumber?: string
  initialData?: Partial<CreateCallDto>
  isSubmitting?: boolean
}

export function CallLogForm({
  open,
  onOpenChange,
  onSubmit,
  leadId,
  phoneNumber,
  initialData,
  isSubmitting,
}: CallLogFormProps) {
  const [formData, setFormData] = useState<CreateCallDto>({
    leadId: leadId || '',
    phoneNumber: phoneNumber || '',
    direction: 'OUTBOUND',
    duration: 0,
    notes: '',
    outcome: '',
    followUpRequired: false,
    followUpDate: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setFormData({
        leadId: initialData?.leadId || leadId || '',
        phoneNumber: initialData?.phoneNumber || phoneNumber || '',
        direction: initialData?.direction || 'OUTBOUND',
        duration: initialData?.duration || 0,
        notes: initialData?.notes || '',
        outcome: initialData?.outcome || '',
        followUpRequired: initialData?.followUpRequired || false,
        followUpDate: initialData?.followUpDate || '',
      })
      setErrors({})
    }
  }, [open, leadId, phoneNumber, initialData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    }
    if (formData.duration < 0) {
      newErrors.duration = 'Duration must be positive'
    }
    if (formData.followUpRequired && !formData.followUpDate) {
      newErrors.followUpDate = 'Follow-up date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      await onSubmit({
        ...formData,
        leadId: formData.leadId || undefined,
      })
      onOpenChange(false)
    }
  }

  const handleChange = (field: keyof CreateCallDto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Call</DialogTitle>
            <DialogDescription>Record a phone call with a lead or prospect</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-6">
            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className={errors.phoneNumber ? 'border-red-500' : ''}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Direction and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direction">Direction</Label>
                <select
                  id="direction"
                  value={formData.direction}
                  onChange={(e) => handleChange('direction', e.target.value as 'INBOUND' | 'OUTBOUND')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="OUTBOUND">Outbound</option>
                  <option value="INBOUND">Inbound</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
                  className={errors.duration ? 'border-red-500' : ''}
                />
                {errors.duration && (
                  <p className="text-sm text-red-500">{errors.duration}</p>
                )}
              </div>
            </div>

            {/* Outcome */}
            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <select
                id="outcome"
                value={formData.outcome}
                onChange={(e) => handleChange('outcome', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select outcome</option>
                <option value="Connected">Connected</option>
                <option value="Voicemail">Voicemail</option>
                <option value="No Answer">No Answer</option>
                <option value="Busy">Busy</option>
                <option value="Wrong Number">Wrong Number</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Call summary and key points..."
              />
            </div>

            {/* Follow-up */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  id="followUpRequired"
                  type="checkbox"
                  checked={formData.followUpRequired}
                  onChange={(e) => handleChange('followUpRequired', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="followUpRequired" className="cursor-pointer">
                  Follow-up required
                </Label>
              </div>
              {formData.followUpRequired && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="followUpDate">Follow-up Date</Label>
                  <Input
                    id="followUpDate"
                    type="datetime-local"
                    value={formData.followUpDate}
                    onChange={(e) => handleChange('followUpDate', e.target.value)}
                    className={errors.followUpDate ? 'border-red-500' : ''}
                  />
                  {errors.followUpDate && (
                    <p className="text-sm text-red-500">{errors.followUpDate}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Log Call'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
