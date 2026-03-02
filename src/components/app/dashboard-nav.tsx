///////////////////////////////////////////////////
// Author: Shashank Kakad
// Inputs: Dashboard navigation with Super Admin role support and user management
// Outcome: Sidebar shows role-appropriate navigation items including Super Admin with user management
// Short Description: Enhanced dashboard-nav with Super Admin nav items and role-based menu
/////////////////////////////////////////////////////////////

'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/sheets-auth';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  MessageSquare,
  FileQuestion,
  ClipboardList,
} from 'lucide-react';

type Role = 'Admin' | 'Super Admin' | 'Clinician' | 'Parent' | 'Unknown';
type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  tab?: string;
  hash?: string;
};

const getNavItems = (role: Role): NavItem[] => {
  switch (role) {
    case 'Super Admin':
    case 'Admin':
      return [
        { href: '/admin/dashboard?tab=overview', label: 'Overview', icon: LayoutDashboard, tab: 'overview' },
        { href: '/admin/dashboard?tab=users', label: 'Manage Users', icon: Users, tab: 'users' },
        { href: '/admin/dashboard?tab=questionnaires', label: 'Questionnaires', icon: FileQuestion, tab: 'questionnaires' },
        { href: '/admin/dashboard?tab=analytics', label: 'Analytics', icon: BarChart3, tab: 'analytics' },
      ];
    case 'Clinician':
      return [
        { href: '/clinician/dashboard?tab=dashboard', label: 'Dashboard', icon: LayoutDashboard, tab: 'dashboard' },
        { href: '/clinician/dashboard?tab=ablls-r', label: 'ABLLS-R', icon: ClipboardList, tab: 'ablls-r' },
        { href: '/clinician/dashboard?tab=aflls', label: 'AFLS', icon: ClipboardList, tab: 'aflls' },
        { href: '/clinician/dashboard?tab=dayc-2', label: 'DAYC-2', icon: ClipboardList, tab: 'dayc-2' },
        { href: '/clinician/dashboard?tab=questionnaires', label: 'Questionnaires', icon: FileQuestion, tab: 'questionnaires' },
        { href: '/clinician/dashboard?tab=messages', label: 'Messages', icon: MessageSquare, tab: 'messages' },
      ];
    case 'Parent':
      return [
        { href: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/parent/dashboard#progress', label: 'Child Progress', icon: BarChart3, hash: '#progress' },
        { href: '/parent/dashboard#feedback', label: 'Clinician Feedback', icon: MessageSquare, hash: '#feedback' },
        { href: '/parent/dashboard#questionnaire', label: 'Intake Form', icon: FileQuestion, hash: '#questionnaire' },
        { href: '/parent/dashboard#profile', label: 'My Profile', icon: Users, hash: '#profile' },
      ];
    default:
      return [];
  }
};

export function DashboardNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentHash, setCurrentHash] = useState('');
  const [sessionRole, setSessionRole] = useState<Role>('Unknown');

  useEffect(() => {
    const updateHash = () => {
      setCurrentHash(typeof window !== 'undefined' ? window.location.hash : '');
    };

    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  useEffect(() => {
    const role = getSession()?.role;
    if (role === 'Super Admin' || role === 'Admin' || role === 'Clinician' || role === 'Parent') {
      setSessionRole(role);
    } else {
      setSessionRole('Unknown');
    }
  }, [pathname]);

  const getRole = (): Role => {
    if (pathname.startsWith('/admin')) return 'Admin';
    if (pathname.startsWith('/clinician')) return 'Clinician';
    if (pathname.startsWith('/parent')) return 'Parent';
    return 'Unknown';
  };

  const role = sessionRole !== 'Unknown' ? sessionRole : getRole();
  const navItems = getNavItems(role);

  if (navItems.length === 0) return null;

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const currentTab = searchParams.get('tab');
        const defaultTab = pathname.startsWith('/admin') ? 'overview' : pathname.startsWith('/clinician') ? 'dashboard' : null;
        const tabToCompare = currentTab || defaultTab;
        const targetPath = item.href.split('?')[0].split('#')[0];
        const isActive =
          (item.tab && pathname === targetPath && tabToCompare === item.tab) ||
          (item.hash && pathname === targetPath && currentHash === item.hash) ||
          (!item.tab && !item.hash && pathname === item.href);

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
