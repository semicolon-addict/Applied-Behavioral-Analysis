///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Added Questionaries navigation item for clinician sidebar
// Outcome: Clinicians can navigate to Questionaries section from the sidebar
// Short Description: Dashboard navigation component with role-based nav items including Questionaries
/////////////////////////////////////////////////////////////

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Stethoscope,
  Baby,
  MessageSquare,
  Settings,
  HeartHandshake,
  FileQuestion
} from 'lucide-react';

const getNavItems = (role: 'Admin' | 'Clinician' | 'Parent' | 'Unknown') => {
  switch (role) {
    case 'Admin':
      return [
        { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/dashboard#users', label: 'Manage Users', icon: Users },
        { href: '/admin/dashboard#analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/admin/dashboard#reports', label: 'All Reports', icon: FileText },
        { href: '/admin/dashboard#settings', label: 'Settings', icon: Settings },
      ];
    case 'Clinician':
      return [
        { href: '/clinician/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/clinician/dashboard#children', label: 'Assigned Children', icon: Baby },
        { href: '/clinician/dashboard#assessments', label: 'Assessments', icon: Stethoscope },
        { href: '/clinician/dashboard#questionnaires', label: 'Questionaries', icon: FileQuestion },
        { href: '/clinician/dashboard#messages', label: 'Messages', icon: MessageSquare },
      ];
    case 'Parent':
      return [
        { href: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/parent/dashboard#progress', label: 'Child Progress', icon: BarChart3 },
        { href: '/parent/dashboard#feedback', label: 'Clinician Feedback', icon: MessageSquare },
        { href: '/parent/dashboard#questionnaire', label: 'Questionnaire', icon: FileQuestion },
        { href: '/parent/dashboard#profile', label: 'My Profile', icon: Users },
      ];
    default:
      return [];
  }
};

export function DashboardNav() {
  const pathname = usePathname();

  const getRole = () => {
    if (pathname.startsWith('/admin')) return 'Admin';
    if (pathname.startsWith('/clinician')) return 'Clinician';
    if (pathname.startsWith('/parent')) return 'Parent';
    return 'Unknown';
  };

  const role = getRole();
  const navItems = getNavItems(role);

  if (navItems.length === 0) return null;

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link key={index} href={item.href}>
            <Button
              variant={isActive ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
