
import React from 'react';
import { OnboardingState } from '../../types';
import { MVPS } from '../../constants';
import { HardDrive, Share2, Users, CreditCard, Activity } from 'lucide-react';

interface ImpactPanelProps {
  data: OnboardingState;
}

export const ImpactPanel: React.FC<ImpactPanelProps> = ({ data }) => {
  // Calculate Volume Tier
  let volumeScore = 0;
  data.selectedMVPs.forEach(mvpId => {
    const mvp = MVPS.find(m => m.id === mvpId);
    if (mvp?.dataVolume === 'High') volumeScore += 3;
    if (mvp?.dataVolume === 'Medium') volumeScore += 2;
    if (mvp?.dataVolume === 'Low') volumeScore += 1;
  });

  const volumeTier = volumeScore > 8 ? 'High' : volumeScore > 4 ? 'Medium' : 'Low';
  const volumeColor = volumeTier === 'High' ? 'text-rose-500' : volumeTier === 'Medium' ? 'text-amber-500' : 'text-teal-500';

  // Calculate Roles
  const recommendedRoles = ['Tenant Admin'];
  if (data.selectedModules.includes('EcoTrace360')) recommendedRoles.push('Ops Manager');
  if (data.selectedModules.includes('EcoSense360')) recommendedRoles.push('Data Analyst');
  if (data.provisioningMode !== 'API' && data.deviceTrustMode !== 'EXTERNAL') recommendedRoles.push('Technician');

  // Integrations required
  const integrations = [];
  
  // Logic update: If External trust mode, substitute GPS/Telematics with generic ingest protocols
  if (data.deviceTrustMode === 'EXTERNAL') {
     integrations.push('API/MQTT/File');
  } else {
     if (data.selectedMVPs.includes('MVP-4')) integrations.push('GPS/Telematics');
  }

  if (data.selectedMVPs.includes('MVP-5')) integrations.push('Swap Network');

  const monthlyEstimate = 199 + (data.selectedModules.length * 50) + (data.selectedMVPs.length * 20);

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden sticky top-8">
      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Resource Impact</h3>
        <Activity size={16} className="text-teal-500" />
      </div>
      
      <div className="p-6 space-y-6">
        {/* Data Volume */}
        <div className="relative group">
          <div className="flex items-center space-x-2 mb-1">
            <HardDrive size={16} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Storage Tier</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${volumeColor}`}>{volumeTier}</span>
            <span className="text-xs text-slate-400">volume profile</span>
          </div>
        </div>

        {/* Est. Cost */}
        <div className="pt-4 border-t border-slate-100">
           <div className="flex items-center space-x-2 mb-1">
            <CreditCard size={16} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Monthly Est.</span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-bold text-slate-400">$</span>
            <span className="text-3xl font-bold text-slate-800 tracking-tight">{monthlyEstimate}</span>
            <span className="text-sm font-medium text-slate-400">/mo</span>
          </div>
        </div>

        {/* Required Integrations */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2 mb-2">
            <Share2 size={16} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Req. Integrations</span>
          </div>
          {integrations.length > 0 ? (
            <ul className="space-y-2">
              {integrations.map(i => (
                <li key={i} className="flex items-center text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-2"></span>
                  {i}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm text-slate-400 italic">None specific</span>
          )}
        </div>

        {/* Recommended Roles */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2 mb-3">
            <Users size={16} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rec. Roles</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedRoles.map(role => (
              <span key={role} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md border border-slate-200/50">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-teal-50/50 p-4 border-t border-teal-100 text-center">
        <p className="text-xs text-teal-700 font-medium leading-tight">Trust mode affects feature guarantees (e.g. Swap Auth)</p>
      </div>
    </div>
  );
};
