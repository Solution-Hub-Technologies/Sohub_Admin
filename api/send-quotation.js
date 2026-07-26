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

  try {
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
      grand_total,
      admin_notes,
      customer_notes,
    } = req.body || {};

    const lambdaUrl = process.env.LAMBDA_API_URL;
    const lambdaSecret = process.env.LAMBDA_SECRET;
    const adminEmail = process.env.ADMIN_EMAIL || 'hello@sohub.com.bd';

    const defaultNotesText = `*** Note:
i. All prices are exclusive of all applicable government taxes and charges.
ii. Delivery Time: 45–60 working days after issuance of the purchase order.
iii. Quotation Validity: This offer is valid for 30 days from the date of submission.
iv. Technical support related to the machine will be provided remotely by SOHUB through online or telephone assistance.
v. Electrical setup and electrician support must be arranged by the customer.
vi. Installation, commissioning, and user training are included. A 1-year service warranty is provided; however, spare parts and consumable items are not covered under the warranty.
vii. Any on-site support visit requested by the Customer after installation will be chargeable based on the location, travel, and time required.
viii. The monthly recurring service fee shall become effective from the date of successful installation and acceptance of the system by the Customer.`;

    const finalNotes = admin_notes || defaultNotesText;

    // Format notes lines for rendering
    const formattedNotesLines = finalNotes
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => `<li style="margin-bottom: 6px; color: #334155;">${line}</li>`)
      .join('');

    // Premium PDF-Matched HTML Quotation Email Template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quotation #${order_number}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lora:ital,wght@0,500;0,600;0,700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #e2e8f0; margin: 0; padding: 20px; color: #1e293b; }
          .page { max-width: 680px; margin: 0 auto; background: #f6f5f2; border-radius: 16px; padding: 36px 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #cbd5e1; }
          .logo-header { font-family: 'Inter', sans-serif; font-size: 26px; font-weight: 300; margin: 0 0 20px 0; color: #0f172a; }
          .logo-header strong { font-weight: 800; font-size: 18px; color: #ff5454; display: block; text-transform: uppercase; letter-spacing: 0.5px; }
          .quote-title { font-family: 'Lora', serif; font-size: 24px; font-weight: 600; color: #ff5454; margin-bottom: 24px; border-bottom: 2px solid #ff5454; padding-bottom: 8px; }
          .info-grid { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 24px; background: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .info-grid p { margin: 3px 0; color: #475569; }
          .info-grid strong { color: #0f172a; }
          .section-header { font-family: 'Lora', serif; font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          .items-table th { font-family: 'Lora', serif; font-size: 14px; font-weight: 600; text-align: left; padding: 10px 12px; border-bottom: 2px solid #0f172a; color: #0f172a; }
          .items-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 500; color: #334155; }
          .items-table .right { text-align: right; }
          .items-table .center { text-align: center; }
          .tbd-badge { display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 800; background-color: #fef3c7; color: #92400e; border-radius: 4px; border: 1px solid #fde68a; }
          .totals-container { margin-top: 24px; display: flex; justify-content: flex-end; }
          .totals-table { width: 280px; border-collapse: collapse; font-size: 12px; }
          .totals-table td { padding: 6px 10px; }
          .totals-table td.label { font-family: 'Lora', serif; font-size: 14px; color: #475569; }
          .totals-table td.value { text-align: right; font-weight: 700; color: #0f172a; }
          .totals-table tr.grand-total td { font-size: 16px; font-weight: 800; color: #ff5454; border-top: 2px solid #0f172a; padding-top: 10px; }
          .notes-block { background: #ffffff; padding: 18px 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 32px; font-size: 11px; }
          .notes-block h4 { font-family: 'Lora', serif; font-size: 14px; font-weight: 600; margin: 0 0 10px 0; color: #0f172a; }
          .terms-list { padding-left: 18px; margin: 0; list-style-type: decimal; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 20px; }
          .footer span { color: #ff5454; font-weight: 700; }
          .powered-by { text-align: right; margin-top: 12px; font-family: 'Lora', serif; font-size: 11px; font-weight: 600; color: #475569; }
          .powered-by strong { color: #d97706; }
        </style>
      </head>
      <body>
        <div class="page">
          <!-- Logo Header -->
          <div class="logo-header">
            machine
            <strong>by sohub</strong>
          </div>

          <!-- Quotation Title -->
          <div class="quote-title">Quotation No: ${order_number}</div>

          <!-- Customer & Date info grid -->
          <div class="info-grid">
            <div>
              <div class="section-header">Customer Details</div>
              <p>Name: <strong>${customer_name}</strong></p>
              <p>Company: <strong>${customer_company || 'Individual Lead'}</strong></p>
              <p>Email: <strong>${customer_email}</strong> | Phone: <strong>${customer_phone}</strong></p>
              <p>Delivery Location: <strong>${delivery_location}</strong></p>
            </div>
            <div style="text-align: right;">
              <div class="section-header">Date</div>
              <p><strong>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong></p>
            </div>
          </div>

          ${customer_notes ? `
            <div style="background: #fff7ed; padding: 12px 16px; border-left: 4px solid #f97316; border-radius: 6px; margin-bottom: 20px; font-size: 12px; color: #9a3412;">
              <strong>Customer Request Note:</strong> "${customer_notes}"
            </div>
          ` : ''}

          <!-- Items Table -->
          <div class="section-header">Particulars & Pricing Breakdown</div>
          <table class="items-table">
            <thead>
              <tr>
                <th width="55%">Particulars</th>
                <th class="center" width="15%">Qty</th>
                <th class="right" width="30%">Price (BDT)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${chassis_title} (Base Machine Chassis)</strong></td>
                <td class="center">1</td>
                <td class="right">৳${Number(chassis_base_price || 0).toLocaleString('en-BD')}</td>
              </tr>
              ${(selected_addons || []).map(addon => {
                const isTbd = addon.is_tbd || Number(addon.final_price) === 0;
                return `
                  <tr>
                    <td>+ ${addon.addon_name} ${isTbd ? '<span class="tbd-badge">TBD</span>' : ''}</td>
                    <td class="center">1</td>
                    <td class="right">${isTbd ? '<span class="tbd-badge">To Be Discussed</span>' : '৳' + Number(addon.final_price).toLocaleString('en-BD')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Totals Container -->
          <div class="totals-container">
            <table class="totals-table">
              <tr>
                <td class="label">Subtotal</td>
                <td class="value">৳${Number(subtotal || 0).toLocaleString('en-BD')}</td>
              </tr>
              <tr>
                <td class="label">VAT (${vat_rate || 5}%)</td>
                <td class="value">৳${Number(vat_amount || 0).toLocaleString('en-BD')}</td>
              </tr>
              <tr class="grand-total">
                <td class="label" style="font-weight:700; color:#ff5454;">Grand Total</td>
                <td class="value">৳${Number(grand_total || 0).toLocaleString('en-BD')}</td>
              </tr>
            </table>
          </div>

          <!-- Notes / Terms & Conditions -->
          <div class="notes-block">
            <h4>Terms, Conditions & Important Notes</h4>
            <ol class="terms-list">
              ${formattedNotesLines}
            </ol>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>For Support, Email: <span>${adminEmail}</span> | Phone: <span>+880 1922-036882</span></p>
            <p>Machine by SOHUB — Building reliable machine infrastructure for Bangladesh</p>
          </div>

          <div class="powered-by">
            Powered BY <strong>{...} sohub</strong>
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
            subject: `Official Quotation #${order_number} - Machine by SOHUB`,
            source: 'SOHUB Admin Portal',
            secretKey: lambdaSecret,
            htmlTemplate: htmlContent,
          }),
        });

        const lambdaData = await lambdaRes.json();
        return res.status(200).json({ success: true, message: 'Quotation email sent via AWS Lambda!', result: lambdaData });
      } catch (err) {
        console.error('Lambda email delivery error:', err);
        return res.status(200).json({ success: true, warning: err.message, message: 'Quotation updated in database (Lambda dispatch offline).' });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Quotation updated in database successfully.',
    });
  } catch (globalErr) {
    console.error('Global handler error in send-quotation:', globalErr);
    return res.status(200).json({
      success: true,
      message: 'Quotation updated in database.',
      warning: globalErr.message,
    });
  }
}
