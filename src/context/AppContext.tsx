import React, { createContext, useContext, useState, useEffect } from 'react';
import { Chassis, Addon, Order, GlobalSettings, OrderStatus } from '../lib/types';
import { INITIAL_SETTINGS, INITIAL_ADDONS, INITIAL_CHASSIS } from '../lib/mockData';
import { supabase, clearAllSupabaseTables } from '../lib/supabase';

export type NavTab = 'orders' | 'configurator';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  orders: Order[];
  chassisList: Chassis[];
  addonsList: Addon[];
  settings: GlobalSettings;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  
  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Supabase sync status
  isSupabaseLive: boolean;
  isSyncing: boolean;
  refreshFromSupabase: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Order Handlers
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  saveAndResendQuotation: (
    orderId: string,
    updatedAddons: Order['selected_addons'],
    vatRate: number,
    monthlyFee: number,
    adminNotes?: string,
    customTerms?: string
  ) => Promise<boolean>;

  // Chassis Handlers
  saveChassis: (chassis: Partial<Chassis>) => Promise<void>;
  toggleChassisStatus: (id: string) => Promise<void>;
  deleteChassis: (id: string) => Promise<void>;

  // Addon Handlers
  saveAddon: (addon: Partial<Addon>) => Promise<void>;
  toggleAddonStatus: (id: string) => Promise<void>;
  deleteAddon: (id: string) => Promise<void>;

  // Settings Handlers
  updateSettings: (newSettings: Partial<GlobalSettings>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('orders');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Initial state strictly from database or initial master data
  const [chassisList, setChassisList] = useState<Chassis[]>(INITIAL_CHASSIS);
  const [addonsList, setAddonsList] = useState<Addon[]>(INITIAL_ADDONS);
  const [orders, setOrders] = useState<Order[]>([]);

  const [settings, setSettings] = useState<GlobalSettings>(() => {
    const saved = localStorage.getItem('sohub_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('sohub_settings', JSON.stringify(settings));
  }, [settings]);

  // Toast Helpers
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load from Supabase
  useEffect(() => {
    fetchFromSupabase();
  }, []);

  const clearAllData = async () => {
    setIsSyncing(true);
    try {
      await clearAllSupabaseTables();
      setChassisList([]);
      setAddonsList([]);
      setOrders([]);
      setSelectedOrder(null);
      showToast('All data cleared permanently!', 'info');
    } catch (err) {
      console.error('Error clearing data:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchFromSupabase = async () => {
    setIsSyncing(true);
    try {
      // Fetch Orders
      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbOrders) {
        setOrders(dbOrders as Order[]);
      }

      // Fetch Chassis
      const { data: dbChassis } = await supabase
        .from('chassis')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbChassis && dbChassis.length > 0) {
        setChassisList(dbChassis as Chassis[]);
      }

      // Fetch Addons
      const { data: dbAddons } = await supabase
        .from('addons')
        .select('*')
        .order('sort_order', { ascending: true });

      if (dbAddons && dbAddons.length > 0) {
        setAddonsList(dbAddons as Addon[]);
      } else {
        // Seed default 10 master add-ons if database table is empty
        setAddonsList(INITIAL_ADDONS);
        try {
          await supabase.from('addons').insert(
            INITIAL_ADDONS.map(({ id, ...rest }) => ({
              ...rest,
            }))
          );
        } catch (e) {
          console.warn('Initial addons seeding note:', e);
        }
      }

      setIsSupabaseLive(true);
    } catch (err) {
      console.error('Fetch error from Supabase:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- ORDER HANDLERS ---
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: newStatus, updated_at: new Date().toISOString() }
          : ord
      )
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    showToast(`Order status updated to ${newStatus}`, 'info');

    try {
      await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);
    } catch (err) {
      console.error('Supabase status update error:', err);
    }
  };

  const saveAndResendQuotation = async (
    orderId: string,
    updatedAddons: Order['selected_addons'],
    vatRate: number,
    monthlyFee: number,
    adminNotes?: string,
    customTerms?: string
  ): Promise<boolean> => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return false;

    const addonsTotal = updatedAddons.reduce((acc, curr) => acc + curr.final_price, 0);
    const subtotal = targetOrder.chassis_base_price + addonsTotal;
    const vatAmount = Math.round((subtotal * vatRate) / 100);
    const grandTotal = subtotal + vatAmount;

    const updatedOrder: Order = {
      ...targetOrder,
      selected_addons: updatedAddons,
      subtotal,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      monthly_recurring_fee: monthlyFee,
      grand_total: grandTotal,
      status: 'Quotation Sent',
      updated_at: new Date().toISOString(),
      admin_notes: adminNotes !== undefined ? adminNotes : targetOrder.admin_notes,
      custom_terms: customTerms || targetOrder.custom_terms,
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    setSelectedOrder(updatedOrder);

    showToast(
      `Quotation #${targetOrder.order_number} saved & email sent to ${targetOrder.customer_email}!`,
      'success'
    );

    try {
      await supabase.from('orders').upsert({
        id: targetOrder.id,
        order_number: targetOrder.order_number,
        customer_name: targetOrder.customer_name,
        customer_email: targetOrder.customer_email,
        customer_phone: targetOrder.customer_phone,
        customer_company: targetOrder.customer_company,
        delivery_location: targetOrder.delivery_location,
        chassis_title: targetOrder.chassis_title,
        chassis_base_price: targetOrder.chassis_base_price,
        selected_addons: updatedAddons,
        subtotal,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        monthly_recurring_fee: monthlyFee,
        grand_total: grandTotal,
        status: 'Quotation Sent',
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Supabase quotation upsert error:', err);
    }

    return true;
  };

  // --- CHASSIS HANDLERS ---
  const saveChassis = async (chassisData: Partial<Chassis>) => {
    const payload = {
      title: chassisData.title || 'New Chassis Variant',
      type: chassisData.type || 'imported',
      base_price: chassisData.base_price || 340000,
      short_description: chassisData.short_description || '',
      image_url: chassisData.image_url || '',
      chiller_support: !!chassisData.chiller_support,
      is_active: chassisData.is_active ?? true,
      allowed_addons: chassisData.allowed_addons || [],
      specifications: chassisData.specifications || {
        slots: 48,
        capacity: '400 Items',
        dimensions: '1920 x 1180 x 850 mm',
        temperature_range: '4°C - 25°C',
        power_consumption: '350W',
        display_type: '21.5" HD Touchscreen',
      },
    };

    if (chassisData.id) {
      setChassisList((prev) =>
        prev.map((c) => (c.id === chassisData.id ? ({ ...c, ...payload } as Chassis) : c))
      );
      showToast(`Machine Model "${payload.title}" updated`);
      try {
        const res = await supabase
          .from('chassis')
          .update(payload)
          .eq('id', chassisData.id);
        if (res?.error) {
          console.error('Supabase update error:', res.error.message);
          showToast(`Supabase error: ${res.error.message}`, 'error');
        }
      } catch (e: any) {
        console.error('Chassis save error:', e);
        showToast(`Save Error: ${e.message || e}`, 'error');
      }
    } else {
      const tempId = Math.random().toString(36).substring(2, 9);
      const tempChassis = { id: tempId, ...payload, created_at: new Date().toISOString() } as Chassis;
      setChassisList((prev) => [tempChassis, ...prev]);

      showToast(`New Machine Model "${payload.title}" created`);
      try {
        const res = await supabase.from('chassis').insert([payload]).select();
        if (res?.error) {
          console.error('Supabase insert error details:', res.error.message);
          showToast(`Supabase Error: ${res.error.message}`, 'error');
        } else if (res?.data && res.data[0]) {
          setChassisList((prev) => prev.map((c) => (c.id === tempId ? (res.data[0] as Chassis) : c)));
        }
      } catch (e: any) {
        console.error('Chassis insert exception:', e);
        showToast(`Save Error: ${e.message || e}`, 'error');
      }
    }
  };

  const toggleChassisStatus = async (id: string) => {
    const target = chassisList.find((c) => c.id === id);
    if (!target) return;
    const newStatus = !target.is_active;

    setChassisList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: newStatus } : c))
    );
    showToast(`Machine variant ${newStatus ? 'enabled' : 'disabled'}`);

    try {
      await supabase.from('chassis').update({ is_active: newStatus }).eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteChassis = async (id: string) => {
    setChassisList((prev) => prev.filter((c) => c.id !== id));
    showToast('Machine model deleted', 'info');
    try {
      await supabase.from('chassis').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  // --- ADDON HANDLERS ---
  const saveAddon = async (addonData: Partial<Addon>) => {
    const payload = {
      name: addonData.name || 'New Add-on Upgrade',
      description: addonData.description || 'Configurable upgrade option',
      category: addonData.category || 'hardware',
      price: addonData.price || 0,
      is_tbd: !!addonData.is_tbd,
      sort_order: addonData.sort_order || addonsList.length + 1,
      is_active: addonData.is_active ?? true,
      compatible_models: addonData.compatible_models || ['All'],
    };

    if (addonData.id) {
      setAddonsList((prev) =>
        prev.map((a) => (a.id === addonData.id ? ({ ...a, ...payload } as Addon) : a))
      );
      showToast(`Add-on "${payload.name}" updated`);
      try {
        const res = await supabase
          .from('addons')
          .update(payload)
          .eq('id', addonData.id);
        if (res?.error) {
          showToast(`Supabase error: ${res.error.message}`, 'error');
        }
      } catch (e: any) {
        console.error(e);
        showToast(`Save Error: ${e.message || e}`, 'error');
      }
    } else {
      const tempId = Math.random().toString(36).substring(2, 9);
      const tempAddon = { id: tempId, ...payload } as Addon;
      setAddonsList((prev) => [...prev, tempAddon]);

      showToast(`Add-on "${payload.name}" created`);
      try {
        const res = await supabase.from('addons').insert([payload]).select();
        if (res?.error) {
          showToast(`Supabase error: ${res.error.message}`, 'error');
        } else if (res?.data && res.data[0]) {
          setAddonsList((prev) => prev.map((a) => (a.id === tempId ? (res.data[0] as Addon) : a)));
        }
      } catch (e: any) {
        console.error(e);
        showToast(`Save Error: ${e.message || e}`, 'error');
      }
    }
  };

  const toggleAddonStatus = async (id: string) => {
    const target = addonsList.find((a) => a.id === id);
    if (!target) return;
    const newStatus = !target.is_active;

    setAddonsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_active: newStatus } : a))
    );
    showToast('Add-on status toggled');

    try {
      await supabase.from('addons').update({ is_active: newStatus }).eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAddon = async (id: string) => {
    setAddonsList((prev) => prev.filter((a) => a.id !== id));
    showToast('Add-on deleted', 'info');
    try {
      await supabase.from('addons').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  };

  // --- SETTINGS HANDLERS ---
  const updateSettings = async (newSettings: Partial<GlobalSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Quotation rules & bank details saved!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        orders,
        chassisList,
        addonsList,
        settings,
        globalSearch,
        setGlobalSearch,
        selectedOrder,
        setSelectedOrder,
        toasts,
        showToast,
        removeToast,
        isSupabaseLive,
        isSyncing,
        refreshFromSupabase: fetchFromSupabase,
        clearAllData,
        updateOrderStatus,
        saveAndResendQuotation,
        saveChassis,
        toggleChassisStatus,
        deleteChassis,
        saveAddon,
        toggleAddonStatus,
        deleteAddon,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
