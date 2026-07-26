import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Supabase credentials missing in environment variables.' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'sohub_admin' }
  });

  try {
    const body = req.body || {};

    const orderNumber = `SHB-${Math.floor(100000 + Math.random() * 900000)}`;
    const subtotal = Number(body.subtotal || body.chassis_base_price || 0);
    const vatRate = Number(body.vat_rate || 5);
    const vatAmount = Math.round((subtotal * vatRate) / 100);
    const monthlyFee = Number(body.monthly_recurring_fee || 5000);
    const grandTotal = subtotal + vatAmount;

    const payload = {
      order_number: orderNumber,
      customer_name: body.customer_name || body.name || 'Anonymous Customer',
      customer_email: body.customer_email || body.email || 'lead@sohub.com.bd',
      customer_phone: body.customer_phone || body.phone || '',
      customer_company: body.customer_company || body.company || '',
      delivery_location: body.delivery_location || body.location || 'Dhaka',
      chassis_title: body.chassis_title || 'SOHUB Vending Machine',
      chassis_base_price: Number(body.chassis_base_price || subtotal),
      selected_addons: body.selected_addons || [],
      subtotal: subtotal,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      monthly_recurring_fee: monthlyFee,
      grand_total: grandTotal,
      status: 'Pending',
    };

    const { data, error } = await supabase.from('orders').insert([payload]).select();

    if (error) {
      console.error('Order submission error in sohub_admin schema:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Order inquiry received successfully!',
      order_number: orderNumber,
      order: data ? data[0] : payload,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
