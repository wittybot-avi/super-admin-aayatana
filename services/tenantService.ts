import { Tenant, OnboardingState } from '../types';

// In-memory store
let tenants: Tenant[] = [
  {
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
  }
];

export const TenantService = {
  getAll: async (): Promise<Tenant[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...tenants]), 600);
    });
  },

  create: async (data: OnboardingState): Promise<Tenant> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTenant: Tenant = {
          id: `t-${Math.floor(Math.random() * 10000)}`,
          name: data.name,
          legalName: data.legalName,
          slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
          customerType: data.customerType as any,
          industryTags: data.industryTags,
          contactEmail: data.contactEmail,
          modules: data.selectedModules,
          mvpFeatures: data.selectedMVPs,
          status: 'ACTIVE',
          region: data.region,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        tenants.push(newTenant);
        resolve(newTenant);
      }, 1500); // Simulate network latency
    });
  },

  checkSlugAvailability: async (slug: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const exists = tenants.some(t => t.slug === slug);
        resolve(!exists);
      }, 300);
    });
  }
};
