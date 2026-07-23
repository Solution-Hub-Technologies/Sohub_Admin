import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  Box,
  ChevronRight,
  Sparkles,
  DollarSign,
  ArrowUpRight,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export const DashboardModule: React.FC = () => {
  const { orders, chassisList, addonsList, setActiveTab, setSelectedOrder } = useApp();

  // Metrics Calculations
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const confirmedOrders = orders.filter((o) => o.status === 'Confirmed');
  const confirmedTotalValue = confirmedOrders.reduce((sum, o) => sum + o.grand_total, 0);
  const activeVariants = chassisList.filter((c) => c.is_active).length;

  // Chart Data Preparation
  const statusCounts = {
    Pending: orders.filter((o) => o.status === 'Pending').length,
    'Quotation Sent': orders.filter((o) => o.status === 'Quotation Sent').length,
    Confirmed: orders.filter((o) => o.status === 'Confirmed').length,
    Cancelled: orders.filter((o) => o.status === 'Cancelled').length,
  };

  const pieData = [
    { name: 'Pending Review', value: statusCounts['Pending'], color: '#f59e0b' },
    { name: 'Quotation Sent', value: statusCounts['Quotation Sent'], color: '#3b82f6' },
    { name: 'Confirmed Order', value: statusCounts['Confirmed'], color: '#10b981' },
    { name: 'Cancelled', value: statusCounts['Cancelled'], color: '#f43f5e' },
  ];

  const chassisRevenueData = chassisList.map((chassis) => {
    const totalForChassis = orders
      .filter((o) => o.chassis_id === chassis.id && o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.grand_total, 0);
    return {
      name: chassis.title.replace('SOHUB ', ''),
      revenue: Math.round(totalForChassis / 1000), // in Thousands BDT
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl text-white border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#ff751a]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#ff751a]">
            <Sparkles className="w-4 h-4" /> Configurator Analytics & Command Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SOHUB Vending Configurator Admin</h1>
          <p className="text-slate-400 text-sm">
            Live overview of customer leads, custom quotations, machine chassis inventory, and add-on pricing.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2.5 bg-[#ff751a] hover:bg-[#ea580c] text-white text-xs font-bold rounded-xl shadow-brand transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Manage Quotations
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Quotations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Quotations</span>
            <div className="p-2.5 bg-orange-50 text-[#ff751a] rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalOrders}</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% this month
            </div>
          </div>
        </div>

        {/* Card 2: Pending Admin Review */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Review</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{pendingOrders}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Needs estimation for TBD add-ons</p>
          </div>
        </div>

        {/* Card 3: Confirmed Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirmed Orders Value</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ৳{confirmedTotalValue.toLocaleString('en-BD')}
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {confirmedOrders.length} Confirmed Deals
            </p>
          </div>
        </div>

        {/* Card 4: Active Machine Variants */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Chassis</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{activeVariants}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">{chassisList.length} total machine configurations</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Quotation Status Breakdown</h3>
            <p className="text-xs text-slate-500">Distribution of customer leads by stage</p>
          </div>

          <div className="h-60 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} Orders`, 'Count']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-2 border-t border-slate-100">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="ml-auto text-slate-900 font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chassis Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Est. Revenue by Machine Chassis (in '000 BDT)</h3>
            <p className="text-xs text-slate-500">Popularity and quote values per machine model</p>
          </div>

          <div className="h-64 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chassisRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: number) => [`৳${val.toLocaleString()}k BDT`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#ff751a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-slate-400 font-medium text-right">
            Updated in real-time from <span className="font-mono text-slate-700 font-semibold">sohub_admin.orders</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Customer Quotations</h3>
            <p className="text-xs text-slate-500">Latest incoming requests from vending configurator</p>
          </div>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-xs font-bold text-[#ff751a] hover:text-[#ea580c] flex items-center gap-1 hover:underline"
          >
            View All ({orders.length}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer / Company</th>
                <th className="py-3 px-4">Selected Machine</th>
                <th className="py-3 px-4">Add-ons</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {order.order_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{order.customer_company}</p>
                    <p className="text-[11px] text-slate-500">{order.customer_name}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {order.chassis_title}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {order.selected_addons.length} items
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ৳{order.grand_total.toLocaleString('en-BD')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                        order.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : order.status === 'Quotation Sent'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : order.status === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setActiveTab('orders');
                      }}
                      className="px-3 py-1.5 bg-[#ff751a]/10 text-[#ff751a] hover:bg-[#ff751a] hover:text-white rounded-lg font-bold transition-all text-xs inline-flex items-center gap-1"
                    >
                      Review <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
