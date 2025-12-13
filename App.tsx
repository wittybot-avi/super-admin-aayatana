
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { OnboardingWizard } from './components/wizard/OnboardingWizard';
import { UsersPage } from './components/users/UsersPage';
import { DevicesPage } from './components/devices/DevicesPage';
import { ModulesPage } from './components/modules/ModulesPage';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { AuditLogsPage } from './components/audit/AuditLogsPage';
import { TenantOverview } from './components/dashboard/TenantOverview';
import { Building2, Plus, Search, Bell, HelpCircle, ChevronDown, Check } from 'lucide-react';
import { TenantService } from './services/tenantService';
import { Tenant } from './types';
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';

function App() {
  const [currentView, setCurrentView] = useState('tenants'); // Default to tenants
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Switcher State
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Initial Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const allTenants = await TenantService.getAll();
    setTenants(allTenants);

    const contextId = TenantService.getCurrentTenantId();
    if (contextId) {
        const active = allTenants.find(t => t.id === contextId);
        if (active) {
            setCurrentTenant(active);
            // If active is DRAFT, force onboarding
            if (active.status === 'DRAFT') {
                setCurrentView('onboarding');
            } else if (currentView === 'onboarding') {
                // If it's active but we are on onboarding, move away
                setCurrentView('dashboard');
            }
        } else {
            // Context ID is stale
            TenantService.setCurrentTenantId(null);
            setCurrentTenant(null);
        }
    }
    setLoading(false);
  };

  const handleSwitchTenant = (tenant: Tenant | null) => {
      TenantService.setCurrentTenantId(tenant ? tenant.id : null);
      setCurrentTenant(tenant);
      setIsSwitcherOpen(false);
      
      if (tenant) {
          if (tenant.status === 'DRAFT') {
              setCurrentView('onboarding');
          } else {
              // If currently on a restricted page, stay there, otherwise go to dashboard
              if (currentView === 'tenants') setCurrentView('dashboard');
          }
      } else {
          // No tenant selected, go to tenants list
          setCurrentView('tenants');
      }
  };

  const handleNewTenant = async () => {
      // 1. Create Stub
      const newStub = await TenantService.createStub();
      // 2. Refresh List
      const all = await TenantService.getAll();
      setTenants(all);
      // 3. Switch Context
      handleSwitchTenant(newStub);
  };

  // Close switcher on click outside
  useEffect(() => {
      const close = () => setIsSwitcherOpen(false);
      if (isSwitcherOpen) document.addEventListener('click', close);
      return () => document.removeEventListener('click', close);
  }, [isSwitcherOpen]);

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        currentTenant={currentTenant}
      />
      
      <main className="ml-72 flex-1 p-10 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 capitalize tracking-tight">{currentView === 'dashboard' ? 'Tenant Overview' : currentView.replace('_', ' ')}</h1>
            <p className="text-slate-500 mt-1">Manage your platform resources and configurations</p>
          </div>
          
          <div className="flex items-center space-x-6">
             
             {/* Tenant Switcher Pill */}
             <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                    className={`flex items-center space-x-3 pl-1 pr-4 py-1 rounded-full border transition-all shadow-sm ${
                        currentTenant 
                        ? 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-md' 
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentTenant ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-400'
                    }`}>
                        {currentTenant ? currentTenant.name.substring(0, 2).toUpperCase() : <Building2 size={14} />}
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">Tenant</div>
                        <div className="text-sm font-semibold text-slate-700 max-w-[120px] truncate leading-none">
                            {currentTenant ? currentTenant.name : 'None selected'}
                        </div>
                    </div>
                    <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Dropdown */}
                {isSwitcherOpen && (
                    <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
                        <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Switch Tenant</h4>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {tenants.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-400 italic">No tenants found</div>
                            ) : (
                                tenants.map(t => (
                                    <button 
                                        key={t.id}
                                        onClick={() => handleSwitchTenant(t)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between group border-b border-slate-50 last:border-0"
                                    >
                                        <div>
                                            <div className={`text-sm font-bold ${currentTenant?.id === t.id ? 'text-teal-700' : 'text-slate-700'}`}>
                                                {t.name}
                                            </div>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge variant={t.status === 'ACTIVE' ? 'success' : 'warning'}>{t.status}</Badge>
                                                <span className="text-xs text-slate-400">{t.region}</span>
                                            </div>
                                        </div>
                                        {currentTenant?.id === t.id && <Check size={16} className="text-teal-500" />}
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="p-3 border-t border-slate-100 bg-slate-50">
                            <button 
                                onClick={handleNewTenant}
                                className="w-full flex items-center justify-center space-x-2 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                            >
                                <Plus size={16} />
                                <span>New Tenant</span>
                            </button>
                            {currentTenant && (
                                <button 
                                    onClick={() => handleSwitchTenant(null)}
                                    className="w-full mt-2 text-center text-xs text-slate-500 hover:text-slate-700 py-1"
                                >
                                    Clear Selection
                                </button>
                            )}
                        </div>
                    </div>
                )}
             </div>

             <div className="h-8 w-[1px] bg-slate-200"></div>

             {/* Actions */}
             <div className="flex space-x-2">
                <button className="p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-full transition-colors"><Search size={20} /></button>
                <button className="p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-full transition-colors"><Bell size={20} /></button>
                <button className="p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-full transition-colors"><HelpCircle size={20} /></button>
             </div>
             
             <div className="flex items-center space-x-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-white transition-all border border-transparent hover:border-slate-200">
                 <div className="h-9 w-9 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    SA
                 </div>
                 <span className="text-sm font-semibold text-slate-700">Super Admin</span>
             </div>
          </div>
        </header>

        {/* Content Area */}
        {currentView === 'dashboard' && <TenantOverview tenant={currentTenant} onChangeView={setCurrentView} />}

        {currentView === 'onboarding' && (
            <OnboardingWizard onComplete={() => {
                loadData(); // Reload to reflect active status
                setCurrentView('tenants');
            }} />
        )}
        
        {currentView === 'users' && <UsersPage />}
        
        {currentView === 'devices' && <DevicesPage />}

        {currentView === 'modules' && <ModulesPage />}

        {currentView === 'analytics' && <AnalyticsPage />}

        {currentView === 'settings' && <SettingsPage />}

        {currentView === 'audit_logs' && <AuditLogsPage />}

        {currentView === 'tenants' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-indigo-900">Global Tenant Directory</h3>
                        <p className="text-sm text-indigo-700">Select a tenant to manage their specific resources.</p>
                    </div>
                </div>
                <Button onClick={handleNewTenant}>
                    <Plus size={16} className="mr-2" /> New Tenant
                </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-20 text-slate-500">
                  <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  Loading tenants data...
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenant Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modules</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Region</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {tenants.map((tenant) => (
                      <tr 
                        key={tenant.id} 
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${currentTenant?.id === tenant.id ? 'bg-teal-50/30' : ''}`}
                        onClick={() => handleSwitchTenant(tenant)}
                      >
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-bold mr-4">
                              {tenant.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 flex items-center">
                                {tenant.name}
                                {currentTenant?.id === tenant.id && <span className="ml-2 px-1.5 py-0.5 bg-teal-100 text-teal-700 text-[10px] rounded uppercase tracking-wide">Current</span>}
                              </div>
                              <div className="text-xs text-slate-500">{tenant.contactEmail || 'No email set'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <Badge variant={tenant.status === 'ACTIVE' ? 'success' : 'warning'}>{tenant.status}</Badge>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {tenant.modules.length} Modules Active
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">
                          {tenant.region}
                        </td>
                         <td className="px-6 py-5 whitespace-nowrap text-right">
                           <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleSwitchTenant(tenant); }}>
                                {tenant.status === 'DRAFT' ? 'Resume Setup' : 'Manage'}
                           </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Placeholder for other views */}
        {!['dashboard', 'onboarding', 'tenants', 'users', 'devices', 'modules', 'analytics', 'settings', 'audit_logs'].includes(currentView) && (
          <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-slate-200">
            <Building2 size={64} className="mx-auto text-slate-200 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Work in Progress</h3>
            <p className="text-slate-500 max-w-sm mx-auto">The <span className="font-semibold text-slate-700">{currentView}</span> module is currently under development for the next release.</p>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
