
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
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 space-y-10">
        
        {/* Profile */}
        <div>
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-200 pb-2">Organization Profile</h4>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div><span className="text-slate-500 block mb-1">Organization Name</span> <span className="font-bold text-slate-900 text-base">{data.name}</span></div>
            <div><span className="text-slate-500 block mb-1">Customer Type</span> <span className="font-bold text-slate-900 text-base">{data.customerType.replace('_', ' ')}</span></div>
            <div><span className="text-slate-500 block mb-1">Tenant Slug</span> <span className="font-mono bg-white px-2 py-1 border rounded text-teal-700 font-bold">{data.slug}</span></div>
            <div><span className="text-slate-500 block mb-1">Service Region</span> <span className="font-bold text-slate-900 text-base">{data.region}</span></div>
          </div>
        </div>

        {/* Modules */}
        <div>
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-200 pb-2">Active Modules & Features</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {data.selectedModules.map(m => (
              <span key={m} className="px-3 py-1.5 bg-teal-100 text-teal-800 text-sm rounded-lg font-bold border border-teal-200">{m}</span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {data.selectedMVPs.map(m => (
              <span key={m} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-md shadow-sm">{m}</span>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div>
           <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4 border-b border-slate-200 pb-2">Technical Configuration</h4>
            <div className="grid grid-cols-2 gap-6 text-sm">
            <div><span className="text-slate-500 block mb-1">Data Retention</span> <span className="font-bold text-slate-900">{data.dataRetentionDays} Days</span></div>
            <div><span className="text-slate-500 block mb-1">SLA Tier</span> <span className="font-bold text-slate-900">{data.slaTier}</span></div>
            <div><span className="text-slate-500 block mb-1">Identity Scheme</span> <span className="font-bold text-slate-900">{data.identityScheme.replace('_', ' + ')}</span></div>
            
            {/* New Device Trust Fields */}
            <div><span className="text-slate-500 block mb-1">Device Trust Mode</span> <span className="font-bold text-teal-700">{data.deviceTrustMode}</span></div>
            
            {data.deviceTrustMode === 'EXTERNAL' ? (
                <div>
                    <span className="text-slate-500 block mb-1">Ingest Protocols</span> 
                    <span className="font-bold text-slate-900">{data.externalIngestModes.length > 0 ? data.externalIngestModes.join(', ') : 'None'}</span>
                </div>
            ) : (
                <div>
                    <span className="text-slate-500 block mb-1">Provisioning Method</span> 
                    <span className="font-bold text-slate-900">{data.provisioningMode.replace('_', ' ')}</span>
                </div>
            )}
            
          </div>
        </div>

      </div>

      <div className="mt-10 flex justify-end">
        <Button 
          size="lg" 
          onClick={onSubmit} 
          isLoading={isSubmitting}
          className="w-full sm:w-auto px-8 shadow-xl shadow-teal-500/20"
        >
          Create Tenant Environment
        </Button>
      </div>
    </div>
  );
};
