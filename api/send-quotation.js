import fetch from 'node-fetch';

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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    customer_company,
    delivery_location,
    chassis_title,
    chassis_base_price,
    selected_addons,
    subtotal,
    vat_rate,
    vat_amount,
    monthly_recurring_fee,
    grand_total,
    admin_notes,
    customer_notes,
  } = req.body || {};

  const lambdaUrl = process.env.LAMBDA_API_URL;
  const lambdaSecret = process.env.LAMBDA_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL || 'hello@sohub.com.bd';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background: #0f172a; padding: 28px 32px; color: #ffffff; text-align: left; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; color: #ff751a; text-transform: uppercase; letter-spacing: 1px; }
        .header p { margin: 4px 0 0 0; font-size: 13px; color: #94a3b8; }
        .content { padding: 32px; }
        .customer-box { background: #f1f5f9; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px; }
        .customer-box table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .customer-box td { padding: 4px 0; }
        .table-title { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
        .items-table th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
        .items-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
        .total-box { background: #0f172a; color: #ffffff; padding: 20px; border-radius: 12px; margin-top: 24px; }
        .total-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #cbd5e1; }
        .grand-total { display: flex; justify-style: space-between; font-size: 18px; font-weight: 800; color: #ff751a; padding-top: 10px; border-top: 1px solid #334155; margin-top: 10px; }
        .notes-box { background: #fff7ed; border-left: 4px solid #ff751a; padding: 12px 16px; margin-top: 20px; border-radius: 4px; font-size: 13px; color: #9a3412; }
        .footer { background: #f8fafc; padding: 20px 32px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>SOHUB Vending Quotation</h1>
          <p>Order Ref: <strong>${order_number}</strong> | Date: ${new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <div class="content">
          <p>Dear <strong>${customer_name}</strong>,</p>
          <p>Thank you for contacting SOHUB. Here is your customized quotation breakdown for <strong>${chassis_title}</strong>.</p>
          
          <div class="customer-box">
            <table>
              <tr><td><strong>Client:</strong> ${customer_name} (${customer_company || 'Individual Lead'})</td></tr>
              <tr><td><strong>Phone:</strong> ${customer_phone} | <strong>Email:</strong> ${customer_email}</td></tr>
              <tr><td><strong>Delivery Location:</strong> ${delivery_location}</td></tr>
            </table>
          </div>

          <div class="table-title">Selected Machine Configuration & Add-ons</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: right;">Price (BDT)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${chassis_title} (Base Machine)</strong></td>
                <td style="text-align: right;">৳${Number(chassis_base_price || 0).toLocaleString('en-BD')}</td>
              </tr>
              ${(selected_addons || []).map(addon => `
                <tr>
                  <td>${addon.addon_name}</td>
                  <td style="text-align: right;">৳${Number(addon.final_price || 0).toLocaleString('en-BD')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-box">
            <div class="total-row"><span>Subtotal:</span><span>৳${Number(subtotal || 0).toLocaleString('en-BD')}</span></div>
            <div class="total-row"><span>VAT (${vat_rate || 5}%):</span><span>৳${Number(vat_amount || 0).toLocaleString('en-BD')}</span></div>
            <div class="total-row"><span>Monthly IoT & Cloud Service Fee:</span><span>৳${Number(monthly_recurring_fee || 5000).toLocaleString('en-BD')}/mo</span></div>
            <div class="grand-total"><span>Grand Total:</span><span>৳${Number(grand_total || 0).toLocaleString('en-BD')}</span></div>
          </div>

          ${admin_notes || customer_notes ? `
            <div class="notes-box">
              <strong>Special Instructions / Notes:</strong><br/>
              ${admin_notes || customer_notes}
            </div>
          ` : ''}

          <p style="margin-top: 24px; font-size: 13px;">If you have any questions or would like to confirm your order, please reply to this email or contact us.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Solution Hub Technologies (SOHUB). All rights reserved.<br/>
          Dhaka, Bangladesh | Web: machines.sohub.com.bd
        </div>
      </div>
    </body>
    </html>
  `;

  if (lambdaUrl && lambdaSecret) {
    try {
      const lambdaRes = await fetch(lambdaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customer_name,
          email: adminEmail,
          to: customer_email,
          subject: `Quotation Breakdown #${order_number} - SOHUB Vending`,
          source: 'SOHUB Admin Portal',
          secretKey: lambdaSecret,
          htmlTemplate: htmlContent,
        }),
      });

      const lambdaData = await lambdaRes.json();
      return res.status(200).json({ success: true, message: 'Quotation email sent via AWS Lambda!', result: lambdaData });
    } catch (err) {
      console.error('Lambda email delivery error:', err);
      return res.status(500).json({ success: false, error: err.message, message: 'Saved to DB, but Lambda email delivery failed.' });
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Quotation saved in DB successfully (AWS Lambda environment variables pending).',
  });
}
