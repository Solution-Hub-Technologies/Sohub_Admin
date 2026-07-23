import React from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Sliders,
  Users,
  Building2,
  ChevronDown,
  Sparkles,
  Database,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, orders, usersList } = useApp();

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'orders',
      label: 'Orders & Leads',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: 'configurator',
      label: 'Configurator & Pricing',
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: 'users',
      label: 'User & Team Access',
      icon: <Users className="w-4 h-4" />,
      badge: usersList.length,
    },
    {
      id: 'settings',
      label: 'Bank & Quotation Rules',
      icon: <Building2 className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 h-screen font-sans select-none">
      {/* Brand Header & Initiative Switcher */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 transition-colors border border-slate-700/60 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff751a] text-white flex items-center justify-center font-black text-base shadow-brand">
              S
            </div>
            <div className="leading-tight">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                ENTERPRISE
              </span>
              <span className="text-sm font-extrabold text-white tracking-tight">
                SOHUB Machines
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center justify-between">
            <span>Control Console</span>
            <Sparkles className="w-3 h-3 text-[#ff751a]" />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#ff751a] text-white shadow-brand'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive
                          ? 'bg-white text-[#ff751a]'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Database Schema & Auth Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 font-bold">
            <Database className="w-3.5 h-3.5 text-[#ff751a]" /> Schema:
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-extrabold border border-slate-700">
            sohub_admin
          </span>
        </div>
      </div>
    </aside>
  );
};
