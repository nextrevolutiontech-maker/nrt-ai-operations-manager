'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../hooks/useAuth';
import { authService } from '../../services/auth';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore(state => state.setAuth);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      const response = await authService.login(data);
      setAuth(response.user, response.accessToken, response.refreshToken);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-center">NRT AI Operations Manager</h1>
        <h2 className="text-xl text-center text-gray-600">Admin Login</h2>
        
        {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring focus:ring-blue-200"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
