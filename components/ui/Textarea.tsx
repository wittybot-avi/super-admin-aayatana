
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>}
      <textarea
        id={inputId}
        className={`w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 hover:border-teal-300 disabled:bg-slate-50 disabled:text-slate-500 ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
