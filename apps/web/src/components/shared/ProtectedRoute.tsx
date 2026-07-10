'use client';

import { useAuthStore } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children, requiredPermission }: { children: React.ReactNode, requiredPermission?: string }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (!isAuthenticated()) {
      router.push('/login');
    } else if (requiredPermission && user) {
      const hasPermission = user.roles.some((role: any) => 
        role.permissions.some((p: any) => p.action === requiredPermission)
      );
      if (!hasPermission) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, router, requiredPermission, user]);

  if (!mounted || !isAuthenticated()) {
    return null; // or loading spinner
  }

  return <>{children}</>;
}
