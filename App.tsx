
import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { OnboardingWizard } from './components/wizard/OnboardingWizard';
import { UsersPage } from './components/users/UsersPage';
import { DevicesPage } from './components/devices/DevicesPage';
import { ModulesPage } from './components/modules/ModulesPage';
import { Building2, Plus, Search, Bell, HelpCircle } from 'lucide-react';
import { TenantService } from './services/tenantService';
import { Tenant } from './types';
import { Button } from './components/ui/Button';

function App() {
  const [currentView, setCurrentView] = useState('onboarding');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  // Simple fetch for tenants view
  React.useEffect(() => {
    if (currentView === 'tenants') {
      setLoadingTenants(true);
      TenantService.getAll().then((data) => {
        setTenants(data);
        setLoadingTenants(false);
      });
    }
  }, [currentView]);

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="ml-72 flex-1 p-10 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 capitalize tracking-tight">{currentView}</h1>
            <p className="text-slate-500 mt-1">Manage your platform resources and configurations</p>
          </div>
          <div className="flex items-center space-x-5">
             <div className="flex space-x-2">
                <button className="p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-full transition-colors"><Search size={20} /></button>
                <button className="p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-full transition-colors"><Bell size={20} /></button>
                <button className="p-2 text-slate-400 hover:bg-white hover:text-slate-600 rounded-full transition-colors"><HelpCircle size={20} /></button>
             </div>
             <div className="h-8 w-[1px] bg-slate-200"></div>
             <div className="flex items-center space-x-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-white transition-all border border-transparent hover:border-slate-200">
                 <div className="h-9 w-9 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    SA
                 </div>
                 <span className="text-sm font-semibold text-slate-700">Super Admin</span>
             </div>
          </div>
        </header>

        {/* Content Area */}
        {currentView === 'onboarding' && <OnboardingWizard onComplete={() => setCurrentView('tenants')} />}
        
        {currentView === 'users' && <UsersPage />}
        
        {currentView === 'devices' && <DevicesPage />}

        {currentView === 'modules' && <ModulesPage />}

        {currentView === 'tenants' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setCurrentView('onboarding')}>
                <Plus size={16} className="mr-2" /> New Tenant
              </Button>
            </div>
            
            {loadingTenants ? (
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-bold mr-4">
                              {tenant.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{tenant.name}</div>
                              <div className="text-xs text-slate-500">{tenant.contactEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {tenant.modules.length} Modules Active
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">
                          {tenant.region}
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
        {!['onboarding', 'tenants', 'users', 'devices', 'modules'].includes(currentView) && (
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
