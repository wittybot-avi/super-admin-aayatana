
import React, { useEffect } from 'react';
import { OnboardingState, DeviceTrustMode } from '../../../types';
import { Radio, ShieldCheck, Database, FileSpreadsheet, Server, Wifi, UploadCloud, AlertTriangle } from 'lucide-react';

interface Step6Props {
  data: OnboardingState;
  updateData: (updates: Partial<OnboardingState>) => void;
}

export const Step6_DeviceTrust: React.FC<Step6Props> = ({ data, updateData }) => {

  // Default selection logic
  useEffect(() => {
    // Only set default if user hasn't interacted (we assume 'EXTERNAL' is initial state but we want smart defaults)
    // However, since we don't have a 'touched' state, we'll just run this once if it matches the default 'EXTERNAL' 
    // AND customer type strongly suggests Hybrid.
    const isManuOrOEM = data.customerType === 'BATTERY_MANUFACTURER' || data.customerType === 'OEM';
    
    // We only force change if it's the very first render of this step effectively
    // To avoid overriding user choice, we could check a separate flag, but for this wizard flow:
    if (isManuOrOEM && data.deviceTrustMode === 'EXTERNAL' && data.externalIngestModes.length === 0) {
       updateData({ deviceTrustMode: 'HYBRID' });
    }
  }, []); // Run once on mount

  const handleTrustModeChange = (mode: DeviceTrustMode) => {
    updateData({ deviceTrustMode: mode });
    // Reset relevant fields when switching
    if (mode === 'EXTERNAL') {
        updateData({ externalIngestModes: ['REST_API'] }); // Default for external
    } else {
        updateData({ provisioningMode: 'MANUAL' }); // Default for Aayatana/Hybrid
    }
  };

  const toggleExternalMode = (mode: string) => {
    if (data.externalIngestModes.includes(mode)) {
        updateData({ externalIngestModes: data.externalIngestModes.filter(m => m !== mode) });
    } else {
        updateData({ externalIngestModes: [...data.externalIngestModes, mode] });
    }
  };

  const isManagedOrHybrid = data.deviceTrustMode === 'AAYATANA' || data.deviceTrustMode === 'HYBRID';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-2 bg-teal-100 rounded-lg text-teal-700"><Radio size={20} /></div>
        <div>
            <h3 className="text-lg font-bold text-slate-900">Telemetry & Device Trust</h3>
            <p className="text-sm text-slate-500">Choose how this tenant’s battery data will be onboarded and trusted.</p>
        </div>
      </div>

      {/* Trust Mode Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Device Trust Mode</label>
        <div className="grid grid-cols-3 gap-4">
            {[
                {id: 'AAYATANA', l: 'Aayatana-Managed', sub: 'VoltEdge BMS + IoT', icon: ShieldCheck},
                {id: 'HYBRID', l: 'Hybrid', sub: 'Ext BMS + VoltEdge Gateway', icon: Database},
                {id: 'EXTERNAL', l: 'External (BYOD)', sub: '3rd Party Telemetry', icon: UploadCloud}
            ].map((opt) => {
                const isSelected = data.deviceTrustMode === opt.id;
                const Icon = opt.icon;
                return (
                    <div 
                        key={opt.id}
                        onClick={() => handleTrustModeChange(opt.id as DeviceTrustMode)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                             isSelected 
                             ? 'border-teal-500 bg-teal-50/50 shadow-md shadow-teal-100' 
                             : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                    >
                         {isSelected && <div className="absolute top-3 right-3 w-3 h-3 bg-teal-500 rounded-full shadow-sm" />}
                         <div className={`mb-3 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`}>
                             <Icon size={24} />
                         </div>
                         <div className={`font-bold text-sm mb-0.5 ${isSelected ? 'text-teal-900' : 'text-slate-900'}`}>{opt.l}</div>
                         <div className="text-xs text-slate-500">{opt.sub}</div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Managed / Hybrid Options */}
      {isManagedOrHybrid && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <label className="block text-sm font-semibold text-slate-700">Primary Provisioning Method</label>
            <div className="grid grid-cols-3 gap-5">
                {[
                    {id: 'MANUAL', l: 'Manual Upload', d: 'CSV Bulk Import'}, 
                    {id: 'API', l: 'API Provisioning', d: 'Factory / MES Integration'}, 
                    {id: 'QR_SCAN', l: 'QR Scanning', d: 'Field App Activation'}
                ].map(mode => (
                    <div key={mode.id} onClick={() => updateData({provisioningMode: mode.id as any})} 
                        className={`p-5 border-2 rounded-xl cursor-pointer transition-all text-center group ${
                            data.provisioningMode === mode.id 
                            ? 'border-teal-500 bg-white shadow-md shadow-teal-100' 
                            : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
                        }`}>
                        <div className={`font-bold text-sm mb-1 ${data.provisioningMode === mode.id ? 'text-teal-900' : 'text-slate-900'}`}>{mode.l}</div>
                        <div className="text-xs text-slate-500">{mode.d}</div>
                    </div>
                ))}
            </div>

            <div className="p-5 bg-teal-50 text-teal-900 text-sm rounded-xl border border-teal-100 flex items-start">
                <FileSpreadsheet size={20} className="mr-3 mt-0.5 flex-shrink-0" />
                <div>
                    <span className="font-semibold block mb-1">Template Ready</span>
                    A standardized CSV template will be generated to pre-register device IDs and pack serials.
                </div>
            </div>
        </div>
      )}

      {/* External Options */}
      {!isManagedOrHybrid && (
         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Ingestion Channels</label>
                <div className="grid grid-cols-3 gap-5">
                    {[
                        {id: 'REST_API', l: 'REST API Ingest', d: 'HTTPS Push'}, 
                        {id: 'MQTT', l: 'MQTT Ingest', d: 'Secure Broker'}, 
                        {id: 'BATCH_FILE', l: 'Batch File', d: 'SFTP / CSV Schedule'}
                    ].map(mode => {
                        const isSelected = data.externalIngestModes.includes(mode.id);
                        return (
                        <div key={mode.id} onClick={() => toggleExternalMode(mode.id)} 
                            className={`p-5 border-2 rounded-xl cursor-pointer transition-all text-center group relative ${
                                isSelected
                                ? 'border-teal-500 bg-white shadow-md shadow-teal-100' 
                                : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
                            }`}>
                             {isSelected && <div className="absolute top-2 right-2 text-teal-500">✓</div>}
                            <div className={`font-bold text-sm mb-1 ${isSelected ? 'text-teal-900' : 'text-slate-900'}`}>{mode.l}</div>
                            <div className="text-xs text-slate-500">{mode.d}</div>
                        </div>
                    )})}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
                 <h4 className="text-sm font-bold text-slate-900 mb-3">Telemetry Contract Checklist</h4>
                 <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                     {['Battery ID (UUID)', 'Timestamp (ISO8601)', 'Pack Voltage (V)', 'Pack Current (A)', 'Cell Temperatures (C)', 'SOC % (Optional)', 'GPS Lat/Lng (Optional)'].map(field => (
                         <div key={field} className="flex items-center space-x-2 text-sm text-slate-600">
                             <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-[10px] font-bold">✓</div>
                             <span>{field}</span>
                         </div>
                     ))}
                 </div>
            </div>

            <div className="p-4 bg-amber-50 text-amber-900 text-sm rounded-xl border border-amber-100 flex items-start">
                <AlertTriangle size={18} className="mr-3 mt-0.5 flex-shrink-0" />
                <div>
                    <span className="font-bold block mb-1">Capability Warning</span>
                    Some features require device-level identity (e.g., Swap Authentication). You can upgrade trust mode later.
                </div>
            </div>
            
             <div className="text-xs text-slate-400 text-center">
                A telemetry contract JSON schema will be generated to validate incoming payloads.
             </div>
         </div>
      )}

    </div>
  );
};
