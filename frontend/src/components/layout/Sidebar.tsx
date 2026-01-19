import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Phone,
  Mail,
  Settings,
  Clock,
  Calendar,
  Puzzle,
  UserCircle,
  UserPlus,
  Shield,
  Wallet,
  FileText,
  ChevronDown,
  ChevronUp,
  Briefcase,
  ClipboardCheck,
  DollarSign,
  Tag,
  Layers,
  CalendarCog,
  Receipt,
  FileCheck,
  ListChecks,
  CheckSquare,
  TrendingUp,
  Building,
  FileBarChart
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/lib/constants/routes'
import { usePermissions } from '@/hooks/usePermissions'
import { PERMISSIONS, ROLES } from '@/lib/constants/permissions'
import { useModuleStore } from '@/store/moduleStore'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
  role?: string
  moduleRequired?: string
}

interface NavCategory {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
  moduleRequired?: string
}

const categories: (NavItem | NavCategory)[] = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: 'Sales',
    icon: Briefcase,
    moduleRequired: 'SALES',
    items: [
      {
        title: 'Leads',
        href: ROUTES.LEADS,
        icon: Users,
        permission: PERMISSIONS.LEADS_READ,
      },
      {
        title: 'Calls',
        href: ROUTES.CALLS,
        icon: Phone,
        permission: PERMISSIONS.CALLS_READ,
      },
      {
        title: 'Campaigns',
        href: ROUTES.CAMPAIGNS,
        icon: Mail,
        permission: PERMISSIONS.CAMPAIGNS_READ,
      },
    ],
  },
  {
    title: 'My Workspace',
    icon: UserCircle,
    moduleRequired: 'HRMS',
    items: [
      {
        title: 'Time Tracking',
        href: ROUTES.TIME_TRACKING,
        icon: Clock,
        permission: PERMISSIONS.HR_READ, // All employees can track time
      },
      {
        title: 'My Leaves',
        href: ROUTES.LEAVE_MANAGEMENT,
        icon: Calendar,
        permission: PERMISSIONS.HR_READ, // All employees can manage their leaves
      },
      {
        title: 'My Onboarding',
        href: ROUTES.ONBOARDING,
        icon: UserPlus,
        permission: PERMISSIONS.HR_READ, // All employees can see their onboarding
      },
      {
        title: 'My Salary',
        href: ROUTES.SALARY,
        icon: Wallet,
        permission: PERMISSIONS.HR_READ, // All employees can view their salary
      },
      {
        title: 'My Tax Declaration',
        href: ROUTES.TAX_DECLARATION,
        icon: FileText,
        permission: PERMISSIONS.HR_READ, // All employees can declare tax
      },
    ],
  },
  {
    title: 'HR Admin',
    href: ROUTES.HR_ADMIN,
    icon: Shield,
    permission: PERMISSIONS.HR_MANAGE,
    moduleRequired: 'HRMS',
  },
  {
    title: 'Leave Management',
    icon: Calendar,
    moduleRequired: 'HRMS',
    items: [
      {
        title: 'Leave Approvals',
        href: ROUTES.HR_ADMIN_LEAVES,
        icon: ClipboardCheck,
        permission: PERMISSIONS.HR_MANAGE,
      },
      {
        title: 'Leave Types',
        href: ROUTES.HR_ADMIN_LEAVE_TYPES,
        icon: Tag,
        permission: PERMISSIONS.HR_MANAGE,
      },
      {
        title: 'Manage Holidays',
        href: ROUTES.HR_ADMIN_MANAGE_HOLIDAYS,
        icon: CalendarCog,
        permission: PERMISSIONS.HR_MANAGE,
      },
    ],
  },
  {
    title: 'Onboarding',
    icon: UserPlus,
    moduleRequired: 'HRMS',
    items: [
      {
        title: 'Start Onboarding',
        href: ROUTES.HR_ADMIN_START_ONBOARDING,
        icon: UserPlus,
        permission: PERMISSIONS.HR_MANAGE,
      },
      {
        title: 'Manage Onboardings',
        href: ROUTES.HR_ADMIN_ONBOARDING,
        icon: Users,
        permission: PERMISSIONS.HR_MANAGE,
      },
      {
        title: 'Onboarding Templates',
        href: ROUTES.HR_ADMIN_ONBOARDING_TEMPLATES,
        icon: ListChecks,
        permission: PERMISSIONS.HR_MANAGE,
      },
      {
        title: 'Document Verification',
        href: ROUTES.HR_ADMIN_DOCUMENT_VERIFICATION,
        icon: FileCheck,
        permission: PERMISSIONS.HR_MANAGE,
      },
    ],
  },
  {
    title: 'Salary Management',
    icon: DollarSign,
    moduleRequired: 'HRMS',
    items: [
      {
        title: 'Salary Components',
        href: ROUTES.HR_ADMIN_SALARY_COMPONENTS,
        icon: Layers,
        permission: PERMISSIONS.HR_MANAGE,
      },
      {
        title: 'Salary Structures',
        href: ROUTES.HR_ADMIN_SALARY_STRUCTURES,
        icon: DollarSign,
        permission: PERMISSIONS.HR_MANAGE,
      },
      {
        title: 'Assign Salary',
        href: ROUTES.HR_ADMIN_ASSIGN_SALARY,
        icon: Wallet,
        permission: PERMISSIONS.HR_MANAGE,
      },
      {
        title: 'Process Increments',
        href: ROUTES.HR_ADMIN_PROCESS_INCREMENTS,
        icon: TrendingUp,
        permission: PERMISSIONS.HR_MANAGE,
      },
      {
        title: 'Generate Slips',
        href: ROUTES.HR_ADMIN_GENERATE_SLIPS,
        icon: Receipt,
        permission: PERMISSIONS.HR_MANAGE,
      },
      {
        title: 'Bank Details',
        href: ROUTES.HR_ADMIN_BANK_DETAILS,
        icon: Building,
        permission: PERMISSIONS.HR_MANAGE,
      },
    ],
  },
  {
    title: 'Tax Management',
    icon: FileText,
    moduleRequired: 'HRMS',
    items: [
      {
        title: 'Tax Proof Verification',
        href: ROUTES.HR_ADMIN_TAX_PROOF_VERIFICATION,
        icon: CheckSquare,
        permission: PERMISSIONS.HR_MANAGE,
      },
      {
        title: 'Generate Form 16',
        href: ROUTES.HR_ADMIN_GENERATE_FORM16,
        icon: FileBarChart,
        permission: PERMISSIONS.HR_MANAGE,
      },
    ],
  },
  {
    title: 'Reporting',
    icon: FileText,
    moduleRequired: 'REPORTS',
    items: [
      {
        title: 'Reports',
        href: ROUTES.REPORTS,
        icon: FileText,
        permission: PERMISSIONS.REPORTS_READ_OWN,
      },
    ],
  },
  {
    title: 'Administration',
    icon: Shield,
    items: [
      {
        title: 'Users',
        href: ROUTES.USERS,
        icon: UserCircle,
        permission: PERMISSIONS.USERS_READ,
      },
      {
        title: 'License Management',
        href: ROUTES.LICENSE_MANAGEMENT,
        icon: Shield,
        role: ROLES.ADMIN,
      },
      {
        title: 'Integrations',
        href: ROUTES.INTEGRATIONS,
        icon: Puzzle,
        permission: PERMISSIONS.INTEGRATIONS_READ,
      },
      {
        title: 'Billing',
        href: ROUTES.BILLING,
        icon: Wallet,
        permission: PERMISSIONS.BILLING_READ,
        moduleRequired: 'BILLING',
      },
    ],
  },
]

function isNavCategory(item: NavItem | NavCategory): item is NavCategory {
  return 'items' in item
}

export function Sidebar() {
  const location = useLocation()
  const { hasPermission, hasRole } = usePermissions()
  const { hasModule } = useModuleStore()
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({})

  // Auto-expand category containing the active page
  useEffect(() => {
    const currentPath = location.pathname

    // Find which category contains the active page
    categories.forEach((item) => {
      if (isNavCategory(item)) {
        const hasActivePage = item.items.some(
          (subItem) => currentPath === subItem.href || currentPath.startsWith(subItem.href + '/')
        )
        if (hasActivePage) {
          setOpenCategories((prev) => ({
            ...prev,
            [item.title]: true,
          }))
        }
      }
    })
  }, [location.pathname])

  const toggleCategory = (title: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  const renderNavItem = (item: NavItem, isNested = false) => {
    // Check module access
    if (item.moduleRequired && !hasModule(item.moduleRequired)) {
      return null
    }

    // Check permission
    if (item.permission && !hasPermission(item.permission)) {
      return null
    }

    // Check role
    if (item.role && !hasRole(item.role)) {
      return null
    }

    const Icon = item.icon
    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')

    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isNested && 'ml-3 pl-6',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <Icon className="h-5 w-5" />
        {item.title}
      </Link>
    )
  }

  const renderCategory = (category: NavCategory) => {
    // Check if category requires a module
    if (category.moduleRequired && !hasModule(category.moduleRequired)) {
      return null
    }

    // Filter items by module, permission, and role
    const filteredItems = category.items.filter((item) => {
      // Check module access
      if (item.moduleRequired && !hasModule(item.moduleRequired)) {
        return false
      }
      // Check permission
      if (item.permission && !hasPermission(item.permission)) {
        return false
      }
      // Check role
      if (item.role && !hasRole(item.role)) {
        return false
      }
      return true
    })

    if (filteredItems.length === 0) return null

    const isOpen = openCategories[category.title] ?? false
    const Icon = category.icon
    const hasActiveChild = filteredItems.some(
      (item) => location.pathname === item.href || location.pathname.startsWith(item.href + '/')
    )

    return (
      <div key={category.title}>
        <button
          onClick={() => toggleCategory(category.title)}
          className={cn(
            'w-full flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            hasActiveChild
              ? 'text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            {category.title}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {isOpen && (
          <div className="mt-1 space-y-1">
            {filteredItems.map((item) => renderNavItem(item, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-card border-r">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">C</span>
          </div>
          <span className="font-semibold text-lg">CRM System</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {categories.map((item) => {
          if (isNavCategory(item)) {
            return renderCategory(item)
          }
          return renderNavItem(item)
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t p-3">
        <Link
          to={ROUTES.SETTINGS}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            location.pathname === ROUTES.SETTINGS
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </aside>
  )
}
