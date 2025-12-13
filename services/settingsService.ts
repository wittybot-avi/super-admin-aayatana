
import { TenantSettings, AuditLogEntry, TenantRegion, SamplingProfile, NotificationChannel } from '../types';

const STORAGE_KEY = 'aat_settings_v1';
const AUDIT_KEY = 'aat_audit_v1';
const CURRENT_TENANT_KEY = 'aat_current_tenant_id';

const DEFAULT_SETTINGS: TenantSettings = {
  tenantId: 'demo-tenant',
  region: 'INDIA',
  dppReadiness: false,
  retentionDays: 90,
  samplingProfile: 'BALANCED_5S',
  notificationChannels: ['EMAIL'],
  webhookUrl: '',
  requireMfaAdmins: false,
  apiIpAllowlistEnabled: false,
  ipAllowlist: [],
  updatedAt: new Date().toISOString()
};

export const SettingsService = {
  getCurrentTenantId: (): string => {
    return localStorage.getItem(CURRENT_TENANT_KEY) || 'demo-tenant';
  },

  getSettings: (tenantId: string): Promise<TenantSettings> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          let allSettings: Record<string, TenantSettings> = stored ? JSON.parse(stored) : {};
          
          let tenantSettings = allSettings[tenantId];

          if (!tenantSettings) {
            // Return defaults scoped to this tenant
            tenantSettings = {
                ...DEFAULT_SETTINGS,
                tenantId: tenantId,
                updatedAt: new Date().toISOString()
            };
          }

          resolve(tenantSettings);
        } catch (e) {
          console.error("Failed to parse settings", e);
          resolve({
              ...DEFAULT_SETTINGS,
              tenantId: tenantId
          });
        }
      }, 300);
    });
  },

  saveSettings: (tenantId: string, settings: TenantSettings): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        let allSettings: Record<string, TenantSettings> = stored ? JSON.parse(stored) : {};
        
        const oldSettings = allSettings[tenantId] || { ...DEFAULT_SETTINGS, tenantId };
        
        // Calculate changed keys for audit
        const changedKeys: string[] = [];
        (Object.keys(settings) as (keyof TenantSettings)[]).forEach(key => {
            if (key === 'updatedAt') return;
            if (JSON.stringify(settings[key]) !== JSON.stringify(oldSettings[key])) {
                changedKeys.push(key);
            }
        });

        // Save
        const newSettings = {
            ...settings,
            updatedAt: new Date().toISOString()
        };
        allSettings[tenantId] = newSettings;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));

        // Audit Log
        if (changedKeys.length > 0) {
             const storedAudit = localStorage.getItem(AUDIT_KEY);
             const allAudits: AuditLogEntry[] = storedAudit ? JSON.parse(storedAudit) : [];
             const entry: AuditLogEntry = {
                 id: `aud_${crypto.randomUUID()}`,
                 tenantId,
                 action: 'SETTINGS_UPDATED',
                 entityType: 'TenantSettings',
                 timestamp: new Date().toISOString(),
                 meta: { changedKeys }
             };
             allAudits.push(entry);
             localStorage.setItem(AUDIT_KEY, JSON.stringify(allAudits));
        }

        resolve();
      }, 500);
    });
  }
};
