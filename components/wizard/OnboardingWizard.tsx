import React, { useState } from 'react';
import { INITIAL_ONBOARDING_STATE, OnboardingState } from '../../types';
import { WizardStepper } from './WizardStepper';
import { ImpactPanel } from './ImpactPanel';
import { Step1_Profile } from './steps/Step1_Profile';
import { Step2_Modules } from './steps/Step2_Modules';
import { ReviewStep } from './ReviewStep';
import { Button } from '../ui/Button';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { TenantService } from '../../services/tenantService';
import { Input } from '../ui/Input';

interface WizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<WizardProps> = ({ onComplete }) => {
  const [data, setData] = useState<OnboardingState>(INITIAL_ONBOARDING_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateData = (updates: Partial<OnboardingState>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateData({ step: data.step + 1 });
  };

  const handleBack = () => {
    updateData({ step: data.step - 1 });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await TenantService.create(data);
      setSuccess(true);
    } catch (e) {
      console.error(e);
      alert('Failed to create tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simplified Step Rendering for brevity in this response
  // In a real app, I would break out Step 3-6 into separate files like Step 1 & 2
  const renderStepContent = () => {
    switch (data.step) {
      case 1: return <Step1_Profile data={data} updateData={updateData} />;
      case 2: return <Step2_Modules data={data} updateData={updateData} />;
      case 3: return (
        <div className="space-y-6 animate-in fade-in">
          <h3 className="text-lg font-semibold">Tenant Settings</h3>
          <div className="grid grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-medium mb-2">Data Retention Policy</label>
                <select className="w-full border rounded p-2" value={data.dataRetentionDays} onChange={(e) => updateData({dataRetentionDays: Number(e.target.value)})}>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                    <option value={180}>180 Days</option>
                    <option value={365}>1 Year</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium mb-2">Service Region</label>
                <select className="w-full border rounded p-2" value={data.region} onChange={(e) => updateData({region: e.target.value as any})}>
                    <option value="INDIA">India (Mumbai)</option>
                    <option value="EU">EU (Frankfurt)</option>
                    <option value="US">US (N. Virginia)</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium mb-2">SLA Tier</label>
                <div className="flex gap-4">
                    {['Basic', 'Pro', 'Enterprise'].map(tier => (
                        <div key={tier} onClick={() => updateData({slaTier: tier as any})} className={`p-4 border rounded cursor-pointer ${data.slaTier === tier ? 'border-indigo-600 bg-indigo-50' : ''}`}>
                            <div className="font-bold">{tier}</div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>
      );
      case 4: return (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-semibold">Identity & Compliance (VoltVault)</h3>
             <div className="space-y-4">
                 <label className="block text-sm font-medium">Battery Identity Scheme</label>
                 <div className="grid grid-cols-3 gap-4">
                    {[{id: 'QR', l: 'QR Code Only'}, {id: 'QR_NFC', l: 'QR + NFC Tag'}, {id: 'QR_SE', l: 'Secure Element'}].map(opt => (
                        <div key={opt.id} onClick={() => updateData({identityScheme: opt.id as any})} className={`p-4 border rounded cursor-pointer ${data.identityScheme === opt.id ? 'border-indigo-600 bg-indigo-50' : ''}`}>
                            <div className="font-medium text-sm">{opt.l}</div>
                        </div>
                    ))}
                 </div>
                 <div className="flex items-center space-x-2 mt-4">
                    <input type="checkbox" checked={data.complianceReady} onChange={(e) => updateData({complianceReady: e.target.checked})} className="h-4 w-4 text-indigo-600 rounded" />
                    <span className="text-sm">Enable Battery Aadhaar / DPP Readiness (Future-ready)</span>
                 </div>
             </div>
          </div>
      );
      case 5: return (
           <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-semibold">User Invitation</h3>
            <p className="text-sm text-slate-500">We will send invitation emails to these initial users.</p>
            <div className="bg-slate-50 p-4 rounded border">
                <Input label="Tenant Admin Email" placeholder="admin@customer.com" />
            </div>
            <div className="bg-slate-50 p-4 rounded border">
                <Input label="Ops Manager Email (Optional)" placeholder="ops@customer.com" />
            </div>
          </div>
      );
      case 6: return (
        <div className="space-y-6 animate-in fade-in">
            <h3 className="text-lg font-semibold">Device Provisioning (VoltEdge)</h3>
            <div className="grid grid-cols-3 gap-4">
                {['MANUAL', 'API', 'QR_SCAN'].map(mode => (
                    <div key={mode} onClick={() => updateData({provisioningMode: mode as any})} className={`p-4 border rounded cursor-pointer ${data.provisioningMode === mode ? 'border-indigo-600 bg-indigo-50' : ''}`}>
                        <div className="font-bold text-center">{mode.replace('_', ' ')}</div>
                    </div>
                ))}
            </div>
            {data.provisioningMode === 'MANUAL' && (
                <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded border border-blue-200">
                    A CSV template will be generated for the customer to bulk upload device IDs.
                </div>
            )}
        </div>
      );
      case 7: return <ReviewStep data={data} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      default: return null;
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center animate-in zoom-in duration-300">
        <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Save size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Tenant Successfully Created!</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          The environment for <span className="font-bold">{data.name}</span> has been provisioned. 
          Invitation emails have been sent to the administrators.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={onComplete}>Return to Tenants List</Button>
          <Button variant="outline">Download Onboarding PDF</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 items-start">
      
      {/* Main Wizard Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        
        <WizardStepper currentStep={data.step} totalSteps={7} />

        <div className="min-h-[400px]">
            {renderStepContent()}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 mt-8 pt-6 flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={data.step === 1}
          >
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>

          {data.step < 7 && (
            <div className="flex space-x-4">
              <Button variant="ghost" className="text-slate-400" onClick={() => alert('Draft saved!')}>
                Save Draft
              </Button>
              <Button onClick={handleNext} disabled={!data.name}>
                Next Step <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Side Panel (Impact & Summary) */}
      <div className="w-80 flex-shrink-0">
        <ImpactPanel data={data} />
      </div>

    </div>
  );
};
