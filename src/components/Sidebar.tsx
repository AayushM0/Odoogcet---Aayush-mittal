'use client';

import { usePathname } from 'next/navigation';

interface SidebarProps {
  user: any;
  unreadCount: number;
}

export default function Sidebar({ user, unreadCount }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const adminLinks = [
    { href: '/home', label: 'Dashboard', icon: '▤' },
    { href: '/admin/employees', label: 'Employees', icon: '⚑' },
    { href: '/attendance', label: 'Attendance', icon: '✓' },
    { href: '/leave', label: 'Leave', icon: '⊡' },
    { href: '/payroll', label: 'Payroll', icon: '₹' },
    { href: '/reports', label: 'Reports', icon: '≡' },
    { href: '/notifications', label: 'Notifications', icon: '●', badge: unreadCount },
    { href: '/profile', label: 'Profile', icon: '◉' },
  ];

  const employeeLinks = [
    { href: '/home', label: 'Home', icon: '▤' },
    { href: '/attendance', label: 'Attendance', icon: '✓' },
    { href: '/leave', label: 'Leave', icon: '⊡' },
    { href: '/payroll', label: 'Payroll', icon: '₹' },
    { href: '/notifications', label: 'Notifications', icon: '●', badge: unreadCount },
    { href: '/profile', label: 'Profile', icon: '◉' },
  ];

  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">Dayflow</h1>
        <p className="text-xs text-gray-500 mt-1">Every workday, perfectly aligned</p>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`
              flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                isActive(link.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </div>
            {link.badge && link.badge > 0 && (
              <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
                {link.badge}
              </span>
            )}
          </a>
        ))}
      </nav>

      {/* Onboard Button (Admin Only) */}
      {user?.role === 'admin' && (
        <div className="p-4 border-t border-gray-200">
          <a
            href="/onboard"
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <span className="mr-2">+</span>
            Onboard Employee
          </a>
        </div>
      )}
    </div>
  );
}
