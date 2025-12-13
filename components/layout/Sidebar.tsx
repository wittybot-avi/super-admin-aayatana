
import React from 'react';
import { LayoutDashboard, Users, Building2, Radio, ClipboardList, Settings, Box, BarChart3, LogOut, FileClock } from 'lucide-react';

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
    { id: 'audit_logs', label: 'Audit Logs', icon: FileClock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-72 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col text-slate-300 shadow-2xl z-50 font-sans border-r border-slate-800">
      <div className="p-8 pb-6 border-b border-slate-800/50">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/50">
            <span className="font-bold text-xl text-white">A</span>
          </div>
          <div>
            <span className="font-bold text-xl text-white tracking-tight block leading-tight">Aayatana</span>
            <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Super Admin</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-slate-800 text-teal-400 font-semibold' 
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-500 rounded-r-full shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
              )}
              <Icon size={20} className={`transition-colors ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <button className="flex items-center space-x-3 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-all w-full px-4 py-3 rounded-xl">
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
