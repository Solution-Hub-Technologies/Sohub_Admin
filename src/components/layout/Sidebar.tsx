import React from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Sliders,
  Database,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, orders } = useApp();

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
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 h-screen font-sans select-none">
      {/* Brand Header & Initiative Switcher */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors border border-slate-700/60 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#ff751a] text-white flex items-center justify-center font-black text-sm shadow-brand">
              S
            </div>
            <div className="leading-tight">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                INITIATIVE
              </span>
              <span className="text-sm font-extrabold text-white tracking-tight">
                SOHUB Machines
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Simplified Navigation (2 Main Screens Only) */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 flex items-center justify-between">
            <span>Main Console</span>
            <Sparkles className="w-3 h-3 text-[#ff751a]" />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs transition-all ${
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
                          : 'bg-[#ff751a] text-white'
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

      {/* Database Active Schema Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 font-bold">
            <Database className="w-3.5 h-3.5 text-[#ff751a]" /> DB Schema
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-extrabold border border-slate-700">
            sohub_admin
          </span>
        </div>
      </div>
    </aside>
  );
};
