import { useNavigate } from 'react-router-dom'
import { Moon, Sun, User, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { useAuthStore } from '@/store'
import { useTheme } from '@/hooks/useTheme'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TimeTrackingButton } from '@/components/common/TimeTrackingButton'
import { ROUTES } from '@/lib/constants/routes'
import { PERMISSIONS } from '@/lib/constants/permissions'

export function Header() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { theme, toggleTheme } = useTheme()
  const { hasPermission } = usePermissions()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  // Show time tracking button for employees with hr:read permission
  const canTrackTime = hasPermission(PERMISSIONS.HR_READ)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold hidden md:block">
            {user?.tenantName}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Tracking Button */}
          {canTrackTime && <TimeTrackingButton />}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-3 rounded-lg border px-3 py-2 hover:bg-accent cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <span className="text-sm font-medium">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </span>
                </div>
                <div className="hidden md:block text-left text-sm">
                  <p className="font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS)}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
