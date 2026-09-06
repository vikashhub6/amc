const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const INVOICE_DIR = path.join(__dirname, '..', 'uploads', 'invoices');
if (!fs.existsSync(INVOICE_DIR)) fs.mkdirSync(INVOICE_DIR, { recursive: true });

// Payment record ke liye simple invoice PDF banata hai aur file path return karta hai.
function generateInvoicePdf({ payment, client, amcContract, product }) {
  return new Promise((resolve, reject) => {
    const fileName = `${payment.invoiceNumber}.pdf`;
    const filePath = path.join(INVOICE_DIR, fileName);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text(process.env.COMPANY_NAME || 'Dynamic Cooling System', { align: 'left' });
    doc.fontSize(10).text(process.env.COMPANY_CITY || 'Vapi, Gujarat');
    doc.moveDown();
    doc.fontSize(16).text('INVOICE', { align: 'right' });
    doc.fontSize(10).text(`Invoice #: ${payment.invoiceNumber}`, { align: 'right' });
    doc.text(`Date: ${new Date(payment.createdAt || Date.now()).toLocaleDateString('en-IN')}`, { align: 'right' });
    doc.moveDown();

    doc.fontSize(12).text(`Bill To: ${client.name}`);
    doc.fontSize(10).text(client.address || '');
    doc.text(`Phone: ${client.phone}`);
    doc.moveDown();

    if (product) {
      doc.text(`Product: ${product.brand} ${product.modelName} (Serial: ${product.serialNumber})`);
    }
    if (amcContract) {
      doc.text(`AMC Plan: ${amcContract.planType} (${new Date(amcContract.startDate).toLocaleDateString('en-IN')} - ${new Date(amcContract.endDate).toLocaleDateString('en-IN')})`);
    }
    doc.moveDown();

    doc.fontSize(12).text(`Amount Due: Rs. ${Number(payment.amount).toLocaleString('en-IN')}`);
    doc.text(`Due Date: ${new Date(payment.dueDate).toLocaleDateString('en-IN')}`);
    doc.text(`Status: ${payment.status.toUpperCase()}`);
    doc.moveDown(2);
    doc.fontSize(9).fillColor('gray').text('Thank you for your business.', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(`/uploads/invoices/${fileName}`));
    stream.on('error', reject);
  });
}

module.exports = generateInvoicePdf;
