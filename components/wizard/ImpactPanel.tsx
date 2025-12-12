import React from 'react';
import { OnboardingState } from '../../types';
import { MVPS } from '../../constants';
import { HardDrive, Share2, Users, CreditCard } from 'lucide-react';

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
  const volumeColor = volumeTier === 'High' ? 'text-red-600' : volumeTier === 'Medium' ? 'text-amber-600' : 'text-green-600';

  // Calculate Roles
  const recommendedRoles = ['Tenant Admin'];
  if (data.selectedModules.includes('EcoTrace360')) recommendedRoles.push('Ops Manager');
  if (data.selectedModules.includes('EcoSense360')) recommendedRoles.push('Data Analyst');
  if (data.provisioningMode !== 'API') recommendedRoles.push('Technician');

  // Integrations required
  const integrations = [];
  if (data.selectedMVPs.includes('MVP-4')) integrations.push('GPS/Telematics');
  if (data.selectedMVPs.includes('MVP-5')) integrations.push('Swap Network');

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sticky top-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b pb-2">Impact Analysis</h3>
      
      <div className="space-y-6">
        {/* Data Volume */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <HardDrive size={18} className="text-slate-400" />
            <span className="font-semibold text-slate-700">Data Volume</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${volumeColor}`}>{volumeTier}</span>
            <span className="text-xs text-slate-500">Tier estimate</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Based on selected MVPs & Modules</p>
        </div>

        {/* Required Integrations */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Share2 size={18} className="text-slate-400" />
            <span className="font-semibold text-slate-700">Integrations</span>
          </div>
          {integrations.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              {integrations.map(i => <li key={i}>{i}</li>)}
            </ul>
          ) : (
            <span className="text-sm text-slate-400 italic">None specific</span>
          )}
        </div>

        {/* Recommended Roles */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Users size={18} className="text-slate-400" />
            <span className="font-semibold text-slate-700">Rec. Roles</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedRoles.map(role => (
              <span key={role} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Est. Cost (Mock) */}
        <div>
           <div className="flex items-center space-x-2 mb-2">
            <CreditCard size={18} className="text-slate-400" />
            <span className="font-semibold text-slate-700">Monthly Est.</span>
          </div>
          <div className="text-xl font-bold text-slate-800">
            ${199 + (data.selectedModules.length * 50) + (data.selectedMVPs.length * 20)}
            <span className="text-sm font-normal text-slate-500"> / mo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
