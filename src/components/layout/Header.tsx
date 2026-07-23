import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Database,
  ChevronDown,
  RefreshCw,
  LogOut,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { globalSearch, setGlobalSearch, isSupabaseLive, isSyncing, orders, setActiveTab, currentUser, logout } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === 'Pending');

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-6 flex items-center justify-between shadow-xs select-none">
      {/* Search Input Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, customers, email or company..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              if (e.target.value.trim().length > 0) {
                setActiveTab('orders');
              }
            }}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ff751a]/30 focus:border-[#ff751a] transition-all placeholder:text-slate-400 font-sans"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-md px-1.5 py-0.5 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Header Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Schema Status Indicator Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700">
          <Database className="w-3.5 h-3.5 text-[#ff751a]" />
          <span>Schema:</span>
          <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            sohub_admin
          </span>
          {isSyncing ? (
            <RefreshCw className="w-3 h-3 text-[#ff751a] animate-spin ml-1" />
          ) : isSupabaseLive ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected to Supabase DB"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-500" title="Local Cache Mode"></span>
          )}
        </div>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all relative focus:outline-none cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {pendingOrders.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ff751a] rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-30 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</h3>
                <span className="text-xs text-[#ff751a] font-semibold">{pendingOrders.length} Pending</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {pendingOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No pending quotations requiring review</p>
                ) : (
                  pendingOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => {
                        setActiveTab('orders');
                        setNotificationsOpen(false);
                      }}
                      className="p-2.5 hover:bg-amber-50/60 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-amber-200"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{ord.order_number}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                          Review Needed
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{ord.customer_company}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
              {currentUser?.full_name ? currentUser.full_name.substring(0, 2).toUpperCase() : 'SA'}
            </div>
            <div className="text-left hidden md:block leading-tight">
              <p className="text-xs font-bold text-slate-900">
                {currentUser?.full_name || 'Super Admin'}
              </p>
              <p className="text-[10px] text-[#ff751a] font-bold font-mono">
                {currentUser?.role || 'Super Admin'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-30 space-y-1 animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-extrabold text-slate-900">
                  {currentUser?.full_name || 'Super Admin'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  {currentUser?.email || 'admin@sohub.com.bd'}
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveTab('users');
                  setProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#ff751a]" /> User & Team Access
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-slate-500" /> Quotation Rules
              </button>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => logout()}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
