import React from 'react';
import { OnboardingState, ModuleId, MVPId } from '../../../types';
import { MODULES, MVPS } from '../../../constants';
import * as Icons from 'lucide-react';
import { Badge } from '../../ui/Badge';

interface Step2Props {
  data: OnboardingState;
  updateData: (updates: Partial<OnboardingState>) => void;
}

export const Step2_Modules: React.FC<Step2Props> = ({ data, updateData }) => {

  const toggleModule = (id: ModuleId) => {
    if (data.selectedModules.includes(id)) {
      const newModules = data.selectedModules.filter(m => m !== id);
      const newMVPs = data.selectedMVPs.filter(mvpId => {
        const mvp = MVPS.find(m => m.id === mvpId);
        return !mvp?.requiredModules.includes(id);
      });
      updateData({ selectedModules: newModules, selectedMVPs: newMVPs });
    } else {
      updateData({ selectedModules: [...data.selectedModules, id] });
    }
  };

  const toggleMVP = (id: MVPId) => {
    if (data.selectedMVPs.includes(id)) {
      updateData({ selectedMVPs: data.selectedMVPs.filter(m => m !== id) });
    } else {
      const mvp = MVPS.find(m => m.id === id);
      if (!mvp) return;
      const missingModules = mvp.requiredModules.filter(
        req => !data.selectedModules.includes(req)
      );
      updateData({ 
        selectedMVPs: [...data.selectedMVPs, id],
        selectedModules: [...data.selectedModules, ...missingModules]
      });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Modules Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">Platform Modules</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Select active components</span>
        </div>
        <div className="grid grid-cols-2 gap-5">
          {MODULES.map(module => {
            const IconComponent = (Icons as any)[module.icon] || Icons.Box;
            const isSelected = data.selectedModules.includes(module.id);
            
            return (
              <div 
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                  isSelected 
                    ? 'border-teal-500 bg-teal-50/50 shadow-md shadow-teal-100' 
                    : 'border-slate-100 bg-white hover:border-teal-200 hover:shadow-lg hover:shadow-slate-100'
                }`}
              >
                <div className="flex items-start space-x-4 relative z-10">
                  <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
                    <IconComponent size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-base ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>{module.name}</h4>
                    <p className={`text-sm mt-1 leading-relaxed ${isSelected ? 'text-teal-700' : 'text-slate-500'}`}>{module.description}</p>
                  </div>
                  {isSelected && <Icons.CheckCircle2 className="text-teal-500 animate-in zoom-in duration-300" size={24} strokeWidth={2.5} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MVP Selection Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-900">MVP Feature Pack</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Define MVP scope</span>
        </div>
        <div className="space-y-3">
          {MVPS.map(mvp => {
            const isSelected = data.selectedMVPs.includes(mvp.id);
            return (
              <div 
                key={mvp.id}
                onClick={() => toggleMVP(mvp.id)}
                className={`flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                   isSelected 
                   ? 'bg-white border-teal-500 shadow-md shadow-teal-500/10' 
                   : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-5 transition-colors ${isSelected ? 'bg-teal-500 border-teal-500 shadow-sm' : 'border-slate-300 bg-white'}`}>
                  {isSelected && <Icons.Check size={14} className="text-white" strokeWidth={4} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-sm ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>{mvp.name}</span>
                    <Badge variant={mvp.dataVolume === 'High' ? 'warning' : 'neutral'}>{mvp.dataVolume} Vol</Badge>
                  </div>
                  <p className="text-sm text-slate-500">{mvp.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};