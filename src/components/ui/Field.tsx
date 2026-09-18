import { ReactNode } from 'react';

interface FieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}

export function Field({ label, error, children, required }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ invalid, className = '', ...props }: InputProps) {
  return (
    <input
      className={`input-base ${invalid ? 'border-red-500 ring-2 ring-red-500/20' : ''} ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid, className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`input-base ${invalid ? 'border-red-500 ring-2 ring-red-500/20' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function TextArea({ invalid, className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`input-base ${invalid ? 'border-red-500 ring-2 ring-red-500/20' : ''} ${className}`}
      {...props}
    />
  );
}
