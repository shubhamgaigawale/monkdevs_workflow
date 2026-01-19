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

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [isRegistrationAllowed, setIsRegistrationAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if registration is allowed
    const checkRegistrationStatus = async () => {
      try {
        const response = await api.get('/api/auth/registration-status')
        setIsRegistrationAllowed(response.data.data)
      } catch (error) {
        // If endpoint fails, assume registration is allowed
        setIsRegistrationAllowed(true)
      }
    }

    checkRegistrationStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login(formData)
      toast.success('Login successful!')
      navigate(ROUTES.DASHBOARD)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
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
          <CardTitle className="text-3xl font-bold text-center text-gray-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-base text-gray-600">
            Enter your credentials to access your CRM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {isRegistrationAllowed === true && (
            <div className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <Link to={ROUTES.REGISTER} className="text-purple-600 hover:text-purple-700 hover:underline font-semibold">
                Sign up
              </Link>
            </div>
          )}
          {isRegistrationAllowed === false && (
            <div className="text-sm text-center text-gray-500 italic">
              Registration is closed. Please contact your administrator to create an account.
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
