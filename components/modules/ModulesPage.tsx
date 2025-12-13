
import React, { useState, useEffect } from 'react';
import { ModuleEntitlement, ModuleId, ModuleTier } from '../../types';
import { MODULES } from '../../constants';
import { ModuleService } from '../../services/moduleService';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { Badge } from '../ui/Badge';
import { AlertTriangle, Info, CheckCircle2, RotateCcw, Save } from 'lucide-react';
import * as Icons from 'lucide-react';

export const ModulesPage: React.FC = () => {
  const [entitlements, setEntitlements] = useState<ModuleEntitlement[]>([]);
  const [originalEntitlements, setOriginalEntitlements] = useState<ModuleEntitlement[]>([]); // For dirty check
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const tid = ModuleService.getCurrentTenantId();
    setTenantId(tid);
    loadData(tid);
  }, []);

  useEffect(() => {
    // Check deep equality for dirty state
    const currentStr = JSON.stringify(entitlements.map(e => ({...e, updatedAt: ''})));
    const originalStr = JSON.stringify(originalEntitlements.map(e => ({...e, updatedAt: ''})));
    setIsDirty(currentStr !== originalStr);
  }, [entitlements, originalEntitlements]);

  const loadData = async (tid: string) => {
    setLoading(true);
    const data = await ModuleService.getEntitlements(tid);
    setEntitlements(data);
    setOriginalEntitlements(JSON.parse(JSON.stringify(data))); // Deep copy
    setLoading(false);
  };

  const handleToggle = (moduleId: ModuleId) => {
    setEntitlements(prev => prev.map(e => 
        e.moduleId === moduleId ? { ...e, enabled: !e.enabled } : e
    ));
  };

  const handleTierChange = (moduleId: ModuleId, tier: string) => {
    setEntitlements(prev => prev.map(e => 
        e.moduleId === moduleId ? { ...e, tier: tier as ModuleTier } : e
    ));
  };

  const handleReset = () => {
    if (confirm('Discard all unsaved changes?')) {
        setEntitlements(JSON.parse(JSON.stringify(originalEntitlements)));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await ModuleService.saveEntitlements(tenantId, entitlements);
    await loadData(tenantId); // Refresh to sync timestamps and clear dirty state
    setSaving(false);
    alert('Modules configuration updated successfully.');
  };

  // Dependency Checks
  const isEnabled = (id: ModuleId) => entitlements.find(e => e.moduleId === id)?.enabled;
  
  const warnings = [];
  if (isEnabled('EcoSense360') && !isEnabled('EcoTrace360')) {
      warnings.push({ type: 'warning', text: 'EcoSense360 typically requires EcoTrace360 ingestion and operational telemetry.' });
  }
  if (isEnabled('VoltVault360') && !isEnabled('EcoTrace360')) {
      warnings.push({ type: 'warning', text: 'VoltVault360 benefits from EcoTrace360 operational lineage for full chain-of-custody.' });
  }
  if (isEnabled('EcoMetricsESG')) {
      warnings.push({ type: 'info', text: 'EcoMetricsESG is a roadmap module – enable for early pilots only.' });
  }

  if (loading) {
    return (
        <div className="text-center py-20 text-slate-500">
           <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
           Loading entitlements...
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Tenant Modules</h2>
          <p className="text-sm text-slate-500">Control tenant entitlements, feature tiers, and platform packaging.</p>
        </div>
        <div className="flex items-center space-x-3">
          {isDirty && <Badge variant="warning">Unsaved Changes</Badge>}
          <Button variant="ghost" onClick={handleReset} disabled={!isDirty || saving}>
             <RotateCcw size={16} className="mr-2" /> Reset
          </Button>
          <Button onClick={handleSave} isLoading={saving} disabled={!isDirty}>
             <Save size={16} className="mr-2" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Helper Context */}
      <div className="bg-slate-100 rounded-lg px-4 py-2 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Managing entitlements for tenant ID: <span className="font-mono font-semibold text-slate-700">{tenantId}</span></span>
        <span>Onboarding sets initial defaults; update entitlements here for upgrades/downgrades.</span>
      </div>

      {/* Dependency Alerts */}
      <div className="space-y-2">
        {warnings.map((w, idx) => (
            <div key={idx} className={`p-3 rounded-lg border flex items-center text-sm ${
                w.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}>
                {w.type === 'warning' ? <AlertTriangle size={16} className="mr-2 flex-shrink-0" /> : <Info size={16} className="mr-2 flex-shrink-0" />}
                {w.text}
            </div>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MODULES.map(module => {
            const ent = entitlements.find(e => e.moduleId === module.id);
            if (!ent) return null;
            
            const IconComponent = (Icons as any)[module.icon] || Icons.Box;
            const isEnabled = ent.enabled;

            return (
                <div key={module.id} className={`bg-white rounded-xl border-2 transition-all duration-200 flex flex-col ${
                    isEnabled ? 'border-teal-100 shadow-lg shadow-teal-500/5' : 'border-slate-100 opacity-80'
                }`}>
                    {/* Card Header */}
                    <div className="p-5 flex items-start justify-between border-b border-slate-50">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${isEnabled ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-400'}`}>
                                <IconComponent size={24} />
                            </div>
                            <div>
                                <h4 className={`font-bold text-base ${isEnabled ? 'text-slate-900' : 'text-slate-500'}`}>{module.name}</h4>
                                <div className="mt-0.5">
                                    <Badge variant={isEnabled ? 'success' : 'neutral'}>
                                        {isEnabled ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Switch checked={isEnabled} onChange={() => handleToggle(module.id)} />
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1">
                        <p className="text-sm text-slate-500 leading-relaxed">{module.description}</p>
                    </div>

                    {/* Card Footer */}
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
                         <div className="relative">
                            <select 
                                value={ent.tier}
                                onChange={(e) => handleTierChange(module.id, e.target.value)}
                                disabled={!isEnabled}
                                className={`text-xs font-bold uppercase tracking-wide bg-transparent border-none focus:ring-0 cursor-pointer ${
                                    isEnabled ? 'text-slate-700' : 'text-slate-400'
                                }`}
                            >
                                <option value="Basic">Basic Tier</option>
                                <option value="Pro">Pro Tier</option>
                                <option value="Enterprise">Enterprise</option>
                            </select>
                         </div>
                         <div className="text-[10px] text-slate-400">
                            Updated: {new Date(ent.updatedAt).toLocaleDateString()}
                         </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
