export type CustomerType = 
  | 'BATTERY_MANUFACTURER'
  | 'OEM'
  | 'FLEET_OPERATOR'
  | 'SWAPPING_OPERATOR'
  | 'FINANCE_LEASING'
  | 'RECYCLER'
  | 'SERVICE_NETWORK'
  | 'MACHINE_OEM';

export type IndustryTag = 'EV_2W' | 'EV_3W' | 'EV_4W' | 'EV_CV' | 'DRONES' | 'DEFENCE';

export type ModuleId = 
  | 'VoltEdge'
  | 'EcoTrace360'
  | 'EcoSense360'
  | 'VoltVault360'
  | 'EcoMetricsESG'
  | 'VoltPack';

export type MVPId = 
  | 'MVP-1' | 'MVP-2' | 'MVP-3' | 'MVP-4' | 'MVP-5' 
  | 'MVP-6' | 'MVP-7' | 'MVP-8' | 'MVP-9' | 'MVP-10';

export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  description: string;
  icon: string;
}

export interface MVPDefinition {
  id: MVPId;
  name: string;
  description: string;
  requiredModules: ModuleId[];
  dataVolume: 'Low' | 'Medium' | 'High';
}

export interface Tenant {
  id: string;
  name: string;
  legalName: string;
  slug: string;
  customerType: CustomerType;
  industryTags: IndustryTag[];
  contactEmail: string;
  modules: ModuleId[];
  mvpFeatures: MVPId[];
  status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED';
  region: 'INDIA' | 'EU' | 'US';
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingState {
  step: number;
  // Step 1
  name: string;
  legalName: string;
  slug: string;
  customerType: CustomerType | '';
  industryTags: IndustryTag[];
  contactEmail: string;
  // Step 2
  selectedModules: ModuleId[];
  selectedMVPs: MVPId[];
  // Step 3
  dataRetentionDays: number;
  region: 'INDIA' | 'EU' | 'US';
  slaTier: 'Basic' | 'Pro' | 'Enterprise';
  // Step 4
  identityScheme: 'QR' | 'QR_NFC' | 'QR_SE';
  complianceReady: boolean;
  // Step 5 (Simplified for UI state)
  usersInvited: { email: string; role: string }[];
  // Step 6
  provisioningMode: 'MANUAL' | 'API' | 'QR_SCAN';
  // Step 7
  integrations: {
    telematics: boolean;
    erp: boolean;
    swapApi: boolean;
  };
}

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  step: 1,
  name: '',
  legalName: '',
  slug: '',
  customerType: '',
  industryTags: [],
  contactEmail: '',
  selectedModules: [],
  selectedMVPs: [],
  dataRetentionDays: 90,
  region: 'INDIA',
  slaTier: 'Basic',
  identityScheme: 'QR',
  complianceReady: false,
  usersInvited: [],
  provisioningMode: 'MANUAL',
  integrations: {
    telematics: false,
    erp: false,
    swapApi: false,
  },
};
