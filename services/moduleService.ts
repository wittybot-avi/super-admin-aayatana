
import { ModuleEntitlement, ModuleId, AuditLogEntry, ModuleTier } from '../types';
import { MODULES } from '../constants';

const MODULES_KEY = 'aat_modules_v1';
const AUDIT_KEY = 'aat_audit_v1';
const CURRENT_TENANT_KEY = 'aat_current_tenant_id';

export const ModuleService = {
  getCurrentTenantId: (): string => {
    return localStorage.getItem(CURRENT_TENANT_KEY) || 'demo-tenant';
  },

  getEntitlements: (tenantId: string): Promise<ModuleEntitlement[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const stored = localStorage.getItem(MODULES_KEY);
          let allEntitlements: Record<string, ModuleEntitlement[]> = stored ? JSON.parse(stored) : {};
          
          let tenantEntitlements = allEntitlements[tenantId];

          // If no entitlements exist, create defaults
          if (!tenantEntitlements || tenantEntitlements.length === 0) {
            tenantEntitlements = MODULES.map(m => ({
              moduleId: m.id,
              enabled: m.id === 'EcoTrace360', // Default enabled
              tier: 'Basic',
              updatedAt: new Date().toISOString()
            }));
          } else {
            // Merge with potentially new modules in constants that aren't in store yet
            const existingIds = new Set(tenantEntitlements.map(e => e.moduleId));
            const missingModules = MODULES.filter(m => !existingIds.has(m.id)).map(m => ({
              moduleId: m.id,
              enabled: false,
              tier: 'Basic' as ModuleTier,
              updatedAt: new Date().toISOString()
            }));
            tenantEntitlements = [...tenantEntitlements, ...missingModules];
          }

          resolve(tenantEntitlements);
        } catch (e) {
          console.error("Failed to parse entitlements", e);
          // Fallback to defaults
          resolve(MODULES.map(m => ({
            moduleId: m.id,
            enabled: m.id === 'EcoTrace360',
            tier: 'Basic',
            updatedAt: new Date().toISOString()
          })));
        }
      }, 300);
    });
  },

  saveEntitlements: (tenantId: string, entitlements: ModuleEntitlement[]): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Save Entitlements
        const stored = localStorage.getItem(MODULES_KEY);
        let allEntitlements: Record<string, ModuleEntitlement[]> = stored ? JSON.parse(stored) : {};
        
        // Find changes for audit log
        const oldEntitlements = allEntitlements[tenantId] || [];
        const changedModules = entitlements.filter(n => {
            const o = oldEntitlements.find(old => old.moduleId === n.moduleId);
            return !o || o.enabled !== n.enabled || o.tier !== n.tier;
        }).map(e => e.moduleId);

        allEntitlements[tenantId] = entitlements.map(e => ({
            ...e,
            updatedAt: new Date().toISOString() // Update timestamp on save
        }));
        
        localStorage.setItem(MODULES_KEY, JSON.stringify(allEntitlements));

        // Write Audit Log
        if (changedModules.length > 0) {
            const auditLog: AuditLogEntry = {
                id: `aud_${crypto.randomUUID()}`,
                tenantId,
                action: 'MODULES_UPDATED',
                entityType: 'ModuleEntitlement',
                timestamp: new Date().toISOString(),
                meta: { changed: changedModules }
            };

            const storedAudit = localStorage.getItem(AUDIT_KEY);
            const allAudits: AuditLogEntry[] = storedAudit ? JSON.parse(storedAudit) : [];
            allAudits.push(auditLog);
            localStorage.setItem(AUDIT_KEY, JSON.stringify(allAudits));
        }

        resolve();
      }, 500);
    });
  }
};
