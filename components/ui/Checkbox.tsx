
import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, label, disabled }) => {
  return (
    <div className="flex items-center">
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          flex items-center justify-center w-5 h-5 rounded border transition-all duration-200
          ${checked 
            ? 'bg-teal-600 border-teal-600 text-white' 
            : 'bg-white border-slate-300 text-transparent hover:border-teal-500'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Check size={14} strokeWidth={3} />
      </button>
      {label && (
        <label 
          htmlFor={id} 
          onClick={() => !disabled && onChange(!checked)}
          className={`ml-2 text-sm font-medium ${disabled ? 'text-slate-400' : 'text-slate-700 cursor-pointer'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};
