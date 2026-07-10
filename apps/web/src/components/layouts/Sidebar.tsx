import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, FileText, Activity, CreditCard } from 'lucide-react';
import { useAuthStore } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, permission: 'read:dashboard' },
  { name: 'Master Data', href: '/master-data', icon: Settings, permission: 'read:master-data' },
  { name: 'Inventory', href: '/inventory', icon: Package, permission: 'read:inventory' },
  { name: 'Procurement', href: '/procurement', icon: ShoppingCart, permission: 'read:procurement' },
  { name: 'Sales', href: '/sales', icon: Users, permission: 'read:sales' },
  { name: 'Finance', href: '/finance', icon: CreditCard, permission: 'read:finance' },
  { name: 'Workflow', href: '/workflow', icon: Activity, permission: 'read:workflow' },
  { name: 'Reports', href: '/reports', icon: FileText, permission: 'read:reports' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const userPermissions = user?.roles?.flatMap((r: any) => r.permissions?.map((p: any) => p.action)) || [];

  const filteredNav = navItems.filter(item => userPermissions.includes(item.permission) || true); // Defaulting to true for demo purposes, since we are doing a UI mockup.

  return (
    <aside className="fixed top-0 left-0 flex flex-col w-64 h-full bg-black text-white shadow-xl transition-transform z-50">
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wider uppercase text-white">NRT AI Ops</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center w-full gap-3 px-3 py-2 text-sm font-medium text-gray-400 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
