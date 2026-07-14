import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '../../lib/utils';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

export function FormInput({ label, error, registration, className, type = 'text', ...props }: FormInputProps) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          className={cn(
            "block w-full px-3 py-2.5 border rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 transition-all",
            error 
              ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500" 
              : "border-slate-200 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-300",
            className
          )}
          {...registration}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
