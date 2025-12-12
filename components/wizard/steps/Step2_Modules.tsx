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
      // Logic: Deselecting a module should deselect dependent MVPs
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

      // Logic: Selecting an MVP automatically selects required modules
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Modules Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Platform Modules</h3>
        <div className="grid grid-cols-2 gap-4">
          {MODULES.map(module => {
            // Dynamic Icon
            const IconComponent = (Icons as any)[module.icon] || Icons.Box;
            const isSelected = data.selectedModules.includes(module.id);
            
            return (
              <div 
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <h4 className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{module.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{module.description}</p>
                  </div>
                  {isSelected && <Icons.CheckCircle2 className="ml-auto text-indigo-600" size={20} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MVP Selection Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">MVP Features</h3>
        <div className="space-y-3">
          {MVPS.map(mvp => {
            const isSelected = data.selectedMVPs.includes(mvp.id);
            return (
              <div 
                key={mvp.id}
                onClick={() => toggleMVP(mvp.id)}
                className={`flex items-center p-3 rounded-lg border transition-all cursor-pointer ${
                   isSelected ? 'bg-white border-indigo-500 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-slate-100'
                }`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-4 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                  {isSelected && <Icons.Check size={12} className="text-white" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{mvp.name}</span>
                    <Badge variant={mvp.dataVolume === 'High' ? 'warning' : 'neutral'}>{mvp.dataVolume} Vol</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{mvp.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
