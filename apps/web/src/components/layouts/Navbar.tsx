'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  FileText,
  Activity,
  CreditCard,
  X,
  ChevronDown,
  Boxes,
  Warehouse,
  CircleDollarSign,
  BookOpen,
  CheckCircle,
  Sparkles,
  Bell,
  User,
  Menu,
  Layers,
  Truck,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

export interface NavChild {
  name: string;
  href: string;
  icon?: any;
}

export interface NavItem {
  name: string;
  href?: string;
  icon: any;
  permission?: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, permission: 'read:dashboard' },
  { name: 'AI Command', href: '/ai', icon: Sparkles, permission: 'read:ai-dashboard' },
  {
    name: 'Master Data',
    icon: Layers,
    permission: 'read:master-data',
    children: [
      { name: 'Products', href: '/master-data/products', icon: Package },
      { name: 'Categories', href: '/master-data/categories', icon: Settings },
      { name: 'Brands', href: '/master-data/brands', icon: Settings },
      { name: 'Units', href: '/master-data/units', icon: Settings },
    ],
  },
  {
    name: 'Supply & Logistics',
    icon: Truck,
    permission: 'read:inventory',
    children: [
      { name: 'Stock View', href: '/inventory/stock', icon: Boxes },
      { name: 'Warehouses', href: '/inventory/warehouses', icon: Warehouse },
      { name: 'Adjustments', href: '/inventory/adjustments', icon: Package },
      { name: 'Suppliers', href: '/procurement/suppliers', icon: Users },
      { name: 'Purchase Orders', href: '/procurement/purchase-orders', icon: ShoppingCart },
    ],
  },
  {
    name: 'Sales & Finance',
    icon: TrendingUp,
    permission: 'read:sales',
    children: [
      { name: 'Customers', href: '/sales/customers', icon: Users },
      { name: 'Sales Orders', href: '/sales/orders', icon: ShoppingCart },
      { name: 'Chart of Accounts', href: '/finance/accounts', icon: BookOpen },
      { name: 'General Journal', href: '/finance/journals', icon: CircleDollarSign },
    ],
  },
  {
    name: 'Ops & System',
    icon: Activity,
    permission: 'read:operations',
    children: [
      { name: 'Approvals', href: '/approvals', icon: CheckCircle },
      { name: 'Workflows', href: '/workflows', icon: Activity },
      { name: 'Reports', href: '/reports', icon: FileText },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Navbar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileGroups, setExpandedMobileGroups] = useState<Record<string, boolean>>({});
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const toggleMobileGroup = (name: string) => {
    setExpandedMobileGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isParentActive = (item: NavItem) => {
    if (item.href) {
      return item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
    }
    if (item.children) {
      return item.children.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`));
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 border-b border-slate-800/80 text-slate-100 shadow-2xl backdrop-blur-md w-full">
      <div className="w-full max-w-[1600px] mx-auto px-2.5 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2 xl:gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-teal-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm xl:text-base font-black tracking-tight text-white whitespace-nowrap">
                  NRT AI <span className="text-blue-400">Ops</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-nowrap" ref={dropdownRef}>
            {navItems.map((item) => {
              const active = isParentActive(item);
              const isAi = item.href === '/ai';

              if (item.children) {
                const isOpen = activeDropdown === item.name;
                return (
                  <div key={item.name} className="relative">
                    <button
                      onClick={() => {
                        setActiveDropdown(isOpen ? null : item.name);
                        setIsUserMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-lg text-[11px] xl:text-xs font-semibold whitespace-nowrap transition-all duration-150",
                        active
                          ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                      )}
                    >
                      <item.icon className={cn("w-3.5 h-3.5", active ? "text-blue-400" : "text-slate-400")} />
                      <span>{item.name}</span>
                      <ChevronDown className={cn("w-3 h-3 transition-transform duration-200 opacity-70", isOpen && "rotate-180")} />
                    </button>

                    {/* Submenu Dropdown Popover */}
                    {isOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-800 mb-1">
                          {item.name}
                        </div>
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href;
                          const ChildIcon = child.icon || item.icon;
                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                                isChildActive
                                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30"
                                  : "text-slate-300 hover:text-white hover:bg-slate-800"
                              )}
                            >
                              <ChildIcon className={cn("w-3.5 h-3.5", isChildActive ? "text-white" : "text-slate-400")} />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150",
                    isAi
                      ? "bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:opacity-90 shadow-md shadow-blue-500/20 font-bold"
                      : active
                      ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  )}
                >
                  <item.icon className={cn("w-3.5 h-3.5", isAi ? "text-white animate-pulse" : active ? "text-blue-400" : "text-slate-400")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-900 animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-900"></span>
            </Link>

            {/* User Profile Pill & Dropdown */}
            <div className="relative hidden sm:block shrink-0">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setActiveDropdown(null);
                }}
                className="flex items-center gap-2.5 p-1 pl-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 transition-all text-left"
              >
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-white leading-tight max-w-[130px] truncate">
                    {mounted ? `${user?.firstName || ''} ${user?.lastName || ''}` : '...'}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight max-w-[130px] truncate">
                    {mounted ? user?.email : '...'}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* User Menu Popover */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <p className="text-xs font-semibold text-white">Signed in as</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Account Settings
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu (< 1024px) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {navItems.map((item) => {
            const active = isParentActive(item);

            if (item.children) {
              const isExpanded = expandedMobileGroups[item.name];
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleMobileGroup(item.name)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      active ? "bg-blue-600/20 text-blue-300" : "text-slate-300 hover:bg-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4 text-slate-400" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
                  </button>

                  {isExpanded && (
                    <div className="pl-8 space-y-1 pt-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "block px-3 py-1.5 rounded-md text-xs transition-colors",
                            pathname === child.href
                              ? "bg-blue-600 text-white font-semibold"
                              : "text-slate-400 hover:text-white hover:bg-slate-900"
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href!}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-blue-600 text-white font-semibold" : "text-slate-300 hover:bg-slate-900"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Mobile Sign Out */}
          {mounted && (
            <div className="pt-4 border-t border-slate-800 mt-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user?.firstName})
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
