
import React from 'react';
import { LayoutDashboard, Users, Building2, Radio, ClipboardList, Settings, Box, BarChart3, LogOut, FileClock, Lock } from 'lucide-react';
import { Tenant } from '../../types';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  currentTenant: Tenant | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, currentTenant }) => {
  const isGlobal = !currentTenant;
  const isDraft = currentTenant?.status === 'DRAFT';

  // Define scope rules
  // Global items: Always enabled
  // Scoped items: Enabled only when currentTenant is present
  const menuItems = [
    { id: 'tenants', label: 'Tenants', icon: Building2, scoped: false },
    { id: 'dashboard', label: 'Tenant Overview', icon: LayoutDashboard, scoped: true },
    // Onboarding is special: Only show if DRAFT
    { 
      id: 'onboarding', 
      label: 'Onboarding', 
      icon: ClipboardList, 
      scoped: true, 
      hidden: !isDraft,
      badge: 'Setup' 
    },
    { id: 'users', label: 'Users', icon: Users, scoped: true },
    { id: 'devices', label: 'Devices', icon: Radio, scoped: true },
    { id: 'modules', label: 'Modules', icon: Box, scoped: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, scoped: true },
    { id: 'audit_logs', label: 'Audit Logs', icon: FileClock, scoped: true },
    { id: 'settings', label: 'Settings', icon: Settings, scoped: true },
  ];

  return (
    <div className="w-72 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col text-slate-300 shadow-2xl z-50 font-sans border-r border-slate-800">
      <div className="p-8 pb-6 border-b border-slate-800/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/50 flex-shrink-0">
            <span className="font-bold text-xl text-white">A</span>
          </div>
          <div className="overflow-hidden">
            <span className="font-bold text-xl text-white tracking-tight block leading-tight truncate">Aayatana</span>
            <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Super Admin</span>
          </div>
        </div>

        {/* Tenant Context Label */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tenant Context</div>
           <div className={`font-medium truncate ${currentTenant ? 'text-white' : 'text-slate-500 italic'}`}>
             {currentTenant ? (
                <div className="flex flex-col">
                    <span>{currentTenant.name}</span>
                    {currentTenant.status === 'DRAFT' && <span className="text-[10px] text-amber-500 font-bold">DRAFT - SETUP REQUIRED</span>}
                </div>
             ) : 'None selected'}
           </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          if (item.hidden) return null;

          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isDisabled = item.scoped && !currentTenant;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onChangeView(item.id)}
              disabled={isDisabled}
              title={isDisabled ? "Select a tenant to manage this area" : ""}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-slate-800 text-teal-400 font-semibold' 
                  : isDisabled
                    ? 'opacity-40 cursor-not-allowed text-slate-600'
                    : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-500 rounded-r-full shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
              )}
              <Icon size={20} className={`transition-colors flex-shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="truncate">{item.label}</span>
              
              {/* Badge for Setup/Draft */}
              {/* @ts-ignore */}
              {item.badge && (
                <span className="ml-auto px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wide">
                  {/* @ts-ignore */}
                  {item.badge}
                </span>
              )}

              {isDisabled && !item.badge && <Lock size={12} className="ml-auto text-slate-600" />}
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
