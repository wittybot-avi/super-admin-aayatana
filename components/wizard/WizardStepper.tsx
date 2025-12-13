import React from 'react';
import { Check } from 'lucide-react';

interface WizardStepperProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep, totalSteps, onStepClick }) => {
  const steps = [
    'Profile',
    'Modules',
    'Settings',
    'Identity',
    'Users',
    'Devices',
    'Review'
  ];

  return (
    <div className="mb-10 px-4">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full -z-10" />
        
        {/* Active Line (Progress) */}
        <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-teal-500 rounded-full -z-10 transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const isFuture = stepNum > currentStep;

          return (
            <div 
              key={label} 
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => onStepClick(stepNum)}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 shadow-sm z-10 ${
                  isCompleted 
                    ? 'bg-teal-500 border-teal-500 text-white scale-100 hover:bg-teal-600' : 
                  isCurrent 
                    ? 'bg-white border-teal-500 text-teal-600 scale-110 shadow-teal-200 ring-4 ring-teal-50' : 
                    'bg-slate-50 border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600'
                }`}
              >
                {isCompleted ? <Check size={18} strokeWidth={3} /> : <span className="text-sm font-bold">{stepNum}</span>}
              </div>
              <span className={`text-xs mt-3 font-semibold uppercase tracking-wide transition-all duration-300 absolute top-10 w-32 text-center ${
                  isCurrent ? 'text-teal-700 opacity-100 translate-y-0' : 
                  isCompleted ? 'text-teal-600 opacity-0 group-hover:opacity-100 group-hover:translate-y-0' :
                  'text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-y-0'
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-6"></div> {/* Spacer for absolute labels */}
    </div>
  );
};