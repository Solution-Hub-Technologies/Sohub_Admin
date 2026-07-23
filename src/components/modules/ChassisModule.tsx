import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Chassis, ChassisType } from '../../lib/types';
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Snowflake,
  Box,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export const ChassisModule: React.FC = () => {
  const { chassisList, saveChassis, toggleChassisStatus, deleteChassis } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'imported' | 'local'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChassis, setEditingChassis] = useState<Partial<Chassis> | null>(null);

  // Filtered List
  const filteredList = chassisList.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specifications.capacity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingChassis({
      title: '',
      type: 'imported',
      base_price: 250000,
      chiller_support: true,
      is_active: true,
      specifications: {
        slots: 45,
        capacity: '400 Items',
        dimensions: '1900 x 950 x 800 mm',
        temperature_range: '4°C - 25°C',
        power_consumption: '300W',
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (chassis: Chassis) => {
    setEditingChassis(chassis);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChassis && editingChassis.title) {
      saveChassis(editingChassis);
      setIsModalOpen(false);
      setEditingChassis(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ff751a]">
            <Box className="w-4 h-4" /> Machine Models Catalog
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Machine Chassis Manager</h1>
          <p className="text-slate-500 text-xs">
            Manage base vending chassis specifications, cooling unit capabilities, and default BDT base prices.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-[#ff751a] hover:bg-[#ea580c] text-white text-xs font-bold rounded-xl shadow-brand transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Machine Variant
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Variants ({chassisList.length})
          </button>
          <button
            onClick={() => setFilterType('imported')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'imported'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Imported Chassis ({chassisList.filter((c) => c.type === 'imported').length})
          </button>
          <button
            onClick={() => setFilterType('local')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'local'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Local Build ({chassisList.filter((c) => c.type === 'local').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search chassis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff751a]"
          />
        </div>
      </div>

      {/* Chassis Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Variant Title & Build Type</th>
                <th className="py-3.5 px-4">Base Price (BDT)</th>
                <th className="py-3.5 px-4">Chiller Unit</th>
                <th className="py-3.5 px-4">Slots & Capacity</th>
                <th className="py-3.5 px-4">Dimensions & Power</th>
                <th className="py-3.5 px-4">Active Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredList.map((chassis) => (
                <tr key={chassis.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#ff751a] flex items-center justify-center font-bold text-sm shrink-0 border border-orange-100">
                        <Box className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{chassis.title}</p>
                        <span
                          className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            chassis.type === 'imported'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {chassis.type === 'imported' ? 'Imported Heavy Duty' : 'Local Build Assembly'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900 text-sm">
                    ৳{chassis.base_price.toLocaleString('en-BD')}
                  </td>
                  <td className="py-4 px-4">
                    {chassis.chiller_support ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                        <Snowflake className="w-3.5 h-3.5" /> Supported
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                        Not Supported
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-700">
                    <p className="font-semibold text-slate-900">{chassis.specifications.slots} Slots</p>
                    <p className="text-[11px] text-slate-500">{chassis.specifications.capacity}</p>
                  </td>
                  <td className="py-4 px-4 text-slate-600 text-[11px]">
                    <p>{chassis.specifications.dimensions}</p>
                    <p className="text-slate-400 font-mono">{chassis.specifications.power_consumption}</p>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleChassisStatus(chassis.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        chassis.is_active ? 'bg-[#ff751a]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          chassis.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(chassis)}
                        className="p-1.5 text-slate-500 hover:text-[#ff751a] hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit Specs & Price"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteChassis(chassis.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Chassis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal for Add/Edit Chassis */}
      {isModalOpen && editingChassis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-in">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Box className="w-5 h-5 text-[#ff751a]" />
                {editingChassis.id ? 'Edit Machine Chassis Variant' : 'Create New Machine Variant'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chassis Variant Title</label>
                <input
                  type="text"
                  required
                  value={editingChassis.title || ''}
                  onChange={(e) => setEditingChassis({ ...editingChassis, title: e.target.value })}
                  placeholder="e.g. SOHUB V-45 Premium Heavy Duty"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Build Type</label>
                  <select
                    value={editingChassis.type || 'imported'}
                    onChange={(e) => setEditingChassis({ ...editingChassis, type: e.target.value as ChassisType })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                  >
                    <option value="imported">Imported Heavy Duty</option>
                    <option value="local">Local Build Assembly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Base Price (BDT)</label>
                  <input
                    type="number"
                    required
                    value={editingChassis.base_price || 0}
                    onChange={(e) =>
                      setEditingChassis({ ...editingChassis, base_price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  id="chiller_support"
                  checked={!!editingChassis.chiller_support}
                  onChange={(e) => setEditingChassis({ ...editingChassis, chiller_support: e.target.checked })}
                  className="w-4 h-4 text-[#ff751a] rounded focus:ring-[#ff751a]"
                />
                <label htmlFor="chiller_support" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Includes Built-in Compressor / Chiller Support
                </label>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specifications</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Slots Count</label>
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
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Capacity Description</label>
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
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Dimensions (WxDxH)</label>
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
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600">Power Consumption</label>
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
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ff751a] hover:bg-[#ea580c] text-white text-xs font-bold rounded-xl shadow-brand"
                >
                  Save Machine Variant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
