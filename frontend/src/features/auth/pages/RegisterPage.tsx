import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'
import api from '@/lib/api/services'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)
  const isLoading = useAuthStore((state) => state.isLoading)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    tenantName: '',
  })

  const [isRegistrationAllowed, setIsRegistrationAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if registration is allowed
    const checkRegistrationStatus = async () => {
      try {
        const response = await api.get('/api/auth/registration-status')
        const allowed = response.data.data
        setIsRegistrationAllowed(allowed)

        if (!allowed) {
          toast.error('Registration is closed. Please contact your administrator.')
          setTimeout(() => {
            navigate(ROUTES.LOGIN)
          }, 2000)
        }
      } catch (error) {
        // If endpoint fails, assume registration is allowed
        setIsRegistrationAllowed(true)
      }
    }

    checkRegistrationStatus()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Generate subdomain from tenant name (lowercase, remove spaces and special chars)
      const tenantSubdomain = formData.tenantName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20)

      await register({
        ...formData,
        tenantSubdomain,
      })
      toast.success('Registration successful!')
      navigate(ROUTES.DASHBOARD)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Show loading or blocking message if registration is not allowed
  if (isRegistrationAllowed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-2xl bg-white">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">Registration Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Registration is currently closed. Please contact your system administrator to create an account.
                Redirecting to login...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-2xl bg-white">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">C</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-gray-900">Create Account</CardTitle>
          <CardDescription className="text-center text-base text-gray-600">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-11 bg-gray-50 border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-11 bg-gray-50 border-gray-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-11 bg-gray-50 border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantName" className="text-gray-700 font-medium">Company Name</Label>
              <Input
                id="tenantName"
                name="tenantName"
                type="text"
                placeholder="Acme Inc"
                value={formData.tenantName}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-11 bg-gray-50 border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="h-11 bg-gray-50 border-gray-300"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-purple-600 hover:text-purple-700 hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
