
import React, { useState, useEffect, useMemo } from 'react';
import { AuditLogEntry, Tenant } from '../../types';
import { AuditService } from '../../services/auditService';
import { TenantService } from '../../services/tenantService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Search, Download, Filter, Eye, Copy, RefreshCw, FileClock, Globe, Layout, ChevronDown } from 'lucide-react';

type DateFilter = 'TODAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'ALL';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  
  // Scope State
  const [scope, setScope] = useState<'CURRENT' | 'ALL'>('ALL');
  const [tenantFilter, setTenantFilter] = useState<string>('ALL');

  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityTypeFilter, setEntityTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');

  // Details Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    // Determine real context manually to avoid fallback
    const rawTid = localStorage.getItem('aat_current_tenant_id');
    setCurrentTenantId(rawTid);
    
    // Default scope based on presence of tenant context
    setScope(rawTid ? 'CURRENT' : 'ALL');

    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Fetch EVERYTHING then filter locally
    const [allLogs, allTenants] = await Promise.all([
        AuditService.getAllAuditLogs(),
        TenantService.getAll()
    ]);
    setLogs(allLogs);
    setTenants(allTenants);
    setLoading(false);
  };

  const handleSeed = async () => {
      // Seed for current tenant context or pick first if ALL
      const targetId = currentTenantId || tenants[0]?.id || 'demo-tenant';
      await AuditService.seedAuditLogs(targetId);
      await loadData();
  };

  const handleExport = () => {
    const headers = ['Timestamp', 'Tenant', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'Details'];
    const rows = filteredLogs.map(l => {
        const tenantName = tenants.find(t => t.id === l.tenantId)?.name || l.tenantId;
        return [
            l.timestamp,
            tenantName,
            l.actor || 'Super Admin',
            l.action,
            l.entityType,
            l.entityId || '-',
            JSON.stringify(l.meta || {})
        ]
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${scope === 'CURRENT' ? currentTenantId : 'ALL'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueActions = useMemo(() => Array.from(new Set(logs.map(l => l.action))), [logs]);
  const uniqueEntityTypes = useMemo(() => Array.from(new Set(logs.map(l => l.entityType))), [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // 1. Scope Filter
      if (scope === 'CURRENT') {
          // If for some reason state is desynced, safe guard
          if (!currentTenantId) return false; 
          if (log.tenantId !== currentTenantId) return false;
      } else {
          // Scope ALL: Check Tenant Filter
          if (tenantFilter !== 'ALL' && log.tenantId !== tenantFilter) return false;
      }

      // 2. Standard Filters
      const matchesSearch = 
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.entityType.toLowerCase().includes(search.toLowerCase()) ||
        (log.entityId && log.entityId.toLowerCase().includes(search.toLowerCase())) ||
        (log.actor && log.actor.toLowerCase().includes(search.toLowerCase()));

      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchesType = entityTypeFilter === 'ALL' || log.entityType === entityTypeFilter;
      
      let matchesDate = true;
      const logDate = new Date(log.timestamp);
      const now = new Date();
      if (dateFilter === 'TODAY') {
          matchesDate = logDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'LAST_7_DAYS') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= sevenDaysAgo;
      } else if (dateFilter === 'LAST_30_DAYS') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = logDate >= thirtyDaysAgo;
      }

      return matchesSearch && matchesAction && matchesType && matchesDate;
    });
  }, [logs, scope, tenantFilter, currentTenantId, search, actionFilter, entityTypeFilter, dateFilter]);

  const formatMeta = (meta: any) => {
      if (!meta) return '-';
      return Object.entries(meta).map(([k, v]) => {
          const valStr = Array.isArray(v) ? v.join(', ') : String(v);
          return <span key={k} className="mr-2 text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{k}: {valStr}</span>
      });
  };

  const currentTenantName = tenants.find(t => t.id === currentTenantId)?.name || currentTenantId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Audit Logs</h2>
          <p className="text-sm text-slate-500 mb-2">Track administrative actions across users, devices, modules, and settings.</p>
          <div className="flex items-center space-x-2 text-xs font-medium">
             {scope === 'CURRENT' ? (
                 <span className="text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full flex items-center">
                    <Layout size={12} className="mr-1.5" /> Showing logs for tenant: {currentTenantName}
                 </span>
             ) : (
                 <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full flex items-center">
                    <Globe size={12} className="mr-1.5" /> Showing logs across {tenantFilter === 'ALL' ? 'all tenants' : 'selected tenant'}
                 </span>
             )}
          </div>
        </div>
        <div className="flex items-center space-x-3 self-end md:self-auto">
             {logs.length === 0 && !loading && (
                 <Button variant="ghost" onClick={handleSeed}>
                     <RefreshCw size={16} className="mr-2" /> Generate sample logs
                 </Button>
             )}
             <Button variant="outline" onClick={handleExport} disabled={filteredLogs.length === 0}>
                <Download size={16} className="mr-2" /> Export CSV
             </Button>
        </div>
      </div>

      {/* Controls & Scope */}
      <div className="flex flex-col space-y-4">
          
          {/* Scope Toggles */}
          <div className="bg-slate-100 p-1 rounded-lg inline-flex self-start border border-slate-200">
             <button 
                onClick={() => currentTenantId && setScope('CURRENT')}
                disabled={!currentTenantId}
                className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center transition-all ${
                    scope === 'CURRENT' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
             >
                <Layout size={14} className="mr-2" /> Current Tenant
             </button>
             <button 
                onClick={() => setScope('ALL')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center transition-all ${
                    scope === 'ALL' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                <Globe size={14} className="mr-2" /> All Tenants
             </button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search */}
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search action, actor, or entity..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-lg placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
                />
            </div>
            
            <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                
                {/* Tenant Filter (Only visible if Scope = ALL) */}
                {scope === 'ALL' && (
                    <div className="relative min-w-[160px]">
                        <select 
                            value={tenantFilter}
                            onChange={(e) => setTenantFilter(e.target.value)}
                            className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-indigo-200 bg-indigo-50 text-indigo-900 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
                        >
                            <option value="ALL">All Tenants</option>
                            {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                    </div>
                )}

                {/* Standard Filters */}
                <div className="relative min-w-[140px]">
                    <select 
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-lg focus:outline-none focus:border-teal-500"
                    >
                        <option value="ALL">All Actions</option>
                        {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative min-w-[140px]">
                    <select 
                        value={entityTypeFilter}
                        onChange={(e) => setEntityTypeFilter(e.target.value)}
                        className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-lg focus:outline-none focus:border-teal-500"
                    >
                        <option value="ALL">All Types</option>
                        {uniqueEntityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative min-w-[140px]">
                    <select 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                        className="w-full appearance-none pl-3 pr-8 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-lg focus:outline-none focus:border-teal-500"
                    >
                        <option value="ALL">All Time</option>
                        <option value="TODAY">Today</option>
                        <option value="LAST_7_DAYS">Last 7 Days</option>
                        <option value="LAST_30_DAYS">Last 30 Days</option>
                    </select>
                    <Filter size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
            </div>
          </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">
           <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
           Loading logs...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileClock className="text-slate-400" size={32} />
          </div>
          <h3 className="text-slate-900 font-bold mb-2">No audit logs found</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Try adjusting your scope or filters, or generate sample activity.</p>
          {logs.length === 0 && (
             <Button variant="outline" onClick={handleSeed}>Generate sample logs</Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                {scope === 'ALL' && <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenant</th>}
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const logTenant = tenants.find(t => t.id === log.tenantId);
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedLog(log)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div className="font-medium">{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    </td>
                    {scope === 'ALL' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {logTenant ? (
                                <div className="font-medium text-slate-900">{logTenant.name}</div>
                            ) : (
                                <span className="text-slate-400 font-mono text-xs">{log.tenantId || '—'}</span>
                            )}
                        </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {log.actor || 'Super Admin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="neutral">{log.action}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div className="font-medium text-slate-900">{log.entityType}</div>
                        <div className="text-xs text-slate-400 font-mono truncate max-w-[120px]">{log.entityId || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                        {formatMeta(log.meta)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-slate-400 hover:text-teal-600 p-1">
                            <Eye size={16} />
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Log Details"
        size="lg"
      >
        {selectedLog && (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Log ID</span>
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 select-all">{selectedLog.id}</span>
                    </div>
                    <div>
                         <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Timestamp</span>
                         <span className="text-slate-900">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                    </div>
                    <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tenant Scope</span>
                        <span className="text-slate-900 font-medium">
                            {tenants.find(t => t.id === selectedLog.tenantId)?.name || selectedLog.tenantId}
                        </span>
                    </div>
                     <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Action</span>
                        <Badge variant="neutral">{selectedLog.action}</Badge>
                    </div>
                     <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Actor</span>
                        <span className="text-slate-900 font-medium">{selectedLog.actor || 'Super Admin'}</span>
                    </div>
                     <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Entity Type</span>
                        <span className="text-slate-900">{selectedLog.entityType}</span>
                    </div>
                     <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Entity ID</span>
                        <span className="font-mono text-slate-600 select-all">{selectedLog.entityId || 'N/A'}</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raw Payload</span>
                        <button 
                            onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2))}
                            className="text-xs flex items-center text-teal-600 hover:text-teal-700"
                        >
                            <Copy size={12} className="mr-1" /> Copy JSON
                        </button>
                    </div>
                    <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl text-xs font-mono overflow-auto max-h-60">
                        {JSON.stringify(selectedLog, null, 2)}
                    </pre>
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={() => setSelectedLog(null)}>Close</Button>
                </div>
            </div>
        )}
      </Modal>

    </div>
  );
};
