import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GlobalSettings } from '../../lib/types';
import {
  Settings,
  Building,
  Landmark,
  FileCheck,
  Save,
  Plus,
  Trash2,
  Percent,
  DollarSign,
  ShieldCheck,
  Cpu,
  Database,
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { settings, updateSettings, isSupabaseLive } = useApp();
  const [formData, setFormData] = useState<GlobalSettings>(settings);
  const [newTermInput, setNewTermInput] = useState<string>('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleAddTerm = () => {
    if (newTermInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        terms_and_conditions: [...prev.terms_and_conditions, newTermInput.trim()],
      }));
      setNewTermInput('');
    }
  };

  const handleRemoveTerm = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      terms_and_conditions: prev.terms_and_conditions.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ff751a]">
            <Settings className="w-4 h-4" /> Global Business Rules & PDF Templates
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quotation Settings & Rules</h1>
          <p className="text-slate-500 text-xs">
            Configure default VAT tax rates, backend platform recurring fees, bank details for wire transfers, and PDF legal notes.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-[#ff751a] hover:bg-[#ea580c] text-white text-xs font-extrabold rounded-xl shadow-brand transition-all flex items-center gap-2 shrink-0"
        >
          <Save className="w-4 h-4" /> Save All Global Settings
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Business Rules & Bank Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Default Business Rules */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Percent className="w-4 h-4 text-[#ff751a]" /> Default Financial Calculations
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default VAT Rate (%)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={formData.default_vat_rate}
                  onChange={(e) =>
                    setFormData({ ...formData, default_vat_rate: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Monthly Recurring Fee (BDT)
                </label>
                <input
                  type="number"
                  required
                  value={formData.default_monthly_fee}
                  onChange={(e) =>
                    setFormData({ ...formData, default_monthly_fee: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Work Order Payment Terms
              </label>
              <input
                type="text"
                required
                value={formData.default_payment_terms}
                onChange={(e) => setFormData({ ...formData, default_payment_terms: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
              />
            </div>
          </div>

          {/* Card 2: Bank Details Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Landmark className="w-4 h-4 text-[#ff751a]" /> Official SOHUB Bank Account Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={formData.bank_details.bank_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bank_details: { ...formData.bank_details, bank_name: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  value={formData.bank_details.account_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bank_details: { ...formData.bank_details, account_name: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  value={formData.bank_details.account_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bank_details: { ...formData.bank_details, account_number: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Branch Location</label>
                <input
                  type="text"
                  required
                  value={formData.bank_details.branch}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bank_details: { ...formData.bank_details, branch: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Routing Number</label>
                <input
                  type="text"
                  required
                  value={formData.bank_details.routing_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bank_details: { ...formData.bank_details, routing_number: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Terms & Conditions Manager + DB Info */}
        <div className="space-y-6">
          {/* Card 3: Terms & Conditions Manager */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileCheck className="w-4 h-4 text-[#ff751a]" /> Quotation Terms & Conditions ({formData.terms_and_conditions.length})
            </h2>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {formData.terms_and_conditions.map((term, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <span className="font-bold text-[#ff751a] shrink-0 mt-0.5">{idx + 1}.</span>
                  <span className="flex-1 text-slate-700 font-medium">{term}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTerm(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Add new quotation note..."
                value={newTermInput}
                onChange={(e) => setNewTermInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTerm();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTerm}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>

          {/* Database & Lambda Status Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#ff751a]" /> Supabase DB Config
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                Active Schema
              </span>
            </div>
            <p className="font-mono text-xs text-slate-300">Target Schema: sohub_admin</p>
            <div className="text-[11px] text-slate-400 space-y-1 font-mono pt-2 border-t border-slate-800">
              <p>• sohub_admin.orders</p>
              <p>• sohub_admin.chassis</p>
              <p>• sohub_admin.addons</p>
              <p>• sohub_admin.quotation_settings</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
