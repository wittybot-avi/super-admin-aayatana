import React from 'react';
import { OnboardingState } from '../../types';
import { Button } from '../ui/Button';

interface ReviewStepProps {
  data: OnboardingState;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data, onSubmit, isSubmitting }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-8">
        
        {/* Profile */}
        <div>
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Organization</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500 block">Name:</span> <span className="font-medium">{data.name}</span></div>
            <div><span className="text-slate-500 block">Type:</span> <span className="font-medium">{data.customerType.replace('_', ' ')}</span></div>
            <div><span className="text-slate-500 block">Slug:</span> <span className="font-mono bg-white px-1 border rounded">{data.slug}</span></div>
            <div><span className="text-slate-500 block">Region:</span> <span className="font-medium">{data.region}</span></div>
          </div>
        </div>

        {/* Modules */}
        <div>
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Modules & Features</h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.selectedModules.map(m => (
              <span key={m} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-md font-medium">{m}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {data.selectedMVPs.map(m => (
              <span key={m} className="px-2 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-md">{m}</span>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div>
           <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Technical Config</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500 block">Data Retention:</span> <span className="font-medium">{data.dataRetentionDays} Days</span></div>
            <div><span className="text-slate-500 block">SLA Tier:</span> <span className="font-medium">{data.slaTier}</span></div>
            <div><span className="text-slate-500 block">Identity:</span> <span className="font-medium">{data.identityScheme}</span></div>
            <div><span className="text-slate-500 block">Provisioning:</span> <span className="font-medium">{data.provisioningMode}</span></div>
          </div>
        </div>

      </div>

      <div className="mt-8 flex justify-end">
        <Button 
          size="lg" 
          onClick={onSubmit} 
          isLoading={isSubmitting}
          className="w-full sm:w-auto"
        >
          Create Tenant Environment
        </Button>
      </div>
    </div>
  );
};
