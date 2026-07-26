import PDFDocument from 'pdfkit';

const mmToPt = (mm) => (mm * 72) / 25.4;

const getPDFBuffer = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: mmToPt(10), bottom: mmToPt(10), left: mmToPt(12), right: mmToPt(12) },
        autoFirstPage: false,
        bufferPages: true,
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      doc.addPage();

      // Background
      doc.rect(0, 0, mmToPt(210), mmToPt(297)).fill('#f6f5f2');

      // Title & Brand Header
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#0f172a')
         .text('machine', mmToPt(12), mmToPt(14), { lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#ff5454')
         .text('BY SOHUB', mmToPt(12), mmToPt(23), { lineBreak: false });

      // Quotation Number
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#ff5454')
         .text(`Quotation No: ${data.order_number}`, mmToPt(12), mmToPt(34), { lineBreak: false });

      // Customer Details Header + Date
      const dateString = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a')
         .text('Customer Details', mmToPt(12), mmToPt(46), { lineBreak: false });
      doc.font('Helvetica').fontSize(10).fillColor('#0f172a')
         .text(`Date: ${dateString}`, mmToPt(12), mmToPt(46), { align: 'right', width: mmToPt(186), lineBreak: false });

      // Customer info
      let currentY = mmToPt(54);
      doc.font('Helvetica').fontSize(9).fillColor('#334155');
      doc.text(`Name: ${data.customer_name || 'N/A'}`, mmToPt(12), currentY, { lineBreak: false });
      currentY += mmToPt(5);
      if (data.customer_company) {
        doc.text(`Company: ${data.customer_company}`, mmToPt(12), currentY, { lineBreak: false });
        currentY += mmToPt(5);
      }
      doc.text(`Email: ${data.customer_email || 'N/A'} | Phone: ${data.customer_phone || 'N/A'}`, mmToPt(12), currentY, { lineBreak: false });
      currentY += mmToPt(5);
      doc.text(`Delivery Location: ${data.delivery_location || 'N/A'}`, mmToPt(12), currentY, { lineBreak: false });
      currentY += mmToPt(5);

      // Table Header
      currentY += mmToPt(6);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a');
      doc.text('Particulars', mmToPt(12), currentY, { width: mmToPt(95), lineBreak: false });
      doc.text('Qty', mmToPt(110), currentY, { width: mmToPt(25), align: 'center', lineBreak: false });
      doc.text('Unit Price', mmToPt(135), currentY, { width: mmToPt(30), align: 'center', lineBreak: false });
      doc.text('Total (BDT)', mmToPt(165), currentY, { width: mmToPt(33), align: 'right', lineBreak: false });

      currentY += mmToPt(5);
      doc.strokeColor('#0f172a').lineWidth(1)
         .moveTo(mmToPt(12), currentY).lineTo(mmToPt(198), currentY).stroke();
      currentY += mmToPt(4);

      // Chassis Base Row
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#1e293b');
      doc.text(`${data.chassis_title} (Base Machine)`, mmToPt(12), currentY, { width: mmToPt(95), lineBreak: false });
      doc.font('Helvetica').fontSize(9);
      doc.text('1', mmToPt(110), currentY, { width: mmToPt(25), align: 'center', lineBreak: false });
      const basePriceFormatted = Number(data.chassis_base_price || 0).toLocaleString('en-BD');
      doc.text(`BDT ${basePriceFormatted}`, mmToPt(135), currentY, { width: mmToPt(30), align: 'center', lineBreak: false });
      doc.text(`BDT ${basePriceFormatted}`, mmToPt(165), currentY, { width: mmToPt(33), align: 'right', lineBreak: false });
      currentY += mmToPt(6);

      // Selected Addons
      const addons = data.selected_addons || [];
      for (const addon of addons) {
        const isTbd = addon.is_tbd || Number(addon.final_price) === 0;
        doc.font('Helvetica').fontSize(9).fillColor('#334155');
        doc.text(`+ ${addon.addon_name}`, mmToPt(12), currentY, { width: mmToPt(95), lineBreak: false });
        doc.text('1', mmToPt(110), currentY, { width: mmToPt(25), align: 'center', lineBreak: false });
        if (isTbd) {
          doc.text('TBD', mmToPt(135), currentY, { width: mmToPt(30), align: 'center', lineBreak: false });
          doc.text('TBD', mmToPt(165), currentY, { width: mmToPt(33), align: 'right', lineBreak: false });
        } else {
          const addonPriceFormatted = Number(addon.final_price).toLocaleString('en-BD');
          doc.text(`BDT ${addonPriceFormatted}`, mmToPt(135), currentY, { width: mmToPt(30), align: 'center', lineBreak: false });
          doc.text(`BDT ${addonPriceFormatted}`, mmToPt(165), currentY, { width: mmToPt(33), align: 'right', lineBreak: false });
        }
        currentY += mmToPt(5.5);
      }

      // Totals Divider
      currentY += mmToPt(4);
      doc.strokeColor('#cbd5e1').lineWidth(0.5)
         .moveTo(mmToPt(120), currentY).lineTo(mmToPt(198), currentY).stroke();
      currentY += mmToPt(3);

      // Subtotal
      doc.font('Helvetica').fontSize(9).fillColor('#475569');
      doc.text('Subtotal:', mmToPt(120), currentY, { width: mmToPt(40), lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a');
      doc.text(`BDT ${Number(data.subtotal || 0).toLocaleString('en-BD')}`, mmToPt(160), currentY, { width: mmToPt(38), align: 'right', lineBreak: false });
      currentY += mmToPt(5);

      // VAT
      doc.font('Helvetica').fontSize(9).fillColor('#475569');
      doc.text(`VAT (${data.vat_rate || 5}%):`, mmToPt(120), currentY, { width: mmToPt(40), lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a');
      doc.text(`BDT ${Number(data.vat_amount || 0).toLocaleString('en-BD')}`, mmToPt(160), currentY, { width: mmToPt(38), align: 'right', lineBreak: false });
      currentY += mmToPt(6);

      // Grand Total
      doc.strokeColor('#0f172a').lineWidth(1)
         .moveTo(mmToPt(120), currentY).lineTo(mmToPt(198), currentY).stroke();
      currentY += mmToPt(3);
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#ff5454');
      doc.text('Grand Total:', mmToPt(120), currentY, { width: mmToPt(40), lineBreak: false });
      doc.text(`BDT ${Number(data.grand_total || 0).toLocaleString('en-BD')}`, mmToPt(160), currentY, { width: mmToPt(38), align: 'right', lineBreak: false });
      currentY += mmToPt(10);

      // Terms & Conditions Notes Header
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#0f172a');
      doc.text('Terms, Conditions & Notes', mmToPt(12), currentY, { lineBreak: false });
      currentY += mmToPt(5);

      // Render notes lines
      const notesText = data.admin_notes || '';
      const notesLines = notesText.split('\n').filter(l => l.trim().length > 0);
      doc.font('Helvetica').fontSize(7.5).fillColor('#475569');
      for (const line of notesLines) {
        if (currentY > mmToPt(275)) break;
        doc.text(line, mmToPt(12), currentY, { width: mmToPt(186), lineBreak: true });
        currentY += mmToPt(4);
      }

      // Footer
      const footerY = mmToPt(297) - mmToPt(12);
      doc.font('Helvetica').fontSize(8).fillColor('#64748b');
      doc.text('For Support, Email: hello@sohub.com.bd | Phone: +880 1922-036882', mmToPt(12), footerY - mmToPt(4), { align: 'center', width: mmToPt(186), lineBreak: false });
      doc.text('Machine by SOHUB — Building reliable machine infrastructure for Bangladesh', mmToPt(12), footerY, { align: 'center', width: mmToPt(186), lineBreak: false });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

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
    const data = req.body || {};
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
    } = data;

    const lambdaUrl = process.env.LAMBDA_API_URL;
    const lambdaSecret = process.env.LAMBDA_SECRET;
    const adminEmail = process.env.ADMIN_EMAIL || 'hello@sohub.com.bd';

    // Generate PDF Buffer and Base64 Attachment
    let pdfBase64 = '';
    try {
      const pdfBuffer = await getPDFBuffer(data);
      pdfBase64 = pdfBuffer.toString('base64');
    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr);
    }

    const attachments = pdfBase64
      ? [{ filename: `Quotation_${order_number || 'SHB'}.pdf`, content: pdfBase64, encoding: 'base64' }]
      : [];

    // Greetings Email Body
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 2px solid #ff5454; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { font-size: 24px; color: #0f172a; margin: 0; }
          .header span { color: #ff5454; font-weight: bold; }
          .greeting { font-size: 15px; line-height: 1.6; color: #334155; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0; font-size: 13px; }
          .card h3 { margin-top: 0; color: #0f172a; font-size: 15px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; }
          .summary-item { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .grand-total { font-size: 16px; font-weight: bold; color: #ff5454; border-top: 1.5px solid #0f172a; padding-top: 8px; margin-top: 8px; }
          .pdf-notice { background: #fff7ed; border-left: 4px solid #f97316; padding: 12px; border-radius: 6px; font-size: 13px; color: #9a3412; margin: 20px 0; }
          .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; margin-top: 30px; }
          .footer a { color: #ff5454; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>machine <span>BY SOHUB</span></h1>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Quotation Reference: #${order_number}</p>
          </div>

          <div class="greeting">
            <p>Dear <strong>${customer_name || 'Valued Customer'}</strong>,</p>
            <p>Greetings from <strong>Machine by SOHUB</strong>!</p>
            <p>Following our recent discussion and re-estimation, we are pleased to present the official quotation for your vending machine requirement. Please find the detailed quotation PDF attached to this email (<code>Quotation_${order_number}.pdf</code>).</p>
          </div>

          <div class="card">
            <h3>Quotation Summary Overview</h3>
            <div class="summary-item"><span>Machine Model:</span> <strong>${chassis_title}</strong></div>
            <div class="summary-item"><span>Base Chassis Price:</span> <strong>৳${Number(chassis_base_price || 0).toLocaleString('en-BD')}</strong></div>
            <div class="summary-item"><span>Selected Add-ons Total:</span> <strong>৳${(selected_addons || []).reduce((s, a) => s + (Number(a.final_price) || 0), 0).toLocaleString('en-BD')}</strong></div>
            <div class="summary-item"><span>Subtotal:</span> <strong>৳${Number(subtotal || 0).toLocaleString('en-BD')}</strong></div>
            <div class="summary-item"><span>VAT (${vat_rate || 5}%):</span> <strong>৳${Number(vat_amount || 0).toLocaleString('en-BD')}</strong></div>
            <div class="summary-item grand-total"><span>Grand Total:</span> <strong>৳${Number(grand_total || 0).toLocaleString('en-BD')}</strong></div>
          </div>

          <div class="pdf-notice">
            📌 <strong>Attachment Included:</strong> The complete quotation document with detailed technical specifications, warranty terms, and terms of service has been attached as a PDF file to this email.
          </div>

          <div class="greeting">
            <p>If you have any questions, require further customization, or are ready to confirm your order, please reply directly to this email or call our hotline at <strong>+880 1922-036882</strong>.</p>
          </div>

          <div class="footer">
            <p>Best Regards,</p>
            <p><strong>SOHUB Sales & Solutions Team</strong><br>Solution Hub Technologies</p>
            <p><a href="https://machines.sohub.com.bd">machines.sohub.com.bd</a> | Email: hello@sohub.com.bd</p>
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
            name: 'SOHUB Team',
            email: adminEmail,
            to: customer_email,
            subject: `Official Quotation #${order_number} - Machine by SOHUB`,
            source: 'SOHUB Admin Portal',
            secretKey: lambdaSecret,
            htmlTemplate: htmlContent,
            attachments: attachments,
          }),
        });

        const lambdaData = await lambdaRes.json();
        return res.status(200).json({ success: true, message: 'Quotation email & PDF sent via AWS Lambda!', result: lambdaData });
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
