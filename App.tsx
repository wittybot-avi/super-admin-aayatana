import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { OnboardingWizard } from './components/wizard/OnboardingWizard';
import { Building2, Plus } from 'lucide-react';
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
    <div className="flex bg-slate-100 min-h-screen font-sans text-slate-900">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="ml-64 flex-1 p-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{currentView}</h1>
            <p className="text-slate-500">Manage your platform resources</p>
          </div>
          <div className="flex space-x-3">
             <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300">
                SA
             </div>
          </div>
        </header>

        {/* Content Area */}
        {currentView === 'onboarding' && <OnboardingWizard onComplete={() => setCurrentView('tenants')} />}
        
        {currentView === 'tenants' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setCurrentView('onboarding')}>
                <Plus size={16} className="mr-2" /> New Tenant
              </Button>
            </div>
            
            {loadingTenants ? (
              <div className="text-center py-12 text-slate-500">Loading tenants...</div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tenant Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Modules</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Region</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {tenants.map((tenant) => (
                      <tr key={tenant.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                              {tenant.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{tenant.name}</div>
                              <div className="text-xs text-slate-500">{tenant.contactEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {tenant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {tenant.modules.length} Active
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
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
        {!['onboarding', 'tenants'].includes(currentView) && (
          <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-slate-300">
            <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Work in Progress</h3>
            <p className="text-slate-500">This module is coming soon in the next sprint.</p>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
