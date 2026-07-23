export type ChassisType = 'imported' | 'local';

export interface Chassis {
  id: string;
  title: string;
  type: ChassisType;
  base_price: number; // in BDT
  short_description?: string;
  image_url?: string;
  chiller_support: boolean;
  is_active: boolean;
  allowed_addons?: string[]; // Array of allowed add-on names or IDs
  created_at: string;
  specifications: {
    slots: number;
    capacity: string;
    dimensions: string;
    temperature_range: string;
    power_consumption: string;
    display_type?: string;
  };
}

export interface Addon {
  id: string;
  name: string;
  description: string;
  category: 'hardware' | 'software' | 'branding' | 'payment';
  price: number; // in BDT, 0 if TBD
  is_tbd: boolean;
  sort_order: number;
  is_active: boolean;
  compatible_models: string[]; // chassis titles or 'All'
}

export interface SelectedAddonItem {
  addon_id: string;
  addon_name: string;
  original_price: number;
  is_tbd: boolean;
  final_price: number; // Admin adjusted price
}

export type OrderStatus = 'Pending' | 'Quotation Sent' | 'Confirmed' | 'Cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company?: string;
  delivery_location: string;
  chassis_id?: string;
  chassis_title: string;
  chassis_base_price: number;
  quantity?: number; // Quantity of machines ordered
  selected_addons: SelectedAddonItem[];
  subtotal: number;
  vat_rate: number; // e.g. 5 for 5%
  vat_amount: number;
  monthly_recurring_fee: number; // Default 5000 BDT/month
  grand_total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  admin_notes?: string;
  custom_bank_details?: BankDetails;
  custom_terms?: string;
}

export interface BankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  branch: string;
  routing_number: string;
}

export interface GlobalSettings {
  default_vat_rate: number;
  default_monthly_fee: number;
  default_payment_terms: string;
  bank_details: BankDetails;
  terms_and_conditions: string[];
}
