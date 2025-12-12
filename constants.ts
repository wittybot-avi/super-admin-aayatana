import { ModuleDefinition, MVPDefinition, ModuleId, MVPId } from './types';

export const MODULES: ModuleDefinition[] = [
  { id: 'VoltEdge', name: 'VoltEdge', description: 'Smart BMS + IoT gateway, raw telemetry, GPS', icon: 'Cpu' },
  { id: 'EcoTrace360', name: 'EcoTrace360', description: 'Telemetry ingestion, maps, alerts, operations', icon: 'Activity' },
  { id: 'EcoSense360', name: 'EcoSense360', description: 'AI/ML intelligence, predictive health', icon: 'Brain' },
  { id: 'VoltVault360', name: 'VoltVault360', description: 'Identity, provenance, Battery Aadhaar', icon: 'ShieldCheck' },
  { id: 'EcoMetricsESG', name: 'EcoMetricsESG', description: 'ESG/EPR/Carbon tracking', icon: 'Leaf' },
  { id: 'VoltPack', name: 'VoltPack', description: 'Manufacturing & machine integrations', icon: 'Factory' },
];

export const MVPS: MVPDefinition[] = [
  { id: 'MVP-1', name: 'Real-time Monitoring', description: 'VoltEdge raw + EcoTrace UI', requiredModules: ['VoltEdge', 'EcoTrace360'], dataVolume: 'High' },
  { id: 'MVP-2', name: 'Abuse/Tamper Alerts', description: 'Thermal runaway & theft detection', requiredModules: ['VoltEdge', 'EcoTrace360'], dataVolume: 'Medium' },
  { id: 'MVP-3', name: 'Predictive Health', description: 'SOH forecasting (EcoSense)', requiredModules: ['EcoSense360'], dataVolume: 'Medium' },
  { id: 'MVP-4', name: 'Location & Geo-fence', description: 'GPS tracking & rules', requiredModules: ['VoltEdge', 'EcoTrace360'], dataVolume: 'High' },
  { id: 'MVP-5', name: 'Swap Auth & Handshake', description: 'Good/Bad battery decisioning', requiredModules: ['VoltEdge', 'EcoTrace360'], dataVolume: 'Low' },
  { id: 'MVP-6', name: 'Warranty Validation', description: 'Usage vs Warranty Logic', requiredModules: ['EcoTrace360', 'EcoSense360'], dataVolume: 'Low' },
  { id: 'MVP-7', name: 'Cycle Analytics', description: 'Charge/Discharge pattern analysis', requiredModules: ['VoltEdge', 'EcoSense360'], dataVolume: 'Medium' },
  { id: 'MVP-8', name: 'Driver Behavior Score', description: 'Impact score based on usage', requiredModules: ['EcoSense360'], dataVolume: 'Medium' },
  { id: 'MVP-9', name: 'Lineage Viewer', description: 'Battery history timeline', requiredModules: ['EcoTrace360'], dataVolume: 'Low' },
  { id: 'MVP-10', name: 'Mobile App Access', description: 'End-user companion app', requiredModules: ['EcoTrace360'], dataVolume: 'Low' },
];

export const CUSTOMER_TYPES = [
  'BATTERY_MANUFACTURER', 'OEM', 'FLEET_OPERATOR', 'SWAPPING_OPERATOR', 'FINANCE_LEASING', 'RECYCLER', 'SERVICE_NETWORK'
];
