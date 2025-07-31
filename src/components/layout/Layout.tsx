/**
 * Main Layout Component
 * Implements the liquid-glass design language with glassmorphism effects
 * Features collapsible sidebar with smooth animations
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  // Sidebar state: true = open, false = collapsed
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  // Mobile sidebar overlay state
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleSidebar = () => {
    // On mobile, toggle the overlay
    if (window.innerWidth < 1024) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      // On desktop, toggle collapse state
      setSidebarOpen(!sidebarOpen);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Glass overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/5 pointer-events-none" />

      {/* Header */}
      <Header 
        onMenuClick={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        isMobileMenuOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300 ease-in-out',
          // Dynamic margin based on sidebar state
          'lg:ml-64', // Default sidebar width
          !sidebarOpen && 'lg:ml-16', // Collapsed sidebar width
          'pt-16', // Header height
          className
        )}
      >
        {/* Content Container with Glass Effect */}
        <div className="min-h-[calc(100vh-4rem)] p-2 lg:p-4">
          <div className="mx-auto max-w-7xl">
            {/* Glass Container */}
            <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl shadow-black/5 dark:bg-slate-800/70 dark:border-slate-700/50">
              {/* Inner glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
              
              {/* Content */}
              <div className="relative z-10 p-4 lg:p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </div>
  );
}