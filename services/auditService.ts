
import { AuditLogEntry } from '../types';

const AUDIT_KEY = 'aat_audit_v1';
const CURRENT_TENANT_KEY = 'aat_current_tenant_id';

export const AuditService = {
  getCurrentTenantId: (): string => {
    return localStorage.getItem(CURRENT_TENANT_KEY) || 'demo-tenant';
  },

  getAuditLogs: (tenantId: string): Promise<AuditLogEntry[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const stored = localStorage.getItem(AUDIT_KEY);
          let allLogs: AuditLogEntry[] = stored ? JSON.parse(stored) : [];
          
          // Filter by tenant and sort desc
          const tenantLogs = allLogs
            .filter(l => l.tenantId === tenantId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
          resolve(tenantLogs);
        } catch (e) {
          console.error("Failed to parse audit logs", e);
          resolve([]);
        }
      }, 300);
    });
  },

  seedAuditLogs: (tenantId: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = Date.now();
        const newLogs: AuditLogEntry[] = [
          {
            id: `aud_${crypto.randomUUID()}`,
            tenantId,
            action: 'TENANT_CREATED',
            entityType: 'Tenant',
            entityId: tenantId,
            actor: 'System',
            timestamp: new Date(now - 86400000 * 5).toISOString(),
            meta: { source: 'Onboarding Wizard' }
          },
          {
            id: `aud_${crypto.randomUUID()}`,
            tenantId,
            action: 'USER_INVITED',
            entityType: 'User',
            entityId: 'admin@customer.com',
            actor: 'Super Admin',
            timestamp: new Date(now - 86400000 * 4).toISOString(),
            meta: { role: 'Tenant Admin' }
          },
          {
            id: `aud_${crypto.randomUUID()}`,
            tenantId,
            action: 'MODULES_UPDATED',
            entityType: 'ModuleEntitlement',
            actor: 'Super Admin',
            timestamp: new Date(now - 86400000 * 3).toISOString(),
            meta: { changed: ['EcoSense360', 'VoltVault360'] }
          },
          {
            id: `aud_${crypto.randomUUID()}`,
            tenantId,
            action: 'DEVICE_REGISTERED',
            entityType: 'Device',
            entityId: 'BMS-DEMO-001',
            actor: 'Super Admin',
            timestamp: new Date(now - 86400000 * 2).toISOString(),
            meta: { type: 'Smart BMS' }
          },
          {
            id: `aud_${crypto.randomUUID()}`,
            tenantId,
            action: 'SETTINGS_UPDATED',
            entityType: 'TenantSettings',
            actor: 'Super Admin',
            timestamp: new Date(now - 86400000 * 1).toISOString(),
            meta: { changedKeys: ['retentionDays', 'region'] }
          }
        ];

        const stored = localStorage.getItem(AUDIT_KEY);
        let allLogs: AuditLogEntry[] = stored ? JSON.parse(stored) : [];
        allLogs = [...allLogs, ...newLogs];
        
        localStorage.setItem(AUDIT_KEY, JSON.stringify(allLogs));
        resolve();
      }, 500);
    });
  }
};
