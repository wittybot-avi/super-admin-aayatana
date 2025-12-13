
import { User, UserRole, UserStatus } from '../types';

const STORAGE_KEY = 'aat_users_v1';
const CURRENT_TENANT_KEY = 'aat_current_tenant_id';

const MOCK_USERS: User[] = [
  {
    id: 'usr_seed_1',
    tenantId: 'demo-tenant',
    fullName: 'Alice Johnson',
    email: 'admin@demo.com',
    role: 'Tenant Admin',
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'usr_seed_2',
    tenantId: 'demo-tenant',
    fullName: 'Bob Smith',
    email: 'ops@demo.com',
    role: 'Ops Manager',
    status: 'Active',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: 'usr_seed_3',
    tenantId: 'demo-tenant',
    fullName: 'Charlie Davis',
    email: 'tech@demo.com',
    role: 'Technician',
    status: 'Pending',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const UserService = {
  getCurrentTenantId: (): string => {
    // If we were integrating with the real tenant selector, we'd pull from state.
    // For now, we fallback to local storage or default.
    return localStorage.getItem(CURRENT_TENANT_KEY) || 'demo-tenant';
  },

  getUsers: (tenantId: string): Promise<User[]> => {
    return new Promise((resolve) => {
      // Simulate network delay slightly for realism
      setTimeout(() => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          let allUsers: User[] = [];
          
          if (stored) {
            allUsers = JSON.parse(stored);
          } else {
            // Seed initial data if empty
            allUsers = MOCK_USERS;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));
          }
          
          const tenantUsers = allUsers.filter(u => u.tenantId === tenantId);
          resolve(tenantUsers);
        } catch (e) {
          console.error("Failed to parse users", e);
          resolve([]);
        }
      }, 300);
    });
  },

  createUser: (user: Omit<User, 'id' | 'createdAt' | 'status'>): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const newUser: User = {
          ...user,
          id: `usr_${crypto.randomUUID()}`,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        allUsers.push(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));
        resolve(newUser);
      }, 400);
    });
  },

  updateUser: (id: string, patch: Partial<User>): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const index = allUsers.findIndex(u => u.id === id);
        
        if (index === -1) {
          resolve(null);
          return;
        }
        
        const updatedUser = { ...allUsers[index], ...patch };
        allUsers[index] = updatedUser;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));
        resolve(updatedUser);
      }, 200);
    });
  },

  deleteUser: (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let allUsers: User[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        allUsers = allUsers.filter(u => u.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers));
        resolve();
      }, 200);
    });
  }
};
