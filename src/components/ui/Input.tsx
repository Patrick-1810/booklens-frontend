import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-300 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
        {...props}
      />
    </div>
  );
}