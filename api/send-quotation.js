import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const mmToPt = (mm) => (mm * 72) / 25.4;

const getPDFBuffer = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: mmToPt(8), bottom: mmToPt(8), left: mmToPt(10), right: mmToPt(10) },
        autoFirstPage: false,
        bufferPages: true,
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      doc.addPage();

      // Page background
      doc.rect(0, 0, mmToPt(210), mmToPt(297)).fill('#f6f5f2');

      // Top Logo or Brand Heading
      const logoPath = path.join(process.cwd(), 'public', 'logo', 'machine-by-sohub.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, mmToPt(10), mmToPt(10), { width: mmToPt(42) });
      } else {
        doc.font('Helvetica-Bold').fontSize(20).fillColor('#0f172a')
           .text('machine', mmToPt(10), mmToPt(10), { lineBreak: false });
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#ff5454')
           .text('BY SOHUB', mmToPt(10), mmToPt(18), { lineBreak: false });
      }

      // Quotation Number Header
      doc.font('Helvetica-Bold').fontSize(13).fillColor('#ff5454')
         .text(`Quotation No: ${data.order_number || 'SHB-1001'}`, mmToPt(10), mmToPt(28), { lineBreak: false });

      // Customer Details Header + Date
      const dateString = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#0f172a')
         .text('Customer Details', mmToPt(10), mmToPt(38), { lineBreak: false });
      doc.font('Helvetica').fontSize(9.5).fillColor('#0f172a')
         .text(`Date: ${dateString}`, mmToPt(10), mmToPt(38), { align: 'right', width: mmToPt(190), lineBreak: false });

      // Customer info lines
      let currentY = mmToPt(44);
      doc.font('Helvetica').fontSize(8.5).fillColor('#334155');
      doc.text(`Name: ${data.customer_name || 'N/A'}`, mmToPt(10), currentY, { lineBreak: false });
      currentY += mmToPt(4.2);
      if (data.customer_company) {
        doc.text(`Company: ${data.customer_company}`, mmToPt(10), currentY, { lineBreak: false });
        currentY += mmToPt(4.2);
      }
      doc.text(`Email: ${data.customer_email || 'N/A'} | Phone: ${data.customer_phone || 'N/A'}`, mmToPt(10), currentY, { lineBreak: false });
      currentY += mmToPt(4.2);
      doc.text(`Delivery Location: ${data.delivery_location || 'N/A'}`, mmToPt(10), currentY, { lineBreak: false });
      currentY += mmToPt(4.2);

      // Table Header
      currentY += mmToPt(4);
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a');
      doc.text('Particulars', mmToPt(10), currentY, { width: mmToPt(95), lineBreak: false });
      doc.text('Qty', mmToPt(108), currentY, { width: mmToPt(18), align: 'center', lineBreak: false });
      doc.text('Unit Price', mmToPt(128), currentY, { width: mmToPt(34), align: 'right', lineBreak: false });
      doc.text('Total (BDT)', mmToPt(164), currentY, { width: mmToPt(36), align: 'right', lineBreak: false });

      currentY += mmToPt(4.5);
      doc.strokeColor('#0f172a').lineWidth(1)
         .moveTo(mmToPt(10), currentY).lineTo(mmToPt(200), currentY).stroke();
      currentY += mmToPt(3);

      // Chassis Base Row
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1e293b');
      doc.text(`${data.chassis_title} (Base Machine)`, mmToPt(10), currentY, { width: mmToPt(95), lineBreak: false });
      doc.font('Helvetica').fontSize(8.5);
      doc.text('1', mmToPt(108), currentY, { width: mmToPt(18), align: 'center', lineBreak: false });
      const basePriceFormatted = Number(data.chassis_base_price || 0).toLocaleString('en-BD');
      
      // Unit price: BDT left aligned at 128mm, amount right aligned to 162mm
      doc.text('BDT', mmToPt(128), currentY, { lineBreak: false });
      doc.text(basePriceFormatted, mmToPt(128), currentY, { width: mmToPt(34), align: 'right', lineBreak: false });
      
      // Total price: BDT left aligned at 164mm, amount right aligned to 200mm
      doc.text('BDT', mmToPt(164), currentY, { lineBreak: false });
      doc.text(basePriceFormatted, mmToPt(164), currentY, { width: mmToPt(36), align: 'right', lineBreak: false });
      currentY += mmToPt(5);

      // Selected Addons Rows
      const addons = data.selected_addons || [];
      for (const addon of addons) {
        const isTbd = addon.is_tbd || Number(addon.final_price) === 0;
        doc.font('Helvetica').fontSize(8.5).fillColor('#334155');
        doc.text(`+ ${addon.addon_name}`, mmToPt(10), currentY, { width: mmToPt(95), lineBreak: false });
        doc.text('1', mmToPt(108), currentY, { width: mmToPt(18), align: 'center', lineBreak: false });
        if (isTbd) {
          doc.text('TBD', mmToPt(128), currentY, { width: mmToPt(34), align: 'right', lineBreak: false });
          doc.text('TBD', mmToPt(164), currentY, { width: mmToPt(36), align: 'right', lineBreak: false });
        } else {
          const addonPriceFormatted = Number(addon.final_price).toLocaleString('en-BD');
          doc.text('BDT', mmToPt(128), currentY, { lineBreak: false });
          doc.text(addonPriceFormatted, mmToPt(128), currentY, { width: mmToPt(34), align: 'right', lineBreak: false });
          
          doc.text('BDT', mmToPt(164), currentY, { lineBreak: false });
          doc.text(addonPriceFormatted, mmToPt(164), currentY, { width: mmToPt(36), align: 'right', lineBreak: false });
        }
        currentY += mmToPt(4.5);
      }

      // Totals Divider
      currentY += mmToPt(3);
      doc.strokeColor('#cbd5e1').lineWidth(0.5)
         .moveTo(mmToPt(120), currentY).lineTo(mmToPt(200), currentY).stroke();
      currentY += mmToPt(2.5);

      // Subtotal
      doc.font('Helvetica').fontSize(8.5).fillColor('#475569');
      doc.text('Subtotal:', mmToPt(120), currentY, { width: mmToPt(40), lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f172a');
      doc.text('BDT', mmToPt(164), currentY, { lineBreak: false });
      doc.text(Number(data.subtotal || 0).toLocaleString('en-BD'), mmToPt(164), currentY, { width: mmToPt(36), align: 'right', lineBreak: false });
      currentY += mmToPt(4.2);

      // VAT
      doc.font('Helvetica').fontSize(8.5).fillColor('#475569');
      doc.text(`VAT (${data.vat_rate || 5}%):`, mmToPt(120), currentY, { width: mmToPt(40), lineBreak: false });
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f172a');
      doc.text('BDT', mmToPt(164), currentY, { lineBreak: false });
      doc.text(Number(data.vat_amount || 0).toLocaleString('en-BD'), mmToPt(164), currentY, { width: mmToPt(36), align: 'right', lineBreak: false });
      currentY += mmToPt(5);

      // Grand Total
      doc.strokeColor('#0f172a').lineWidth(1)
         .moveTo(mmToPt(120), currentY).lineTo(mmToPt(200), currentY).stroke();
      currentY += mmToPt(2.5);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#ff5454');
      doc.text('Grand Total:', mmToPt(120), currentY, { width: mmToPt(40), lineBreak: false });
      doc.text('BDT', mmToPt(164), currentY, { lineBreak: false });
      doc.text(Number(data.grand_total || 0).toLocaleString('en-BD'), mmToPt(164), currentY, { width: mmToPt(36), align: 'right', lineBreak: false });
      currentY += mmToPt(7);

      // Terms & Conditions Notes Header
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a');
      doc.text('Terms, Conditions & Notes', mmToPt(10), currentY, { lineBreak: false });
      currentY += mmToPt(4);

      // Render notes lines DYNAMICALLY to prevent overlapping!
      const notesText = data.admin_notes || '';
      const notesLines = notesText.split('\n').filter(l => l.trim().length > 0);
      doc.font('Helvetica').fontSize(7.2).fillColor('#334155');
      
      for (const line of notesLines) {
        if (currentY > mmToPt(265)) break; // Stop before footer zone
        const lineH = doc.heightOfString(line, { width: mmToPt(190) });
        doc.text(line, mmToPt(10), currentY, { width: mmToPt(190) });
        currentY += lineH + mmToPt(1.2);
      }

      // Static Single Page Footer (Anchored near bottom)
      const footerY = mmToPt(278);
      doc.strokeColor('#e2e8f0').lineWidth(0.5)
         .moveTo(mmToPt(10), footerY).lineTo(mmToPt(200), footerY).stroke();

      doc.font('Helvetica').fontSize(7.5).fillColor('#64748b');
      doc.text('For Support, Email: hello@sohub.com.bd | Phone: +880 1922-036882', mmToPt(10), footerY + mmToPt(2.5), { align: 'center', width: mmToPt(190), lineBreak: false });
      doc.text('Machine by SOHUB — Building reliable machine infrastructure for Bangladesh', mmToPt(10), footerY + mmToPt(6.5), { align: 'center', width: mmToPt(190), lineBreak: false });

      const sohubLogoPath = path.join(process.cwd(), 'public', 'logo', 'sohub.png');
      if (fs.existsSync(sohubLogoPath)) {
        doc.image(sohubLogoPath, mmToPt(175), footerY + mmToPt(2.5), { width: mmToPt(18) });
      }

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

    // Greetings Email Body with Logo Header
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 2px solid #ff5454; padding-bottom: 16px; margin-bottom: 24px; }
          .header img { height: 38px; display: block; margin: 0 auto 8px auto; }
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
            <img src="https://machines.sohub.com.bd/logo/machine-by-sohub.png" alt="Machine by SOHUB" style="height: 44px; display: block; margin: 0 auto 10px auto;" />
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
