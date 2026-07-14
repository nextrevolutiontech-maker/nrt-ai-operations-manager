import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, FileText, Activity, CreditCard, X, ChevronDown, ChevronRight, Boxes, Warehouse, CircleDollarSign, BookOpen, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, permission: 'read:dashboard' },
  { 
    name: 'Master Data', 
    icon: Settings, 
    permission: 'read:master-data',
    children: [
      { name: 'Products', href: '/master-data/products' },
      { name: 'Categories', href: '/master-data/categories' },
      { name: 'Brands', href: '/master-data/brands' },
      { name: 'Units', href: '/master-data/units' },
    ]
  },
  { 
    name: 'Inventory', 
    icon: Package, 
    permission: 'read:inventory',
    children: [
      { name: 'Stock View', href: '/inventory/stock', icon: Boxes },
      { name: 'Warehouses', href: '/inventory/warehouses', icon: Warehouse },
      { name: 'Adjustments', href: '/inventory/adjustments' },
    ]
  },
  { 
    name: 'Procurement', 
    icon: ShoppingCart, 
    permission: 'read:procurement',
    children: [
      { name: 'Suppliers', href: '/procurement/suppliers', icon: Users },
      { name: 'Purchase Orders', href: '/procurement/purchase-orders', icon: ShoppingCart },
    ]
  },
  { 
    name: 'Sales', 
    icon: Users, 
    permission: 'read:sales',
    children: [
      { name: 'Customers', href: '/sales/customers', icon: Users },
      { name: 'Sales Orders', href: '/sales/orders', icon: ShoppingCart },
    ]
  },
  { 
    name: 'Finance', 
    icon: CreditCard, 
    permission: 'read:finance',
    children: [
      { name: 'Chart of Accounts', href: '/finance/accounts', icon: BookOpen },
      { name: 'General Journal', href: '/finance/journals', icon: CircleDollarSign },
    ]
  },
  { name: 'Approvals', href: '/approvals', icon: CheckCircle, permission: 'read:approvals' },
  { name: 'Workflows', href: '/workflows', icon: Activity, permission: 'read:workflows' },
  { name: 'Reports', href: '/reports', icon: FileText, permission: 'read:reports' },
  { name: 'Settings', href: '/settings', icon: Settings, permission: 'read:settings' },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'Master Data': pathname.startsWith('/master-data'),
    'Inventory': pathname.startsWith('/inventory'),
    'Procurement': pathname.startsWith('/procurement'),
    'Sales': pathname.startsWith('/sales'),
    'Finance': pathname.startsWith('/finance'),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const userPermissions = user?.roles?.flatMap((r: any) => r.permissions?.map((p: any) => p.action)) || [];
  const filteredNav = mounted ? navItems.filter(item => userPermissions.includes(item.permission) || true) : navItems;

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside 
      className={cn(
        "fixed top-0 left-0 z-50 flex flex-col w-64 h-full bg-slate-900 text-slate-100 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wider uppercase bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">NRT AI Ops</h1>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
        {filteredNav.map((item) => {
          const isActive = item.href ? (pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== '/')) : false;
          const isExpanded = expandedMenus[item.name];

          if (item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname.startsWith('/' + item.name.toLowerCase().replace(' ', '-'))
                      ? "bg-slate-800 text-white" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-slate-400" />
                    {item.name}
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                {isExpanded && (
                  <div className="pl-10 pr-2 space-y-1 pt-1 pb-2">
                    {item.children.map(child => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "block px-3 py-2 rounded-md text-sm transition-colors",
                            isChildActive 
                              ? "bg-blue-600/10 text-blue-400 font-medium" 
                              : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                          )}
                        >
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
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {mounted && (
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex items-center w-full gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
