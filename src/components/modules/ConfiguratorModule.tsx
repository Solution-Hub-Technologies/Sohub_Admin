import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Chassis, Addon, GlobalSettings } from '../../lib/types';
import {
  Sliders,
  Box,
  Layers,
  Landmark,
  Plus,
  Edit2,
  Trash2,
  Save,
  ToggleLeft,
  ToggleRight,
  Percent,
  CheckSquare,
  Square,
  Image as ImageIcon,
  FileText,
  Settings2,
  Upload,
  Link as LinkIcon,
  X,
} from 'lucide-react';

export const ConfiguratorModule: React.FC = () => {
  const {
    chassisList,
    saveChassis,
    toggleChassisStatus,
    deleteChassis,
    addonsList,
    saveAddon,
    toggleAddonStatus,
    deleteAddon,
    settings,
    updateSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'machines' | 'addons' | 'settings'>('machines');

  // Modal State for Chassis
  const [isChassisModalOpen, setIsChassisModalOpen] = useState<boolean>(false);
  const [editingChassis, setEditingChassis] = useState<Partial<Chassis>>({});
  const [imageInputMode, setImageInputMode] = useState<'file' | 'url'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State for Addon
  const [isAddonModalOpen, setIsAddonModalOpen] = useState<boolean>(false);
  const [editingAddon, setEditingAddon] = useState<Partial<Addon>>({});

  // Local state for Global Settings form
  const [settingsForm, setSettingsForm] = useState<GlobalSettings>(settings);

  // --- Chassis Modal Open Helper ---
  const handleOpenChassisModal = (chassis?: Chassis) => {
    if (chassis) {
      setEditingChassis({
        ...chassis,
        allowed_addons: chassis.allowed_addons || addonsList.map((a) => a.id),
      });
      setImageInputMode(chassis.image_url?.startsWith('data:') ? 'file' : 'url');
    } else {
      setEditingChassis({
        title: '',
        type: 'imported',
        base_price: 340000,
        short_description: 'Premium imported Chassis with SOHUB telemetry integration & chiller unit support.',
        image_url: '',
        chiller_support: true,
        is_active: true,
        allowed_addons: addonsList.map((a) => a.id),
        specifications: {
          slots: 48,
          capacity: '400 Items',
          dimensions: '1920 x 1180 x 850 mm',
          temperature_range: '4°C - 25°C',
          power_consumption: '350W',
          display_type: '21.5" HD Touchscreen',
        },
      });
      setImageInputMode('file');
    }
    setIsChassisModalOpen(true);
  };

  const handleSaveChassisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveChassis(editingChassis);
    setIsChassisModalOpen(false);
  };

  // Local PC Image File Selection Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingChassis((prev) => ({
          ...prev,
          image_url: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddonCheckboxToggle = (addonId: string) => {
    const current = editingChassis.allowed_addons || [];
    const exists = current.includes(addonId);
    if (exists) {
      setEditingChassis({
        ...editingChassis,
        allowed_addons: current.filter((id) => id !== addonId),
      });
    } else {
      setEditingChassis({
        ...editingChassis,
        allowed_addons: [...current, addonId],
      });
    }
  };

  // --- Addon Modal Handlers ---
  const handleOpenAddonModal = (addon?: Addon) => {
    if (addon) {
      setEditingAddon(addon);
    } else {
      setEditingAddon({
        name: '',
        description: '',
        category: 'hardware',
        price: 15000,
        is_tbd: false,
        sort_order: addonsList.length + 1,
        compatible_models: ['All'],
      });
    }
    setIsAddonModalOpen(true);
  };

  const handleSaveAddonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAddon(editingAddon);
    setIsAddonModalOpen(false);
  };

  // --- Settings Save ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ff751a]">
            <Sliders className="w-4 h-4" /> Machine & Pricing Master Console
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Configurator & Pricing Manager
          </h1>
          <p className="text-slate-500 text-xs">
            Manage machine models, local image upload from PC, allowed add-ons, specifications, and website visibility.
          </p>
        </div>

        {/* Action Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('machines')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'machines'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-[#ff751a]" /> Machines ({chassisList.length})
          </button>

          <button
            onClick={() => setActiveTab('addons')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'addons'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#ff751a]" /> Add-ons ({addonsList.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Landmark className="w-3.5 h-3.5 text-[#ff751a]" /> Bank & Rules
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MACHINE MODELS & BASE PRICES */}
      {/* ========================================================================= */}
      {activeTab === 'machines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Vending Machine Models & Base Pricing
            </h2>
            <button
              onClick={() => handleOpenChassisModal()}
              className="px-4 py-2 bg-[#ff751a] hover:bg-[#ea580c] text-white text-xs font-extrabold rounded-xl shadow-brand transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Machine Variant
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {chassisList.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200">
                <Box className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">No machine models created yet.</p>
                <p className="text-xs text-slate-400 mb-4">Click below to upload images and create your first machine variant.</p>
                <button
                  onClick={() => handleOpenChassisModal()}
                  className="px-4 py-2 bg-[#ff751a] text-white text-xs font-bold rounded-xl"
                >
                  Create Machine Variant
                </button>
              </div>
            ) : (
              chassisList.map((chassis) => (
                <div
                  key={chassis.id}
                  className={`bg-white rounded-2xl border transition-all p-5 space-y-4 shadow-subtle ${
                    chassis.is_active ? 'border-slate-200/80 hover:border-slate-300' : 'border-slate-200 opacity-60 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {chassis.image_url ? (
                        <img
                          src={chassis.image_url}
                          alt={chassis.title}
                          className="w-14 h-14 object-cover rounded-xl border border-slate-200 bg-slate-50 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-orange-50 text-[#ff751a] flex items-center justify-center font-bold shrink-0 border border-orange-100">
                          <Box className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            chassis.type === 'imported'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {chassis.type === 'imported' ? 'Imported' : 'Local Build'}
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">{chassis.title}</h3>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleChassisStatus(chassis.id)}
                      title="Active on Website Switch"
                    >
                      {chassis.is_active ? (
                        <ToggleRight className="w-6 h-6 text-[#ff751a]" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {chassis.short_description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {chassis.short_description}
                    </p>
                  )}

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Base Price:</span>
                    <span className="text-lg font-black text-slate-900">
                      ৳{chassis.base_price.toLocaleString('en-BD')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
                    <div className="bg-slate-100/60 p-2 rounded-lg">
                      <span className="block text-slate-400">Capacity</span>
                      <span className="font-bold text-slate-800">{chassis.specifications?.capacity || '300 Items'}</span>
                    </div>
                    <div className="bg-slate-100/60 p-2 rounded-lg">
                      <span className="block text-slate-400">Slots</span>
                      <span className="font-bold text-slate-800">{chassis.specifications?.slots || 40} Selection</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenChassisModal(chassis)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" /> Edit Model & Specs
                    </button>
                    <button
                      onClick={() => deleteChassis(chassis.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ADD-ONS */}
      {activeTab === 'addons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Add-ons & Hardware Upgrades Master List
            </h2>
            <button
              onClick={() => handleOpenAddonModal()}
              className="px-4 py-2 bg-[#ff751a] hover:bg-[#ea580c] text-white text-xs font-extrabold rounded-xl shadow-brand transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Upgrade
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Add-on Name & Description</th>
                  <th className="py-3.5 px-4">Price Model</th>
                  <th className="py-3.5 px-4">Price (BDT)</th>
                  <th className="py-3.5 px-4">Live Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {addonsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      No add-ons created yet.
                    </td>
                  </tr>
                ) : (
                  addonsList.map((addon) => (
                    <tr key={addon.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-extrabold text-slate-900">{addon.name}</p>
                        <p className="text-[11px] text-slate-400">{addon.description}</p>
                      </td>
                      <td className="py-4 px-4">
                        {addon.is_tbd ? (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-800 rounded">
                            TBD (Custom Quote)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded">
                            Fixed Rate
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                        {addon.is_tbd ? 'TBD' : `৳${addon.price.toLocaleString('en-BD')}`}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleAddonStatus(addon.id)}
                          className="flex items-center gap-1.5"
                        >
                          {addon.is_active ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-[#ff751a]" />
                              <span className="text-[11px] font-bold text-emerald-600">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-slate-300" />
                              <span className="text-[11px] font-bold text-slate-400">Disabled</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenAddonModal(addon)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAddon(addon.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BANK & RULES */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Landmark className="w-4 h-4 text-[#ff751a]" /> Official SOHUB Bank Account Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.bank_details.bank_name}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        bank_details: { ...settingsForm.bank_details, bank_name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Name</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.bank_details.account_name}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        bank_details: { ...settingsForm.bank_details, account_name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.bank_details.account_number}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        bank_details: { ...settingsForm.bank_details, account_number: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Branch Name</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.bank_details.branch}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        bank_details: { ...settingsForm.bank_details, branch: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Percent className="w-4 h-4 text-[#ff751a]" /> Default Financial Rules
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Default VAT Rate (%)</label>
                  <input
                    type="number"
                    value={settingsForm.default_vat_rate}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        default_vat_rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Monthly Platform IoT Fee (BDT)</label>
                  <input
                    type="number"
                    value={settingsForm.default_monthly_fee}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        default_monthly_fee: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 bg-[#ff751a] hover:bg-[#ea580c] text-white text-xs font-extrabold rounded-xl shadow-brand transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Bank & Calculation Rules
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* RICH MODAL: CREATE / EDIT MACHINE VARIANT (Includes Local PC Image Upload) */}
      {/* ========================================================================= */}
      {isChassisModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-scale-up border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-[#ff751a]" />
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingChassis.id ? 'Edit Machine Model' : 'Create Machine Variant'}
                </h3>
              </div>
              <button
                onClick={() => setIsChassisModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveChassisSubmit} className="space-y-4 text-xs">
              {/* Row 1: Title & Build Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">
                    1. Machine Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingChassis.title || ''}
                    onChange={(e) => setEditingChassis({ ...editingChassis, title: e.target.value })}
                    placeholder="e.g. SOHUB V-45 Premium Heavy Duty"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    2. Build Type *
                  </label>
                  <select
                    value={editingChassis.type || 'imported'}
                    onChange={(e) =>
                      setEditingChassis({ ...editingChassis, type: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none font-bold"
                  >
                    <option value="imported">Imported Chassis</option>
                    <option value="local">Local Build</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Base Price & Local PC Image Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    3. Base Price (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editingChassis.base_price || 0}
                    onChange={(e) =>
                      setEditingChassis({
                        ...editingChassis,
                        base_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                  />
                </div>

                {/* Local PC Image Upload Field */}
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-[#ff751a]" /> 5. Machine Image (Local PC / URL)
                    </label>
                    <div className="flex gap-1 text-[10px] font-bold bg-slate-100 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setImageInputMode('file')}
                        className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          imageInputMode === 'file'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500'
                        }`}
                      >
                        <Upload className="w-3 h-3" /> Upload PC File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageInputMode('url')}
                        className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          imageInputMode === 'url'
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500'
                        }`}
                      >
                        <LinkIcon className="w-3 h-3" /> Image URL
                      </button>
                    </div>
                  </div>

                  {imageInputMode === 'file' ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2 px-3 border-2 border-dashed border-slate-300 hover:border-[#ff751a] bg-slate-50 hover:bg-orange-50/40 rounded-xl flex items-center justify-center gap-2 text-slate-600 hover:text-[#ff751a] font-bold transition-all"
                      >
                        <Upload className="w-4 h-4 text-[#ff751a]" /> Choose Image from PC
                      </button>

                      {editingChassis.image_url && (
                        <div className="relative group shrink-0">
                          <img
                            src={editingChassis.image_url}
                            alt="Preview"
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingChassis({ ...editingChassis, image_url: '' })}
                            className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 shadow-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={editingChassis.image_url || ''}
                      onChange={(e) =>
                        setEditingChassis({ ...editingChassis, image_url: e.target.value })
                      }
                      placeholder="https://machines.sohub.com.bd/assets/vending-v45.png"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none font-mono"
                    />
                  )}
                </div>
              </div>

              {/* Row 3: Short Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> 4. Short Description (Caption on website)
                </label>
                <textarea
                  rows={2}
                  value={editingChassis.short_description || ''}
                  onChange={(e) =>
                    setEditingChassis({ ...editingChassis, short_description: e.target.value })
                  }
                  placeholder="e.g. Premium imported heavy-duty chassis with dual-pane tempered glass and chilled temperature control."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                />
              </div>

              {/* Row 4: Key Specifications Grid */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Settings2 className="w-3.5 h-3.5 text-[#ff751a]" /> 6. Key Specifications (Viewed by customer)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Capacity</label>
                    <input
                      type="text"
                      value={editingChassis.specifications?.capacity || ''}
                      onChange={(e) =>
                        setEditingChassis({
                          ...editingChassis,
                          specifications: {
                            ...editingChassis.specifications!,
                            capacity: e.target.value,
                          },
                        })
                      }
                      placeholder="400 Items"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Selection Slots</label>
                    <input
                      type="number"
                      value={editingChassis.specifications?.slots || 40}
                      onChange={(e) =>
                        setEditingChassis({
                          ...editingChassis,
                          specifications: {
                            ...editingChassis.specifications!,
                            slots: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="48"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Dimensions</label>
                    <input
                      type="text"
                      value={editingChassis.specifications?.dimensions || ''}
                      onChange={(e) =>
                        setEditingChassis({
                          ...editingChassis,
                          specifications: {
                            ...editingChassis.specifications!,
                            dimensions: e.target.value,
                          },
                        })
                      }
                      placeholder="1920 x 1180 x 850 mm"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Power Consumption</label>
                    <input
                      type="text"
                      value={editingChassis.specifications?.power_consumption || ''}
                      onChange={(e) =>
                        setEditingChassis({
                          ...editingChassis,
                          specifications: {
                            ...editingChassis.specifications!,
                            power_consumption: e.target.value,
                          },
                        })
                      }
                      placeholder="350W"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Temp Range</label>
                    <input
                      type="text"
                      value={editingChassis.specifications?.temperature_range || ''}
                      onChange={(e) =>
                        setEditingChassis({
                          ...editingChassis,
                          specifications: {
                            ...editingChassis.specifications!,
                            temperature_range: e.target.value,
                          },
                        })
                      }
                      placeholder="4°C - 25°C"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Display Screen</label>
                    <input
                      type="text"
                      value={editingChassis.specifications?.display_type || ''}
                      onChange={(e) =>
                        setEditingChassis({
                          ...editingChassis,
                          specifications: {
                            ...editingChassis.specifications!,
                            display_type: e.target.value,
                          },
                        })
                      }
                      placeholder='21.5" HD Touchscreen'
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Allowed Add-ons Checklist */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">
                  7. Allowed Add-ons Checklist (Select upgrades compatible with this model)
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
                  {addonsList.length === 0 ? (
                    <p className="text-[11px] text-slate-400 col-span-2">
                      No add-ons created yet in master list.
                    </p>
                  ) : (
                    addonsList.map((addon) => {
                      const isChecked = (editingChassis.allowed_addons || []).includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => handleAddonCheckboxToggle(addon.id)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${
                            isChecked
                              ? 'bg-orange-50 border border-orange-200 text-slate-900 font-bold'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#ff751a] shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span className="truncate">{addon.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Row 6: Status Toggle & Chiller Option */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="modal_chiller_support"
                    checked={editingChassis.chiller_support ?? true}
                    onChange={(e) =>
                      setEditingChassis({ ...editingChassis, chiller_support: e.target.checked })
                    }
                    className="rounded text-[#ff751a] focus:ring-[#ff751a]"
                  />
                  <label htmlFor="modal_chiller_support" className="font-bold text-slate-700">
                    Chiller Unit Supported
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingChassis({ ...editingChassis, is_active: !editingChassis.is_active })
                    }
                    className="flex items-center gap-1.5 font-bold"
                  >
                    {editingChassis.is_active ?? true ? (
                      <>
                        <ToggleRight className="w-6 h-6 text-[#ff751a]" />
                        <span className="text-emerald-600">8. Active on Website</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-6 h-6 text-slate-300" />
                        <span className="text-slate-400">8. Hidden (Disabled)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChassisModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#ff751a] hover:bg-[#ea580c] text-white font-extrabold rounded-xl shadow-brand"
                >
                  Save Machine Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD-ON EDIT / CREATE */}
      {isAddonModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              {editingAddon.id ? 'Edit Add-on Upgrade' : 'Create Add-on Upgrade'}
            </h3>

            <form onSubmit={handleSaveAddonSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Upgrade Name</label>
                <input
                  type="text"
                  required
                  value={editingAddon.name || ''}
                  onChange={(e) => setEditingAddon({ ...editingAddon, name: e.target.value })}
                  placeholder="e.g. Nayax POS Card Terminal"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <input
                  type="text"
                  value={editingAddon.description || ''}
                  onChange={(e) => setEditingAddon({ ...editingAddon, description: e.target.value })}
                  placeholder="e.g. Contactless credit/debit card payment reader"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Price Model</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="is_tbd"
                      checked={editingAddon.is_tbd || false}
                      onChange={(e) =>
                        setEditingAddon({ ...editingAddon, is_tbd: e.target.checked })
                      }
                      className="rounded text-[#ff751a] focus:ring-[#ff751a]"
                    />
                    <label htmlFor="is_tbd" className="font-bold text-slate-700">
                      TBD (Custom Quote)
                    </label>
                  </div>
                </div>

                {!editingAddon.is_tbd && (
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Fixed Price (BDT)</label>
                    <input
                      type="number"
                      value={editingAddon.price || 0}
                      onChange={(e) =>
                        setEditingAddon({
                          ...editingAddon,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddonModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ff751a] hover:bg-[#ea580c] text-white font-extrabold rounded-xl shadow-brand"
                >
                  Save Upgrade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
