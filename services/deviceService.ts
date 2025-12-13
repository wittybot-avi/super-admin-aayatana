
import { Device, DeviceStatus, DeviceType } from '../types';

const STORAGE_KEY = 'aat_devices_v1';
const CURRENT_TENANT_KEY = 'aat_current_tenant_id';

const MOCK_DEVICES: Device[] = [
  {
    id: 'dev_seed_1',
    tenantId: 'demo-tenant',
    serial: 'BMS-2024-X99',
    type: 'Smart BMS',
    status: 'Active',
    firmwareVersion: '1.2.4',
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    notes: 'Prototype pack #1'
  },
  {
    id: 'dev_seed_2',
    tenantId: 'demo-tenant',
    serial: 'IOT-GW-7721',
    type: 'IoT Gateway',
    status: 'Offline',
    firmwareVersion: '2.0.1',
    lastSeenAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'dev_seed_3',
    tenantId: 'demo-tenant',
    serial: 'SWP-RDR-003',
    type: 'Swap Station Reader',
    status: 'Provisioned',
    firmwareVersion: '1.0.0',
    lastSeenAt: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Deployed at Mumbai Central hub'
  }
];

export const DeviceService = {
  getCurrentTenantId: (): string => {
    return localStorage.getItem(CURRENT_TENANT_KEY) || 'demo-tenant';
  },

  getDevices: (tenantId: string): Promise<Device[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          let allDevices: Device[] = [];
          
          if (stored) {
            allDevices = JSON.parse(stored);
          } else {
            allDevices = MOCK_DEVICES;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allDevices));
          }
          
          const tenantDevices = allDevices
            .filter(d => d.tenantId === tenantId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            
          resolve(tenantDevices);
        } catch (e) {
          console.error("Failed to parse devices", e);
          resolve([]);
        }
      }, 300);
    });
  },

  createDevice: (device: Omit<Device, 'id' | 'createdAt' | 'status' | 'lastSeenAt'>): Promise<Device> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allDevices: Device[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const newDevice: Device = {
          ...device,
          id: `dev_${crypto.randomUUID()}`,
          status: 'Provisioned',
          lastSeenAt: null,
          createdAt: new Date().toISOString()
        };
        allDevices.push(newDevice);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allDevices));
        resolve(newDevice);
      }, 400);
    });
  },

  updateDevice: (id: string, patch: Partial<Device>): Promise<Device | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allDevices: Device[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const index = allDevices.findIndex(d => d.id === id);
        
        if (index === -1) {
          resolve(null);
          return;
        }
        
        const updatedDevice = { ...allDevices[index], ...patch };
        allDevices[index] = updatedDevice;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allDevices));
        resolve(updatedDevice);
      }, 200);
    });
  },

  deleteDevice: (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let allDevices: Device[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        allDevices = allDevices.filter(d => d.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allDevices));
        resolve();
      }, 200);
    });
  },

  isSerialUnique: (tenantId: string, serial: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allDevices: Device[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        // Check for duplicate serial within the same tenant
        const exists = allDevices.some(d => d.tenantId === tenantId && d.serial.toLowerCase() === serial.toLowerCase().trim());
        resolve(!exists);
      }, 200);
    });
  }
};
