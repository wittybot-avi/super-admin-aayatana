
import { Dashboard, DashboardTemplate, AuditLogEntry } from '../types';

const STORAGE_KEY = 'aat_dashboards_v1';
const AUDIT_KEY = 'aat_audit_v1';
const CURRENT_TENANT_KEY = 'aat_current_tenant_id';

const MOCK_DASHBOARDS: Dashboard[] = [
  {
    id: 'dash_seed_1',
    tenantId: 'demo-tenant',
    name: 'Executive Overview',
    template: 'Fleet Health Overview',
    widgets: ['Active Devices', 'Avg SoH', 'Alerts (24h)', 'SoH Trend', 'Charging Pattern'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

export const TEMPLATE_DEFINITIONS: Record<DashboardTemplate, string[]> = {
  'Fleet Health Overview': ['Active Devices', 'Avg SoH', 'Alerts (24h)', 'SoH Trend', 'Charging Pattern'],
  'Battery Safety Alerts': ['Critical Alerts', 'Tamper Events', 'Geofence Breaches', 'Alert Frequency', 'Top Hotspots'],
  'Warranty & Failure Trends': ['Claims Raised', 'Abuse Classified', 'Defect Classified', 'Failures by Batch', 'IR Drift Distribution'],
};

// Internal Helper for Audit
const writeAudit = (tenantId: string, action: string, entityType: string, entityId: string) => {
    try {
        const storedAudit = localStorage.getItem(AUDIT_KEY);
        const allAudits: AuditLogEntry[] = storedAudit ? JSON.parse(storedAudit) : [];
        const entry: AuditLogEntry = {
            id: `aud_${crypto.randomUUID()}`,
            tenantId,
            action,
            entityType,
            timestamp: new Date().toISOString(),
            meta: { entityId }
        };
        allAudits.push(entry);
        localStorage.setItem(AUDIT_KEY, JSON.stringify(allAudits));
    } catch (e) {
        console.error("Audit log write failed", e);
    }
};

export const AnalyticsService = {
  getCurrentTenantId: (): string => {
    return localStorage.getItem(CURRENT_TENANT_KEY) || 'demo-tenant';
  },

  getDashboards: (tenantId: string): Promise<Dashboard[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          let allDashboards: Dashboard[] = [];
          
          if (stored) {
            allDashboards = JSON.parse(stored);
          } else {
            allDashboards = MOCK_DASHBOARDS;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allDashboards));
          }
          
          const tenantDashboards = allDashboards
            .filter(d => d.tenantId === tenantId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
          resolve(tenantDashboards);
        } catch (e) {
          console.error("Failed to parse dashboards", e);
          resolve([]);
        }
      }, 300);
    });
  },

  createDashboard: (dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt' | 'widgets'>): Promise<Dashboard> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allDashboards: Dashboard[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const newDashboard: Dashboard = {
          ...dashboard,
          id: `dash_${crypto.randomUUID()}`,
          widgets: TEMPLATE_DEFINITIONS[dashboard.template],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        allDashboards.push(newDashboard);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allDashboards));
        
        writeAudit(dashboard.tenantId, 'DASHBOARD_CREATED', 'Dashboard', newDashboard.id);
        
        resolve(newDashboard);
      }, 400);
    });
  },

  updateDashboard: (id: string, patch: Partial<Dashboard>): Promise<Dashboard | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allDashboards: Dashboard[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const index = allDashboards.findIndex(d => d.id === id);
        
        if (index === -1) {
          resolve(null);
          return;
        }
        
        const updatedDashboard = { 
            ...allDashboards[index], 
            ...patch,
            updatedAt: new Date().toISOString()
        };
        allDashboards[index] = updatedDashboard;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allDashboards));

        writeAudit(updatedDashboard.tenantId, 'DASHBOARD_UPDATED', 'Dashboard', id);

        resolve(updatedDashboard);
      }, 200);
    });
  },

  deleteDashboard: (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let allDashboards: Dashboard[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // Find tenantId before delete for audit
        const dash = allDashboards.find(d => d.id === id);
        const tenantId = dash ? dash.tenantId : 'unknown';

        allDashboards = allDashboards.filter(d => d.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allDashboards));

        writeAudit(tenantId, 'DASHBOARD_DELETED', 'Dashboard', id);

        resolve();
      }, 200);
    });
  }
};
