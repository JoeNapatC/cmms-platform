/**
 * Header Component
 * Top navigation bar with glassmorphism design
 * Features hamburger menu for collapsible sidebar
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, Bell, Search, User, Settings, LogOut, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
}

export function Header({ onMenuClick, sidebarOpen = true }: HeaderProps) {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };

  const getUserInitials = () => {
    if (session?.user?.name) {
      const names = session.user.name.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}` 
        : names[0][0];
    }
    return 'U';
  };

  // Use CSS classes for responsive behavior to avoid hydration mismatch
  const getMenuIcon = () => {
    return (
      <>
        {/* Mobile: Always show hamburger menu */}
        <Menu className="h-5 w-5 lg:hidden" />
        {/* Desktop: Show collapse/expand based on sidebar state */}
        {sidebarOpen ? (
          <PanelLeftClose className="h-5 w-5 hidden lg:block" />
        ) : (
          <PanelLeft className="h-5 w-5 hidden lg:block" />
        )}
      </>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16">
      {/* Glass Background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-white/20 dark:bg-slate-900/80 dark:border-slate-700/50" />
      
      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Menu Button - Now visible on all screen sizes */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200 hover:scale-105 active:scale-95"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <div className="transition-transform duration-300 ease-in-out hover:rotate-180">
              {getMenuIcon()}
            </div>
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CM</span>
            </div>
            <span className="hidden sm:block font-semibold text-slate-900 dark:text-white">
              CMMS Platform
            </span>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search assets, work orders..."
              className="pl-10 bg-white/50 border-white/20 backdrop-blur-sm focus:bg-white/80 dark:bg-slate-800/50 dark:border-slate-700/50 dark:focus:bg-slate-800/80"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Search Button (Mobile) */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || "/avatars/01.svg"} alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white/90 backdrop-blur-xl border-white/20 dark:bg-slate-800/90 dark:border-slate-700/50" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email || 'user@company.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}