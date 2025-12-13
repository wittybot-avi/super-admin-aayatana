
import React, { useState } from 'react';
import { INITIAL_ONBOARDING_STATE, OnboardingState } from '../../types';
import { WizardStepper } from './WizardStepper';
import { ImpactPanel } from './ImpactPanel';
import { Step1_Profile } from './steps/Step1_Profile';
import { Step2_Modules } from './steps/Step2_Modules';
import { Step6_DeviceTrust } from './steps/Step6_DeviceTrust';
import { ReviewStep } from './ReviewStep';
import { Button } from '../ui/Button';
import { ArrowLeft, ArrowRight, Save, Settings, ShieldCheck, Users } from 'lucide-react';
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

  const handleStepClick = (step: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateData({ step });
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

  const renderStepContent = () => {
    switch (data.step) {
      case 1: return <Step1_Profile data={data} updateData={updateData} />;
      case 2: return <Step2_Modules data={data} updateData={updateData} />;
      case 3: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-teal-100 rounded-lg text-teal-700"><Settings size={20} /></div>
            <h3 className="text-lg font-bold text-slate-900">Tenant Settings</h3>
          </div>
          <div className="grid grid-cols-2 gap-8">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Data Retention Policy</label>
                <div className="relative">
                  <select className="w-full border border-slate-200 rounded-lg p-3 text-slate-900 bg-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none appearance-none" value={data.dataRetentionDays} onChange={(e) => updateData({dataRetentionDays: Number(e.target.value)})}>
                      <option value={30}>30 Days (Standard)</option>
                      <option value={90}>90 Days (Extended)</option>
                      <option value={180}>180 Days (Compliance)</option>
                      <option value={365}>1 Year (Archive)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                     <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Service Region</label>
                 <div className="relative">
                  <select className="w-full border border-slate-200 rounded-lg p-3 text-slate-900 bg-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none appearance-none" value={data.region} onChange={(e) => updateData({region: e.target.value as any})}>
                      <option value="INDIA">India (Mumbai) - ap-south-1</option>
                      <option value="EU">EU (Frankfurt) - eu-central-1</option>
                      <option value="US">US (N. Virginia) - us-east-1</option>
                  </select>
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                     <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
             </div>
             <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-3">SLA Tier</label>
                <div className="grid grid-cols-3 gap-4">
                    {['Basic', 'Pro', 'Enterprise'].map(tier => (
                        <div key={tier} onClick={() => updateData({slaTier: tier as any})} 
                            className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                data.slaTier === tier 
                                ? 'border-teal-500 bg-teal-50/50 shadow-md shadow-teal-100' 
                                : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                            }`}>
                            <div className={`font-bold text-lg mb-1 ${data.slaTier === tier ? 'text-teal-900' : 'text-slate-900'}`}>{tier}</div>
                            <div className="text-xs text-slate-500">
                                {tier === 'Basic' ? '99.5% Uptime, Email Support' : 
                                 tier === 'Pro' ? '99.9% Uptime, 24/7 Support' : 
                                 '99.99% Uptime, Dedicated Account Mgr'}
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>
      );
      case 4: return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-teal-100 rounded-lg text-teal-700"><ShieldCheck size={20} /></div>
                <h3 className="text-lg font-bold text-slate-900">Identity & Compliance</h3>
             </div>
             <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Battery Identity Scheme</label>
                    <div className="grid grid-cols-3 gap-4">
                        {[{id: 'QR', l: 'QR Code Only', d: 'Basic identification'}, {id: 'QR_NFC', l: 'QR + NFC Tag', d: 'Tap-to-scan support'}, {id: 'QR_SE', l: 'Secure Element', d: 'Crypto-signed hardware ID'}].map(opt => (
                            <div key={opt.id} onClick={() => updateData({identityScheme: opt.id as any})} 
                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                    data.identityScheme === opt.id 
                                    ? 'border-teal-500 bg-teal-50/50 relative overflow-hidden' 
                                    : 'bg-white border-slate-100 hover:border-slate-300'
                                }`}>
                                {data.identityScheme === opt.id && <div className="absolute top-0 right-0 w-8 h-8 bg-teal-500 -mr-4 -mt-4 transform rotate-45" />}
                                <div className={`font-bold text-sm mb-1 ${data.identityScheme === opt.id ? 'text-teal-900' : 'text-slate-900'}`}>{opt.l}</div>
                                <div className="text-xs text-slate-500">{opt.d}</div>
                            </div>
                        ))}
                    </div>
                 </div>
                 
                 <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex items-start space-x-3">
                    <input 
                        type="checkbox" 
                        id="compliance"
                        checked={data.complianceReady} 
                        onChange={(e) => updateData({complianceReady: e.target.checked})} 
                        className="h-5 w-5 text-teal-600 rounded border-slate-300 focus:ring-teal-500 mt-0.5" 
                    />
                    <div>
                        <label htmlFor="compliance" className="text-sm font-bold text-slate-900 block cursor-pointer">Enable Battery Aadhaar / DPP Readiness</label>
                        <p className="text-xs text-slate-500 mt-1">Configures schema for Digital Product Passport compliance (EU/India upcoming regs).</p>
                    </div>
                 </div>
             </div>
          </div>
      );
      case 5: return (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-teal-100 rounded-lg text-teal-700"><Users size={20} /></div>
                <h3 className="text-lg font-bold text-slate-900">User Invitation</h3>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex items-start">
                <div className="mr-3 mt-0.5">ℹ️</div>
                We will send temporary credentials to these email addresses.
            </div>
            <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <Input label="Tenant Admin Email" placeholder="admin@customer.com" />
                    <p className="text-xs text-slate-400 mt-2">Has full access to all modules and settings.</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <Input label="Ops Manager Email (Optional)" placeholder="ops@customer.com" />
                    <p className="text-xs text-slate-400 mt-2">Has access to dashboards and device management.</p>
                </div>
            </div>
          </div>
      );
      case 6: return <Step6_DeviceTrust data={data} updateData={updateData} />;
      case 7: return <ReviewStep data={data} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      default: return null;
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-16 text-center animate-in zoom-in duration-300 max-w-2xl mx-auto mt-12">
        <div className="h-24 w-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Save size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Tenant Provisioned!</h2>
        <p className="text-slate-600 mb-10 max-w-md mx-auto leading-relaxed">
          The environment for <span className="font-bold text-slate-900">{data.name}</span> has been successfully created. 
          Invitation emails have been sent to the administrators.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={onComplete} size="lg" className="px-8">Return to Tenants</Button>
          <Button variant="outline" size="lg">Download PDF</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 items-start max-w-7xl mx-auto">
      
      {/* Main Wizard Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-10 min-h-[600px] flex flex-col">
        
        <WizardStepper currentStep={data.step} totalSteps={7} onStepClick={handleStepClick} />

        <div className="flex-1 py-4">
            {renderStepContent()}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 mt-10 pt-8 flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={data.step === 1}
            className="w-32"
          >
            <ArrowLeft size={16} className="mr-2" /> Back
          </Button>

          {data.step < 7 && (
            <div className="flex space-x-4">
              <Button variant="ghost" className="text-slate-400 hover:text-slate-600" onClick={() => alert('Draft saved!')}>
                Save Draft
              </Button>
              <Button onClick={handleNext} disabled={!data.name} className="w-40 shadow-xl shadow-teal-500/20">
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
