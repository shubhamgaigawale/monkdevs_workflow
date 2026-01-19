import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateUser } from '../hooks/useUsers'

interface CreateUserDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateUserDialog({ open, onClose }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    roleNames: [] as string[],
  })

  const createUser = useCreateUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUser.mutateAsync(formData)
      onClose()
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        roleNames: [],
      })
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roleNames: prev.roleNames.includes(role)
        ? prev.roleNames.filter((r) => r !== role)
        : [...prev.roleNames, role],
    }))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Add New User</h3>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Min 8 characters"
              required
              minLength={8}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="space-y-2">
              {['ADMIN', 'MANAGER', 'SUPERVISOR', 'AGENT', 'HR_MANAGER', 'IT_ADMIN'].map((role) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.roleNames.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{role.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
