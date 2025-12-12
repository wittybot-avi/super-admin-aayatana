import React from 'react';
import { Check } from 'lucide-react';

interface WizardStepperProps {
  currentStep: number;
  totalSteps: number;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep, totalSteps }) => {
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
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-slate-200 -z-10" />
        
        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={label} className="flex flex-col items-center bg-white px-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 
                  isCurrent ? 'bg-white border-indigo-600 text-indigo-600' : 
                  'bg-white border-slate-300 text-slate-300'
                }`}
              >
                {isCompleted ? <Check size={16} /> : <span className="text-xs font-bold">{stepNum}</span>}
              </div>
              <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
