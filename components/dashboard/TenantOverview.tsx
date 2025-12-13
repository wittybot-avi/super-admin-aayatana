
import React, { useEffect, useState } from 'react';
import { Tenant, ModuleEntitlement, TenantSettings, AuditLogEntry } from '../../types';
import { UserService } from '../../services/userService';
import { DeviceService } from '../../services/deviceService';
import { ModuleService } from '../../services/moduleService';
import { AnalyticsService } from '../../services/analyticsService';
import { SettingsService } from '../../services/settingsService';
import { AuditService } from '../../services/auditService';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Users, Radio, Box, LayoutDashboard, CheckCircle2, AlertTriangle, 
  ArrowRight, Activity, ShieldCheck, Settings 
} from 'lucide-react';

interface TenantOverviewProps {
  tenant: Tenant | null;
  onChangeView: (view: string) => void;
}

export const TenantOverview: React.FC<TenantOverviewProps> = ({ tenant, onChangeView }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    devices: 0,
    devicesOnline: 0,
    modulesActive: 0,
    dashboards: 0
  });
  const [entitlements, setEntitlements] = useState<ModuleEntitlement[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<TenantSettings | null>(null);

  useEffect(() => {
    if (tenant) {
      loadTenantData(tenant.id);
    } else {
        setLoading(false);
    }
  }, [tenant]);

  const loadTenantData = async (tenantId: string) => {
    setLoading(true);
    const [users, devices, modules, dashboards, settingsData, logs] = await Promise.all([
        UserService.getUsers(tenantId),
        DeviceService.getDevices(tenantId),
        ModuleService.getEntitlements(tenantId),
        AnalyticsService.getDashboards(tenantId),
        SettingsService.getSettings(tenantId),
        AuditService.getAuditLogs(tenantId)
    ]);

    setStats({
        users: users.length,
        admins: users.filter(u => u.role === 'Tenant Admin').length,
        devices: devices.length,
        devicesOnline: devices.filter(d => d.status === 'Active').length,
        modulesActive: modules.filter(m => m.enabled).length,
        dashboards: dashboards.length
    });
    setEntitlements(modules);
    setSettings(settingsData);
    setRecentLogs(logs.slice(0, 5));
    setLoading(false);
  };

  if (!tenant) {
      return (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
             <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="text-slate-400" size={32} />
             </div>
             <h3 className="text-slate-900 font-bold mb-2">No Tenant Selected</h3>
             <p className="text-slate-500 mb-6 max-w-sm mx-auto">Select a tenant from the top bar to view their operational overview.</p>
             <Button onClick={() => onChangeView('tenants')}>Go to Tenants</Button>
          </div>
      );
  }

  if (loading) {
     return (
        <div className="text-center py-20 text-slate-500">
           <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
           Loading overview...
        </div>
     );
  }

  // Checklist Logic
  const checklist = [
    { label: 'Tenant Environment Active', valid: true, link: null },
    { label: 'Administrator Account Created', valid: stats.admins > 0, link: 'users', linkText: 'Manage Users' },
    { label: 'Platform Modules Enabled', valid: stats.modulesActive > 0, link: 'modules', linkText: 'Configure Modules' },
    { label: 'Devices Registered', valid: stats.devices > 0, link: 'devices', linkText: 'Register Device' },
    { label: 'Notification Channels Set', valid: (settings?.notificationChannels.length || 0) > 0, link: 'settings', linkText: 'Update Settings' },
    { label: 'Analytics Dashboard Created', valid: stats.dashboards > 0, link: 'analytics', linkText: 'Create Dashboard' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Tenant Overview</h2>
            <p className="text-slate-500 mt-1">Operational readiness and configuration summary for <span className="font-semibold text-slate-700">{tenant.name}</span>.</p>
            <div className="flex items-center space-x-2 mt-3">
                 <Badge variant={tenant.status === 'ACTIVE' ? 'success' : 'warning'}>{tenant.status}</Badge>
                 <span className="text-xs text-slate-400 border-l border-slate-300 pl-2 ml-2">{tenant.region}</span>
                 <span className="text-xs text-slate-400 border-l border-slate-300 pl-2 ml-2">{tenant.customerType.replace('_', ' ')}</span>
            </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
                    <span className="text-2xl font-bold text-slate-900">{stats.users}</span>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-700">Total Users</h4>
                    <p className="text-xs text-slate-500">{stats.admins} Admins</p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Radio size={20} /></div>
                    <span className="text-2xl font-bold text-slate-900">{stats.devices}</span>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-700">Total Devices</h4>
                    <p className="text-xs text-slate-500 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                        {stats.devicesOnline} Active
                    </p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><Box size={20} /></div>
                    <span className="text-2xl font-bold text-slate-900">{stats.modulesActive}</span>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-700">Active Modules</h4>
                    <p className="text-xs text-slate-500">Platform Capabilities</p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><LayoutDashboard size={20} /></div>
                    <span className="text-2xl font-bold text-slate-900">{stats.dashboards}</span>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-700">Saved Dashboards</h4>
                    <p className="text-xs text-slate-500">Operational Views</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Readiness Checklist */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 flex items-center">
                            <ShieldCheck size={18} className="mr-2 text-teal-600" /> Operational Readiness
                        </h3>
                        <span className="text-xs font-medium text-slate-500">{checklist.filter(c => c.valid).length} / {checklist.length} Passing</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {checklist.map((item, idx) => (
                            <div key={idx} className="px-6 py-4 flex items-center justify-between group">
                                <div className="flex items-center space-x-3">
                                    {item.valid 
                                        ? <div className="bg-teal-100 text-teal-700 p-1 rounded-full"><CheckCircle2 size={16} /></div> 
                                        : <div className="bg-amber-100 text-amber-600 p-1 rounded-full"><AlertTriangle size={16} /></div>
                                    }
                                    <span className={`text-sm ${item.valid ? 'text-slate-700' : 'text-slate-900 font-medium'}`}>{item.label}</span>
                                </div>
                                {!item.valid && item.link && (
                                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onChangeView(item.link!)}>
                                        {item.linkText} <ArrowRight size={12} className="ml-1" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Module Summary */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center">
                            <Box size={18} className="mr-2 text-teal-600" /> Module Entitlements
                        </h3>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4">
                        {entitlements.map(m => (
                            <div key={m.moduleId} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg">
                                <span className="text-sm font-medium text-slate-700">{m.moduleId}</span>
                                <div className="flex items-center space-x-2">
                                     <Badge variant={m.enabled ? 'success' : 'neutral'}>{m.enabled ? m.tier : 'Disabled'}</Badge>
                                </div>
                            </div>
                        ))}
                        {entitlements.length === 0 && <span className="text-sm text-slate-400 italic">No modules configured.</span>}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                     <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 flex items-center">
                            <Activity size={18} className="mr-2 text-teal-600" /> Recent Activity
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => onChangeView('audit_logs')}>View All</Button>
                    </div>
                    {recentLogs.length > 0 ? (
                         <table className="min-w-full divide-y divide-slate-50">
                             <thead className="bg-slate-50">
                                 <tr>
                                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Action</th>
                                     <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actor</th>
                                     <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Time</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                 {recentLogs.map(log => (
                                     <tr key={log.id}>
                                         <td className="px-6 py-3 text-sm text-slate-900 font-medium">{log.action}</td>
                                         <td className="px-6 py-3 text-sm text-slate-500">{log.actor || 'System'}</td>
                                         <td className="px-6 py-3 text-sm text-slate-400 text-right">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                    ) : (
                        <div className="p-8 text-center text-slate-400 text-sm">No recent activity recorded.</div>
                    )}
                </div>

            </div>

            {/* Right Column (1/3) */}
            <div className="space-y-6">
                
                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
                     <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">Quick Actions</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        <Button variant="outline" className="w-full justify-start" onClick={() => onChangeView('users')}>
                            <Users size={16} className="mr-2 text-slate-500" /> Invite User
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => onChangeView('devices')}>
                            <Radio size={16} className="mr-2 text-slate-500" /> Register Device
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => onChangeView('modules')}>
                            <Box size={16} className="mr-2 text-slate-500" /> Update Modules
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => onChangeView('analytics')}>
                            <LayoutDashboard size={16} className="mr-2 text-slate-500" /> Create Dashboard
                        </Button>
                        <div className="h-px bg-slate-100 my-2"></div>
                        <Button variant="ghost" className="w-full justify-start text-slate-600" onClick={() => onChangeView('settings')}>
                            <Settings size={16} className="mr-2 text-slate-500" /> Tenant Settings
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};
