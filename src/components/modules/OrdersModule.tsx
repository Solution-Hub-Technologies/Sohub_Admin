import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, SelectedAddonItem } from '../../lib/types';
import {
  FileSpreadsheet,
  Search,
  Eye,
  Building2,
  Mail,
  Phone,
  MapPin,
  Box,
  Layers,
  Calculator,
  Percent,
  FileText,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';

export const OrdersModule: React.FC = () => {
  const {
    orders,
    globalSearch,
    setGlobalSearch,
    selectedOrder,
    setSelectedOrder,
    updateOrderStatus,
    saveAndResendQuotation,
    settings,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSendingLambda, setIsSendingLambda] = useState<boolean>(false);

  // Local state for Slide-over Re-estimation Drawer
  const [drawerAddons, setDrawerAddons] = useState<SelectedAddonItem[]>([]);
  const [drawerVatRate, setDrawerVatRate] = useState<number>(5);
  const [drawerMonthlyFee, setDrawerMonthlyFee] = useState<number>(5000);
  const [drawerNotes, setDrawerNotes] = useState<string>('');
  const [showBankNotesAccordion, setShowBankNotesAccordion] = useState<boolean>(false);

  // Stats calculation
  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'Confirmed').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'Confirmed')
    .reduce((sum, o) => sum + o.grand_total, 0);

  // Populate drawer whenever selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      setDrawerAddons(JSON.parse(JSON.stringify(selectedOrder.selected_addons)));
      setDrawerVatRate(selectedOrder.vat_rate || 5);
      setDrawerMonthlyFee(selectedOrder.monthly_recurring_fee || 5000);
      setDrawerNotes(selectedOrder.admin_notes || '');
    }
  }, [selectedOrder]);

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const query = globalSearch.toLowerCase();
    const matchesSearch =
      !query ||
      order.order_number.toLowerCase().includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      (order.customer_company && order.customer_company.toLowerCase().includes(query)) ||
      order.customer_email.toLowerCase().includes(query) ||
      order.chassis_title.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  // Calculate live calculations inside the drawer
  const chassisBasePrice = selectedOrder?.chassis_base_price || 0;
  const liveAddonsTotal = drawerAddons.reduce((sum, item) => sum + (Number(item.final_price) || 0), 0);
  const liveSubtotal = chassisBasePrice + liveAddonsTotal;
  const liveVatAmount = Math.round((liveSubtotal * (Number(drawerVatRate) || 0)) / 100);
  const liveGrandTotal = liveSubtotal + liveVatAmount;

  const handleAddonPriceChange = (index: number, newPrice: number) => {
    const updated = [...drawerAddons];
    updated[index].final_price = newPrice;
    setDrawerAddons(updated);
  };

  const handleSaveAndSend = async () => {
    if (!selectedOrder) return;
    setIsSendingLambda(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await saveAndResendQuotation(
        selectedOrder.id,
        drawerAddons,
        drawerVatRate,
        drawerMonthlyFee,
        drawerNotes
      );
    } finally {
      setIsSendingLambda(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Streamlined Ultra-Fast Top Stat Cards (No Heavy Charts) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 block">
              Pending Action Leads
            </span>
            <p className="text-3xl font-black text-slate-900">{pendingCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Requires customer follow-up</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 block">
              Confirmed Deals
            </span>
            <p className="text-3xl font-black text-slate-900">{confirmedCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Work orders finalized</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#ff751a] block">
              Confirmed Revenue (BDT)
            </span>
            <p className="text-2xl font-black text-slate-900">
              ৳{totalRevenue.toLocaleString('en-BD')}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">Total finalized contract value</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ff751a] flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Instant Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Leads', count: orders.length },
            { id: 'Pending', label: 'Pending Review', count: pendingCount },
            { id: 'Quotation Sent', label: 'Quotation Sent', count: orders.filter((o) => o.status === 'Quotation Sent').length },
            { id: 'Confirmed', label: 'Confirmed', count: confirmedCount },
            { id: 'Cancelled', label: 'Cancelled', count: orders.filter((o) => o.status === 'Cancelled').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, phone or company..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff751a]"
          />
        </div>
      </div>

      {/* Orders Interactive Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Order # & Date</th>
                <th className="py-3.5 px-4">Customer & Contact</th>
                <th className="py-3.5 px-4">Selected Machine</th>
                <th className="py-3.5 px-4">Add-ons</th>
                <th className="py-3.5 px-4">Grand Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No leads or quotation requests found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id ? 'bg-orange-50/40 border-l-4 border-[#ff751a]' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <p className="font-mono font-bold text-slate-900 text-sm">{order.order_number}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900">{order.customer_name}</p>
                      {order.customer_company && (
                        <p className="text-[#ff751a] font-semibold text-[11px]">{order.customer_company}</p>
                      )}
                      <p className="text-slate-500 text-[11px] font-mono">{order.customer_phone}</p>
                      <p className="text-slate-400 text-[10px] font-mono">{order.customer_email}</p>
                    </td>
                    <td className="py-4 px-4 text-slate-800 font-semibold">
                      {order.chassis_title}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-200 text-[11px]">
                        {order.selected_addons?.length || 0} items
                      </span>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">
                      ৳{order.grand_total.toLocaleString('en-BD')}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold inline-flex items-center gap-1.5 ${
                          order.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-300'
                            : order.status === 'Quotation Sent'
                            ? 'bg-blue-50 text-blue-700 border border-blue-300'
                            : order.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border border-rose-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-white hover:bg-[#ff751a] rounded-xl font-bold transition-all text-xs inline-flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Re-estimate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-OVER DRAWER MODAL: Order Detail & Interactive Re-estimation Editor */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in overflow-hidden border-l border-slate-200">
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#ff751a]">
                    {selectedOrder.order_number}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                    {selectedOrder.status}
                  </span>
                </div>
                <h2 className="text-base font-bold">Lead Details & Quotation Breakdown</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#ff751a]" /> Customer & Delivery Details
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400">Customer Name</p>
                    <p className="font-extrabold text-slate-900 text-sm">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Company Name</p>
                    <p className="font-bold text-slate-900">
                      {selectedOrder.customer_company || 'Individual Lead'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> Phone Number
                    </p>
                    <p className="font-mono text-slate-800 font-semibold">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" /> Email Address
                    </p>
                    <p className="font-mono text-slate-800 font-semibold">{selectedOrder.customer_email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-xs">
                  <p className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> Delivery Location
                  </p>
                  <p className="font-medium text-slate-800">{selectedOrder.delivery_location}</p>
                </div>
              </div>

              {/* Status Quick Changer Buttons */}
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
                <span className="text-xs font-bold text-slate-700">Update Lead Status:</span>
                <div className="flex items-center gap-1.5">
                  {(['Pending', 'Quotation Sent', 'Confirmed', 'Cancelled'] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateOrderStatus(selectedOrder.id, st)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        selectedOrder.status === st
                          ? 'bg-[#ff751a] text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Machine & Add-ons Pricing Editor */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-[#ff751a]" /> Selected Machine & Add-ons
                </h3>

                <div className="p-3 bg-orange-50/50 border border-orange-200/80 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">{selectedOrder.chassis_title}</span>
                  <span className="font-mono font-bold text-slate-900">
                    ৳{selectedOrder.chassis_base_price.toLocaleString('en-BD')}
                  </span>
                </div>

                <div className="space-y-2">
                  {drawerAddons.map((addonItem, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4 shadow-2xs"
                    >
                      <div className="flex-1">
                        <span className="font-bold text-slate-900 text-xs">{addonItem.addon_name}</span>
                        {addonItem.is_tbd && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-800 rounded">
                            TBD
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">৳</span>
                        <input
                          type="number"
                          value={addonItem.final_price}
                          onChange={(e) => handleAddonPriceChange(idx, parseFloat(e.target.value) || 0)}
                          className="w-28 px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#ff751a] focus:outline-none text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Box */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-lg">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#ff751a] flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" /> VAT & Grand Total Breakdown
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">VAT Rate (%)</label>
                    <input
                      type="number"
                      value={drawerVatRate}
                      onChange={(e) => setDrawerVatRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff751a]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Monthly IoT Fee (BDT)</label>
                    <input
                      type="number"
                      value={drawerMonthlyFee}
                      onChange={(e) => setDrawerMonthlyFee(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff751a]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono">৳{liveSubtotal.toLocaleString('en-BD')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>VAT ({drawerVatRate}%):</span>
                    <span className="font-mono">৳{liveVatAmount.toLocaleString('en-BD')}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-[#ff751a] pt-2 border-t border-slate-700">
                    <span>Grand Total:</span>
                    <span className="font-mono text-xl">৳{liveGrandTotal.toLocaleString('en-BD')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close Drawer
              </button>

              <button
                type="button"
                onClick={handleSaveAndSend}
                disabled={isSendingLambda}
                className="px-6 py-3 bg-[#ff751a] hover:bg-[#ea580c] text-white text-xs font-extrabold rounded-xl shadow-brand transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSendingLambda ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving & Resending PDF...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Save & Resend PDF Quotation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
