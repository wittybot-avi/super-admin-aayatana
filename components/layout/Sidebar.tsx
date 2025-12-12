import React from 'react';
import { LayoutDashboard, Users, Building2, Radio, ClipboardList, Settings, Box, BarChart3, LogOut } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tenants', label: 'Tenants', icon: Building2 },
    { id: 'onboarding', label: 'Onboarding', icon: ClipboardList },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'devices', label: 'Devices', icon: Radio },
    { id: 'modules', label: 'Modules', icon: Box },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col text-white shadow-xl z-50">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-lg">A</span>
          </div>
          <span className="font-bold text-lg tracking-tight">Aayatana</span>
        </div>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Super Admin</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-2">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
