/**
 * Sidebar Component
 * Navigation sidebar with glassmorphism design
 * Features collapsible functionality with smooth animations
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Package,
  Wrench,
  Calendar,
  BarChart3,
  Users,
  Settings,
  FileText,
  Zap,
  MapPin,
  X,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isOpen: boolean; // Desktop: true = expanded, false = collapsed
  isMobileMenuOpen: boolean; // Mobile: overlay state
  onClose: () => void; // Close mobile overlay
  onToggle: () => void; // Toggle sidebar state
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    badge: null,
  },
  {
    name: 'Assets',
    href: '/assets',
    icon: Package,
    badge: null,
  },
  {
    name: 'Work Orders',
    href: '/work-orders',
    icon: Wrench,
    badge: { count: 12, variant: 'destructive' as const },
  },
  {
    name: 'Maintenance Plans',
    href: '/maintenance-plans',
    icon: Calendar,
    badge: null,
  },
  {
    name: 'Locations',
    href: '/locations',
    icon: MapPin,
    badge: null,
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Package,
    badge: { count: 3, variant: 'secondary' as const },
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    badge: null,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    badge: null,
  },
  {
    name: 'IoT Sensors',
    href: '/iot-sensors',
    icon: Zap,
    badge: { count: 24, variant: 'default' as const },
  },
  {
    name: 'Team',
    href: '/team',
    icon: Users,
    badge: null,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: null,
  },
];

export function Sidebar({ isOpen, isMobileMenuOpen, onClose, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full transform transition-all duration-300 ease-in-out group',
          'hidden lg:block',
          isOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Glass Background */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-r border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50" />
        
        {/* Content */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Header */}
          <div className={cn(
            "flex h-16 items-center border-b border-white/10 dark:border-slate-700/50 transition-all duration-300",
            isOpen ? "justify-between px-6" : "justify-center px-3"
          )}>
            {isOpen && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CM</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white transition-opacity duration-300">
                  CMMS
                </span>
              </div>
            )}
            
            {/* Toggle Button (Desktop) */}
            {isOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Collapsed Toggle Button */}
          {!isOpen && (
            <div className="absolute top-4 -right-3 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-6 w-6 rounded-full bg-white/90 dark:bg-slate-800/90 border border-white/20 dark:border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
              >
                <ChevronRight className="h-3 w-3 rotate-180" />
              </Button>
            </div>
          )}

          {/* Navigation */}
          <nav className={cn(
            "flex-1 space-y-1 py-4 transition-all duration-300",
            isOpen ? "px-3" : "px-2"
          )}>
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-xl text-sm font-medium transition-all duration-200 relative',
                    isOpen ? 'justify-between px-3 py-2.5' : 'justify-center px-2 py-3',
                    'hover:bg-white/50 hover:backdrop-blur-sm dark:hover:bg-slate-800/50',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3 relative">
                    <div className="relative">
                      <Icon
                        className={cn(
                          'h-5 w-5 transition-colors flex-shrink-0',
                          isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                        )}
                      />
                      {/* Notification badge for collapsed state */}
                      {!isOpen && item.badge && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {item.badge.count}
                          </span>
                        </div>
                      )}
                    </div>
                    {isOpen && (
                      <span className="transition-opacity duration-300">{item.name}</span>
                    )}
                  </div>

                  {isOpen && item.badge && (
                    <Badge
                      variant={item.badge.variant}
                      className="h-5 px-2 text-xs transition-opacity duration-300"
                    >
                      {item.badge.count}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {isOpen && (
            <div className="border-t border-white/10 dark:border-slate-700/50 p-4 transition-opacity duration-300">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-4 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      AI Assistant
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Get smart insights
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out lg:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Glass Background */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-r border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50" />
        
        {/* Content */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-white/10 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                CMMS
              </span>
            </div>
            
            {/* Close Button (Mobile) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    'hover:bg-white/50 hover:backdrop-blur-sm dark:hover:bg-slate-800/50',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  )}
                  onClick={onClose}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-colors',
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <Badge
                      variant={item.badge.variant}
                      className="h-5 px-2 text-xs"
                    >
                      {item.badge.count}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 dark:border-slate-700/50 p-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 p-4 border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    AI Assistant
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Get smart insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}