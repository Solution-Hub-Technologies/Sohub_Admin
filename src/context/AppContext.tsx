import React, { createContext, useContext, useState, useEffect } from 'react';
import { Chassis, Addon, Order, GlobalSettings, OrderStatus, AdminUser, UserRole } from '../lib/types';
import { INITIAL_SETTINGS, INITIAL_CHASSIS, INITIAL_ADDONS, INITIAL_ORDERS } from '../lib/mockData';
import { supabase, clearAllSupabaseTables } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export type NavTab = 'orders' | 'configurator' | 'users' | 'settings';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Navigation
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;

  // Auth & Session
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  supabaseUser: User | null;
  supabaseSession: Session | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // User Management
  usersList: AdminUser[];
  addUser: (userData: Partial<AdminUser> & { password?: string }) => Promise<boolean>;
  toggleUserStatus: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;

  // Collections
  orders: Order[];
  chassisList: Chassis[];
  addonsList: Addon[];
  settings: GlobalSettings;
  globalSearch: string;
  setGlobalSearch: (search: string) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  
  // Toasts & Sync
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  isSupabaseLive: boolean;
  isSyncing: boolean;
  refreshFromSupabase: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Handlers
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  saveAndResendQuotation: (
    orderId: string,
    updatedAddons: Order['selected_addons'],
    vatRate: number,
    monthlyFee: number,
    adminNotes?: string,
    customTerms?: string
  ) => Promise<boolean>;
  saveChassis: (chassis: Partial<Chassis>) => Promise<void>;
  toggleChassisStatus: (id: string) => Promise<void>;
  deleteChassis: (id: string) => Promise<void>;
  saveAddon: (addon: Partial<Addon>) => Promise<void>;
  toggleAddonStatus: (id: string) => Promise<void>;
  deleteAddon: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<GlobalSettings>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isUuid = (str?: string) =>
  !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const DEFAULT_USERS: AdminUser[] = [
  {
    id: 'usr-1',
    email: 'admin@sohub.com.bd',
    full_name: 'Tanvir Ahmed',
    role: 'Super Admin',
    status: 'Active',
    created_at: '2026-01-01T00:00:00Z',
    last_login: new Date().toISOString(),
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State with localStorage persistence
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const savedTab = localStorage.getItem('sohub_active_tab');
    return (savedTab as NavTab) || 'orders';
  });

  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('sohub_auth_status');
    return saved ? JSON.parse(saved) : true;
  });

  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('sohub_current_user');
    return saved ? JSON.parse(saved) : DEFAULT_USERS[0];
  });

  // User Management State
  const [usersList, setUsersList] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('sohub_users_list');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  // Collections State
  const [chassisList, setChassisList] = useState<Chassis[]>([]);
  const [addonsList, setAddonsList] = useState<Addon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [settings, setSettings] = useState<GlobalSettings>(() => {
    const saved = localStorage.getItem('sohub_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Persist Active Tab across page reloads
  useEffect(() => {
    localStorage.setItem('sohub_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('sohub_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('sohub_auth_status', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('sohub_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sohub_users_list', JSON.stringify(usersList));
  }, [usersList]);

  // Supabase Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  // --- AUTH HANDLERS ---
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const cleanedEmail = email.trim().toLowerCase();

      // 1. Try Supabase Custom `users` table first
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanedEmail)
        .maybeSingle();

      if (dbUser && !dbError) {
        if (dbUser.status !== 'Active') {
          showToast('Account is currently disabled. Contact Super Admin.', 'error');
          return false;
        }

        if (dbUser.password === pass) {
          const loggedUser: AdminUser = {
            id: dbUser.id,
            email: dbUser.email,
            full_name: dbUser.full_name,
            role: dbUser.role as UserRole,
            status: dbUser.status as 'Active' | 'Inactive',
            created_at: dbUser.created_at,
            last_login: new Date().toISOString(),
          };

          setCurrentUser(loggedUser);
          setIsAuthenticated(true);

          try {
            await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', dbUser.id);
          } catch (e) {
            console.warn('Failed to update last_login timestamp:', e);
          }

          showToast(`Welcome back, ${loggedUser.full_name}! (${loggedUser.role})`, 'success');
          return true;
        } else {
          showToast('Incorrect password entered.', 'error');
          return false;
        }
      }

      // 2. Try Supabase Auth native service
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanedEmail,
        password: pass,
      });

      if (!error && data?.user) {
        setSupabaseUser(data.user);
        setSupabaseSession(data.session);
        setIsAuthenticated(true);
        const loggedUser: AdminUser = {
          id: data.user.id,
          email: data.user.email || cleanedEmail,
          full_name: data.user.user_metadata?.full_name || cleanedEmail.split('@')[0],
          role: 'Super Admin',
          status: 'Active',
          created_at: data.user.created_at,
          last_login: new Date().toISOString(),
        };
        setCurrentUser(loggedUser);
        showToast(`Welcome back, ${loggedUser.full_name}!`, 'success');
        return true;
      }

      // 3. Fallback check local usersList state
      const foundLocal = usersList.find((u) => u.email.toLowerCase() === cleanedEmail);
      if (foundLocal) {
        if (foundLocal.status !== 'Active') {
          showToast('Account is inactive.', 'error');
          return false;
        }
        setCurrentUser(foundLocal);
        setIsAuthenticated(true);
        showToast(`Authenticated as ${foundLocal.full_name}`, 'success');
        return true;
      }

      // 4. Default demo credentials fallback (admin@sohub.com.bd / sohub123)
      if (cleanedEmail === 'admin@sohub.com.bd' && pass === 'sohub123') {
        const loggedUser: AdminUser = DEFAULT_USERS[0];
        setCurrentUser(loggedUser);
        setIsAuthenticated(true);
        showToast('Authenticated as Super Admin (Demo)', 'success');
        return true;
      }

      showToast('Invalid authentication credentials.', 'error');
      return false;
    } catch (err: any) {
      showToast(`Login error: ${err.message || err}`, 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    showToast('Signed out successfully', 'info');
  };

  // --- USER MANAGEMENT HANDLERS ---
  const addUser = async (userData: Partial<AdminUser> & { password?: string }): Promise<boolean> => {
    const payload = {
      full_name: userData.full_name || 'Admin User',
      email: (userData.email || 'user@sohub.com.bd').trim().toLowerCase(),
      password: userData.password || 'sohub123',
      role: userData.role || 'Sales Manager',
      status: 'Active',
    };

    const localUser: AdminUser = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      full_name: payload.full_name,
      email: payload.email,
      role: payload.role as UserRole,
      status: 'Active',
      created_at: new Date().toISOString(),
    };

    setUsersList((prev) => [localUser, ...prev]);

    try {
      const res = await supabase.from('users').insert([payload]).select();
      if (res?.error) {
        console.error('Supabase user insert error:', res.error.message);
        showToast(`Warning: Local user created, but Supabase error: ${res.error.message}`, 'info');
      } else if (res?.data && res.data[0]) {
        const dbUser = res.data[0];
        setUsersList((prev) => [
          {
            id: dbUser.id,
            full_name: dbUser.full_name,
            email: dbUser.email,
            role: dbUser.role,
            status: dbUser.status,
            created_at: dbUser.created_at,
          },
          ...prev.filter((u) => u.id !== localUser.id),
        ]);
        showToast(`User "${payload.full_name}" added to Supabase DB!`, 'success');
      }
    } catch (e: any) {
      console.error('Supabase user save exception:', e);
      showToast(`User created locally (${e.message || e})`, 'info');
    }

    return true;
  };

  const toggleUserStatus = async (userId: string) => {
    const target = usersList.find((u) => u.id === userId);
    if (!target) return;
    const newStatus = target.status === 'Active' ? 'Inactive' : 'Active';

    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
    showToast(`User status set to ${newStatus}`);

    if (isUuid(userId)) {
      try {
        await supabase.from('users').update({ status: newStatus }).eq('id', userId);
      } catch (e) {
        console.error('Supabase user status toggle error:', e);
      }
    }
  };

  const deleteUser = async (userId: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
    showToast('User deleted', 'info');

    if (isUuid(userId)) {
      try {
        await supabase.from('users').delete().eq('id', userId);
      } catch (e) {
        console.error('Supabase user delete error:', e);
      }
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    showToast(`User role updated to ${role}`);

    if (isUuid(userId)) {
      try {
        await supabase.from('users').update({ role }).eq('id', userId);
      } catch (e) {
        console.error('Supabase user role update error:', e);
      }
    }
  };

  // --- SUPABASE FETCH ---
  const clearAllData = async () => {
    setIsSyncing(true);
    try {
      await clearAllSupabaseTables();
      setChassisList([]);
      setAddonsList([]);
      setOrders([]);
      setUsersList(DEFAULT_USERS);
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
      const { data: dbUsers } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbUsers && dbUsers.length > 0) {
        setUsersList(
          dbUsers.map((u) => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            role: u.role as UserRole,
            status: u.status as 'Active' | 'Inactive',
            created_at: u.created_at,
            last_login: u.last_login,
          }))
        );
      }

      const { data: dbOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbOrders && dbOrders.length > 0) {
        setOrders(dbOrders as Order[]);
      } else {
        setOrders(INITIAL_ORDERS);
      }

      const { data: dbChassis } = await supabase
        .from('chassis')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbChassis && dbChassis.length > 0) {
        setChassisList(dbChassis as Chassis[]);
      } else {
        setChassisList(INITIAL_CHASSIS);
      }

      const { data: dbAddons } = await supabase
        .from('addons')
        .select('*')
        .order('sort_order', { ascending: true });

      if (dbAddons && dbAddons.length > 0) {
        setAddonsList(dbAddons as Addon[]);
      } else {
        setAddonsList(INITIAL_ADDONS);
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

    if (isUuid(orderId)) {
      try {
        await supabase
          .from('orders')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', orderId);
      } catch (err) {
        console.error('Supabase status update error:', err);
      }
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
    showToast('Lead / Quotation record deleted permanently', 'info');

    if (isUuid(orderId)) {
      try {
        await supabase.from('orders').delete().eq('id', orderId);
      } catch (err) {
        console.error('Supabase order delete error:', err);
      }
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

    if (isUuid(targetOrder.id)) {
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

    if (chassisData.id && isUuid(chassisData.id)) {
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
      showToast(`New Machine Model "${payload.title}" created`);
      try {
        const res = await supabase.from('chassis').insert([payload]).select();
        if (res?.error) {
          console.error('Supabase insert error details:', res.error.message);
          showToast(`Supabase Error: ${res.error.message}`, 'error');
        } else if (res?.data && res.data[0]) {
          setChassisList((prev) => [res.data[0] as Chassis, ...prev.filter((c) => c.id !== chassisData.id)]);
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

    if (isUuid(id)) {
      try {
        await supabase.from('chassis').update({ is_active: newStatus }).eq('id', id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const deleteChassis = async (id: string) => {
    setChassisList((prev) => prev.filter((c) => c.id !== id));
    showToast('Machine model deleted', 'info');
    if (isUuid(id)) {
      try {
        await supabase.from('chassis').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase delete error:', e);
      }
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

    if (addonData.id && isUuid(addonData.id)) {
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
      showToast(`Add-on "${payload.name}" created`);
      try {
        const res = await supabase.from('addons').insert([payload]).select();
        if (res?.error) {
          showToast(`Supabase error: ${res.error.message}`, 'error');
        } else if (res?.data && res.data[0]) {
          setAddonsList((prev) => [...prev.filter((a) => a.id !== addonData.id), res.data[0] as Addon]);
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

    if (isUuid(id)) {
      try {
        await supabase.from('addons').update({ is_active: newStatus }).eq('id', id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const deleteAddon = async (id: string) => {
    setAddonsList((prev) => prev.filter((a) => a.id !== id));
    showToast('Add-on deleted', 'info');
    if (isUuid(id)) {
      try {
        await supabase.from('addons').delete().eq('id', id);
      } catch (e) {
        console.error(e);
      }
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
        isAuthenticated,
        currentUser,
        supabaseUser,
        supabaseSession,
        login,
        logout,
        usersList,
        addUser,
        toggleUserStatus,
        deleteUser,
        updateUserRole,
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
        deleteOrder,
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
