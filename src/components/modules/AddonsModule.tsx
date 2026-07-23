import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Addon } from '../../lib/types';
import {
  Layers,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Tag,
  Monitor,
  CreditCard,
  Palette,
  Cpu,
  HelpCircle,
  ArrowUpDown,
} from 'lucide-react';

export const AddonsModule: React.FC = () => {
  const { addonsList, saveAddon, toggleAddonStatus, deleteAddon, chassisList } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Partial<Addon> | null>(null);

  const filteredAddons = addonsList.filter((addon) => {
    const matchesCategory = categoryFilter === 'all' || addon.category === categoryFilter;
    const matchesSearch =
      addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addon.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingAddon({
      name: '',
      description: '',
      category: 'hardware',
      price: 15000,
      is_tbd: false,
      sort_order: addonsList.length + 1,
      is_active: true,
      compatible_models: ['All'],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addon: Addon) => {
    setEditingAddon(addon);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddon && editingAddon.name) {
      saveAddon(editingAddon);
      setIsModalOpen(false);
      setEditingAddon(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hardware':
        return <Monitor className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'branding':
        return <Palette className="w-4 h-4 text-purple-600" />;
      case 'software':
        return <Cpu className="w-4 h-4 text-amber-600" />;
      default:
        return <Tag className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Module Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ff751a]">
            <Layers className="w-4 h-4" /> Configurator Upgrades
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add-ons & Upgrades Manager</h1>
          <p className="text-slate-500 text-xs">
            Manage optional hardware modules, payment gateways, custom branding wraps, and TBD pricing rules.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#ff751a] hover:bg-[#ea580c] text-white text-xs font-bold rounded-xl shadow-brand transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Add-on Upgrade
        </button>
      </div>

      {/* Category Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'hardware', 'payment', 'software', 'branding'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search add-ons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff751a]"
          />
        </div>
      </div>

      {/* Add-ons List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 w-12 text-center">Order</th>
                <th className="py-3.5 px-4">Add-on Name & Category</th>
                <th className="py-3.5 px-4">Pricing Model</th>
                <th className="py-3.5 px-4">Compatibility Rules</th>
                <th className="py-3.5 px-4">Active Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAddons.map((addon) => (
                <tr key={addon.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 text-center font-mono font-bold text-slate-400">
                    #{addon.sort_order}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                        {getCategoryIcon(addon.category)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{addon.name}</p>
                        <p className="text-xs text-slate-500 max-w-md mt-0.5 line-clamp-1">
                          {addon.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {addon.is_tbd ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                        <Tag className="w-3.5 h-3.5" /> TBD (Needs Quote)
                      </span>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Fixed Price
                        </span>
                        <p className="font-bold text-slate-900 text-sm">
                          ৳{addon.price.toLocaleString('en-BD')}
                        </p>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {addon.compatible_models.map((model, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200"
                        >
                          {model}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => toggleAddonStatus(addon.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        addon.is_active ? 'bg-[#ff751a]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          addon.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(addon)}
                        className="p-1.5 text-slate-500 hover:text-[#ff751a] hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAddon(addon.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Add / Edit Addon Modal */}
      {isModalOpen && editingAddon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-in">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#ff751a]" />
                {editingAddon.id ? 'Edit Add-on Upgrade' : 'Create New Add-on Upgrade'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Add-on Name</label>
                <input
                  type="text"
                  required
                  value={editingAddon.name || ''}
                  onChange={(e) => setEditingAddon({ ...editingAddon, name: e.target.value })}
                  placeholder="e.g. 21.5 Touchscreen Display"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingAddon.description || ''}
                  onChange={(e) => setEditingAddon({ ...editingAddon, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingAddon.category || 'hardware'}
                    onChange={(e) => setEditingAddon({ ...editingAddon, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none capitalize"
                  >
                    <option value="hardware">Hardware</option>
                    <option value="payment">Payment & POS</option>
                    <option value="software">Software / Telemetry</option>
                    <option value="branding">Branding & Wrap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={editingAddon.sort_order || 1}
                    onChange={(e) =>
                      setEditingAddon({ ...editingAddon, sort_order: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_tbd"
                    checked={!!editingAddon.is_tbd}
                    onChange={(e) =>
                      setEditingAddon({
                        ...editingAddon,
                        is_tbd: e.target.checked,
                        price: e.target.checked ? 0 : editingAddon.price || 10000,
                      })
                    }
                    className="w-4 h-4 text-[#ff751a] rounded focus:ring-[#ff751a]"
                  />
                  <label htmlFor="is_tbd" className="text-xs font-bold text-amber-800 cursor-pointer">
                    Price is TBD (To Be Determined per custom quote estimation)
                  </label>
                </div>

                {!editingAddon.is_tbd && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Fixed Price (BDT)</label>
                    <input
                      type="number"
                      value={editingAddon.price || 0}
                      onChange={(e) =>
                        setEditingAddon({ ...editingAddon, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#ff751a] focus:outline-none font-bold"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Compatible Machine Models
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAddon.compatible_models?.includes('All')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditingAddon({ ...editingAddon, compatible_models: ['All'] });
                        }
                      }}
                    />
                    <span>All Machine Models</span>
                  </label>
                  {chassisList.map((chassis) => {
                    const isChecked = editingAddon.compatible_models?.includes(chassis.title);
                    return (
                      <label key={chassis.id} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!isChecked && !editingAddon.compatible_models?.includes('All')}
                          onChange={(e) => {
                            let curr = editingAddon.compatible_models?.filter((m) => m !== 'All') || [];
                            if (e.target.checked) {
                              curr.push(chassis.title);
                            } else {
                              curr = curr.filter((m) => m !== chassis.title);
                            }
                            if (curr.length === 0) curr = ['All'];
                            setEditingAddon({ ...editingAddon, compatible_models: curr });
                          }}
                        />
                        <span>{chassis.title}</span>
                      </label>
                    );
                  })}
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
                  Save Add-on Upgrade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
