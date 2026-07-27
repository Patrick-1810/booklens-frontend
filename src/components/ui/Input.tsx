import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightLabelAction?: React.ReactNode;
}

export function Input({ label, id, type = 'text', rightLabelAction, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordInput = type === 'password';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-xs font-medium text-slate-300">
          {label}
        </label>
        {rightLabelAction}
      </div>

      <div className="relative">
        <input
          id={id}
          type={isPasswordInput && showPassword ? 'text' : type}
          className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all pr-10"
          {...props}
        />

        {isPasswordInput && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
            tabIndex={-1}
            aria-label="Alternar visibilidade da senha"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}