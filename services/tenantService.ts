
import { Tenant, OnboardingState } from '../types';

const STORAGE_KEY = 'aat_tenants_v1';
const CONTEXT_KEY = 'aat_current_tenant_id';

const SEED_TENANT: Tenant = {
  id: 't-1001',
  name: 'GreenMotion Logistics',
  legalName: 'GreenMotion Pvt Ltd',
  slug: 'green-motion',
  customerType: 'FLEET_OPERATOR',
  industryTags: ['EV_3W'],
  contactEmail: 'admin@greenmotion.com',
  modules: ['VoltEdge', 'EcoTrace360'],
  mvpFeatures: ['MVP-1', 'MVP-4'],
  status: 'ACTIVE',
  region: 'INDIA',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const TenantService = {
  // Helper to read from storage
  _getStore: (): Tenant[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      // Seed if empty
      const initial = [SEED_TENANT];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    } catch (e) {
      return [SEED_TENANT];
    }
  },

  getAll: async (): Promise<Tenant[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(TenantService._getStore());
      }, 300);
    });
  },

  getById: async (id: string): Promise<Tenant | undefined> => {
     const tenants = TenantService._getStore();
     return tenants.find(t => t.id === id);
  },

  // Context Management
  getCurrentTenantId: (): string | null => {
    return localStorage.getItem(CONTEXT_KEY);
  },

  setCurrentTenantId: (id: string | null) => {
    if (id) {
      localStorage.setItem(CONTEXT_KEY, id);
    } else {
      localStorage.removeItem(CONTEXT_KEY);
    }
  },

  // Create a Draft Stub for the "New Tenant" flow
  createStub: async (): Promise<Tenant> => {
      const tenants = TenantService._getStore();
      const newTenant: Tenant = {
          id: `t-${Date.now()}`,
          name: 'New Tenant',
          legalName: '',
          slug: '',
          customerType: 'FLEET_OPERATOR', // Default to avoid type errors
          industryTags: [],
          contactEmail: '',
          modules: [],
          mvpFeatures: [],
          status: 'DRAFT',
          region: 'INDIA',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
      };
      tenants.push(newTenant);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
      return newTenant;
  },

  // Finalize creation (called by Wizard)
  create: async (data: OnboardingState): Promise<Tenant> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tenants = TenantService._getStore();
        const currentId = TenantService.getCurrentTenantId();
        
        let targetTenantIndex = -1;
        
        // If we are currently in a DRAFT context, update that tenant
        if (currentId) {
            targetTenantIndex = tenants.findIndex(t => t.id === currentId && t.status === 'DRAFT');
        }

        const tenantData: Partial<Tenant> = {
          name: data.name,
          legalName: data.legalName,
          slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
          customerType: data.customerType as any,
          industryTags: data.industryTags,
          contactEmail: data.contactEmail,
          modules: data.selectedModules,
          mvpFeatures: data.selectedMVPs,
          status: 'ACTIVE', // Activate on complete
          region: data.region,
          updatedAt: new Date().toISOString(),
        };

        let finalTenant: Tenant;

        if (targetTenantIndex >= 0) {
            // Update Draft
            tenants[targetTenantIndex] = { ...tenants[targetTenantIndex], ...tenantData };
            finalTenant = tenants[targetTenantIndex];
        } else {
            // Create New (Fallback)
            finalTenant = {
                ...tenantData,
                id: `t-${Math.floor(Math.random() * 10000)}`,
                createdAt: new Date().toISOString(),
            } as Tenant;
            tenants.push(finalTenant);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(tenants));
        resolve(finalTenant);
      }, 1000);
    });
  },

  checkSlugAvailability: async (slug: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tenants = TenantService._getStore();
        const exists = tenants.some(t => t.slug === slug && t.id !== TenantService.getCurrentTenantId()); // Allow self
        resolve(!exists);
      }, 300);
    });
  }
};
