import React, { useState, useRef, useEffect } from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Database,
  ExternalLink,
  Cpu,
  ShieldCheck,
  Globe,
  Radio,
} from 'lucide-react';

interface EnterprisePortal {
  name: string;
  url: string;
  emoji: string;
  isCurrent?: boolean;
}

const ENTERPRISE_PORTALS: EnterprisePortal[] = [
  { name: 'SOHUB Machines', url: '#', emoji: '🤖', isCurrent: true },
  { name: 'SOHUB AI', url: 'https://ai.sohub.com.bd', emoji: '🧠' },
  { name: 'SOHUB Protect', url: 'https://protect.sohub.com.bd', emoji: '🛡️' },
  { name: 'SOHUB Controls', url: 'https://controls.sohub.com.bd', emoji: '🎛️' },
  { name: 'SOHUB Main Website', url: 'https://sohub.com.bd', emoji: '🌐' },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, orders } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 h-screen font-sans select-none">
      {/* Brand Header & Initiative Switcher Dropdown */}
      <div className="p-4 border-b border-slate-800 relative" ref={dropdownRef}>
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 transition-all border border-slate-700/60 cursor-pointer group active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            {/* Official SOHUB Favicon Logo */}
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-700/80 p-1 flex items-center justify-center shadow-md shrink-0">
              <img src="/favicon.png" alt="SOHUB Machines" className="w-full h-full object-contain" />
            </div>

            <div className="leading-tight">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block group-hover:text-[#ff751a] transition-colors">
                INITIATIVES
              </span>
              <span className="text-sm font-extrabold text-white tracking-tight">
                SOHUB Machines
              </span>
            </div>
          </div>
          {isDropdownOpen ? (
            <ChevronUp className="w-4 h-4 text-[#ff751a]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          )}
        </div>

        {/* Enterprise Initiatives Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-4 right-4 mt-2 p-2 bg-slate-950 border border-slate-700/90 rounded-2xl shadow-2xl space-y-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center justify-between border-b border-slate-800 mb-1 pb-2">
              <span>SOHUB Initiatives Portals</span>
              <Sparkles className="w-3 h-3 text-[#ff751a]" />
            </div>

            {ENTERPRISE_PORTALS.map((portal) => (
              <a
                key={portal.name}
                href={portal.url}
                target={portal.isCurrent ? '_self' : '_blank'}
                rel="noopener noreferrer"
                onClick={() => setIsDropdownOpen(false)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${
                  portal.isCurrent
                    ? 'bg-[#ff751a] text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{portal.emoji}</span>
                  <span>{portal.name}</span>
                </div>
                {portal.isCurrent ? (
                  <span className="text-[10px] uppercase font-black bg-white text-[#ff751a] px-1.5 py-0.5 rounded-md shadow-xs">
                    Active
                  </span>
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                )}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Links */}
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

      {/* Database Schema Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 font-bold">
            <Database className="w-3.5 h-3.5 text-[#ff751a]" /> DB Schema:
          </span>
          <span className="text-emerald-400 font-extrabold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
            v2.4 Live
          </span>
        </div>
        <p className="text-[10px] text-slate-500 font-medium">
          Machine-Driven Dynamic Addons Architecture Active
        </p>
      </div>
    </aside>
  );
};
