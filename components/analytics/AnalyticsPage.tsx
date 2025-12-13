
import React, { useState, useEffect } from 'react';
import { Dashboard, DashboardTemplate } from '../../types';
import { AnalyticsService } from '../../services/analyticsService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Plus, BarChart3, MoreVertical, Trash2, Edit2, ExternalLink, LayoutDashboard, LineChart, PieChart, Activity } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', template: 'Fleet Health Overview' as DashboardTemplate });
  const [isCreating, setIsCreating] = useState(false);

  // Rename Modal State
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{id: string, name: string} | null>(null);

  // Preview Modal State
  const [previewDashboard, setPreviewDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    const tid = AnalyticsService.getCurrentTenantId();
    setTenantId(tid);
    loadDashboards(tid);

    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadDashboards = async (tid: string) => {
    setLoading(true);
    const data = await AnalyticsService.getDashboards(tid);
    setDashboards(data);
    setLoading(false);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name) return;

    setIsCreating(true);
    try {
      await AnalyticsService.createDashboard({
        tenantId,
        name: createForm.name,
        template: createForm.template
      });
      await loadDashboards(tenantId);
      setIsCreateOpen(false);
      setCreateForm({ name: '', template: 'Fleet Health Overview' });
      alert('Dashboard created successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameTarget.name) return;

    try {
      await AnalyticsService.updateDashboard(renameTarget.id, { name: renameTarget.name });
      await loadDashboards(tenantId);
      setIsRenameOpen(false);
      setRenameTarget(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dashboard? This action cannot be undone.')) return;
    await AnalyticsService.deleteDashboard(id);
    await loadDashboards(tenantId);
  };

  const handleMenuAction = (e: React.MouseEvent, action: 'open' | 'rename' | 'delete', dashboard: Dashboard) => {
    e.stopPropagation();
    setActiveMenuId(null);

    if (action === 'open') {
        setPreviewDashboard(dashboard);
    } else if (action === 'rename') {
        setRenameTarget({ id: dashboard.id, name: dashboard.name });
        setIsRenameOpen(true);
    } else if (action === 'delete') {
        handleDelete(dashboard.id);
    }
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const templates: DashboardTemplate[] = ['Fleet Health Overview', 'Battery Safety Alerts', 'Warranty & Failure Trends'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Analytics</h2>
          <p className="text-sm text-slate-500">Saved views and operational intelligence dashboards for this tenant.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} className="mr-2" /> Create Dashboard
        </Button>
      </div>

      {/* Context Banner */}
      <div className="bg-slate-100 rounded-lg px-4 py-2 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>Analytics scoped for tenant ID: <span className="font-mono font-semibold text-slate-700">{tenantId}</span></span>
        <span>Dashboards here reflect EcoTrace360 + EcoSense360 outputs based on enabled modules.</span>
      </div>

      {/* Dashboard Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">
           <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
           Loading dashboards...
        </div>
      ) : dashboards.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutDashboard className="text-slate-400" size={32} />
          </div>
          <h3 className="text-slate-900 font-bold mb-2">No dashboards yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create your first dashboard to visualize fleet health, alerts, or warranty trends.</p>
          <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Create Dashboard</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {dashboards.map((dash) => (
            <div key={dash.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col h-full">
               <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                     <Badge variant="info">{dash.template}</Badge>
                     <button 
                        onClick={(e) => toggleMenu(e, dash.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                     >
                        <MoreVertical size={16} />
                     </button>
                     
                     {/* Menu */}
                     {activeMenuId === dash.id && (
                        <div className="absolute right-4 top-10 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-1 text-left animate-in fade-in zoom-in-95 duration-150">
                            <button onClick={(e) => handleMenuAction(e, 'open', dash)} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                                <ExternalLink size={14} className="mr-2" /> Open
                            </button>
                            <button onClick={(e) => handleMenuAction(e, 'rename', dash)} className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center">
                                <Edit2 size={14} className="mr-2" /> Rename
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button onClick={(e) => handleMenuAction(e, 'delete', dash)} className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center">
                                <Trash2 size={14} className="mr-2" /> Delete
                            </button>
                        </div>
                     )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{dash.name}</h3>
                  <div className="text-xs text-slate-400 mb-6">
                    Created: {new Date(dash.createdAt).toLocaleDateString()}
                  </div>

                  {/* Quick Stats Placeholder */}
                  <div className="flex items-center space-x-4">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-400">
                                <BarChart3 size={10} />
                            </div>
                        ))}
                     </div>
                     <span className="text-xs font-medium text-slate-500">3 KPIs • 2 Trends</span>
                  </div>
               </div>
               
               <div className="p-4 border-t border-slate-50 bg-slate-50/50 rounded-b-xl flex justify-between items-center">
                   <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ReadOnly</span>
                   <button 
                     onClick={() => setPreviewDashboard(dash)}
                     className="text-sm font-bold text-teal-600 hover:text-teal-700 hover:underline flex items-center"
                   >
                     View Dashboard <ExternalLink size={14} className="ml-1" />
                   </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        title="Create Dashboard"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-5">
          <Input 
            label="Dashboard Name" 
            placeholder="e.g. Q4 Performance" 
            value={createForm.name}
            onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
            required
            autoFocus
          />
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Template</label>
            <div className="relative">
                <select 
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 appearance-none shadow-sm transition-all"
                    value={createForm.template}
                    onChange={(e) => setCreateForm({...createForm, template: e.target.value as DashboardTemplate})}
                >
                    {templates.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Create Dashboard</Button>
          </div>
        </form>
      </Modal>

      {/* Rename Modal */}
      <Modal 
        isOpen={isRenameOpen} 
        onClose={() => setIsRenameOpen(false)} 
        title="Rename Dashboard"
        size="sm"
      >
        <form onSubmit={handleRenameSubmit} className="space-y-5">
          <Input 
            label="New Name" 
            value={renameTarget?.name || ''}
            onChange={(e) => setRenameTarget(prev => prev ? {...prev, name: e.target.value} : null)}
            required
            autoFocus
          />
          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
            <Button type="submit">Update</Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal (Mock Dashboard) */}
      <Modal
         isOpen={!!previewDashboard}
         onClose={() => setPreviewDashboard(null)}
         title={previewDashboard?.name || 'Dashboard Preview'}
         size="xl"
      >
         <div className="space-y-6">
             <div className="flex items-center justify-between">
                 <Badge variant="info">{previewDashboard?.template}</Badge>
                 <span className="text-xs text-slate-400">Mock Preview Mode</span>
             </div>

             {/* KPI Row */}
             <div className="grid grid-cols-3 gap-4">
                {previewDashboard?.widgets.slice(0, 3).map((w, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{w}</div>
                        <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold text-slate-900">
                                {idx === 0 ? '1,240' : idx === 1 ? '98.5%' : '12'}
                            </span>
                            <span className={`text-xs font-bold ${idx === 2 ? 'text-red-500' : 'text-green-500'}`}>
                                {idx === 2 ? '+2' : '+1.4%'}
                            </span>
                        </div>
                    </div>
                ))}
             </div>

             {/* Trends Row */}
             <div className="grid grid-cols-2 gap-4">
                {previewDashboard?.widgets.slice(3).map((w, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 h-48 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-slate-900 text-sm">{w}</span>
                            {idx === 0 ? <LineChart size={16} className="text-slate-400" /> : <PieChart size={16} className="text-slate-400" />}
                        </div>
                        {/* Fake Chart Skeleton */}
                        <div className="flex-1 flex items-end space-x-2 px-2">
                             {[40, 60, 45, 70, 80, 50, 65, 85].map((h, i) => (
                                 <div key={i} className={`flex-1 rounded-t-sm ${idx === 0 ? 'bg-teal-100 hover:bg-teal-200' : 'bg-slate-100 hover:bg-slate-200'}`} style={{ height: `${h}%` }}></div>
                             ))}
                        </div>
                        <div className="border-t border-slate-100 mt-2"></div>
                    </div>
                ))}
             </div>
             
             <div className="p-3 bg-blue-50 text-blue-900 text-sm rounded-lg border border-blue-100 flex items-center">
                 <Activity size={16} className="mr-2" />
                 Data will populate automatically once telemetry streams are active.
             </div>

             <div className="flex justify-end">
                 <Button variant="outline" onClick={() => setPreviewDashboard(null)}>Close Preview</Button>
             </div>
         </div>
      </Modal>

    </div>
  );
};
