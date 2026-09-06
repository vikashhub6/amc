const PDFDocument = require('pdfkit');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config/s3');

const bucket = process.env.AWS_S3_BUCKET;

// Payment record ke liye simple invoice PDF banata hai, S3 pe upload karta hai
// aur uska public URL return karta hai.
function generateInvoicePdf({ payment, client, amcContract, product }) {
  return new Promise((resolve, reject) => {
    const fileName = `${payment.invoiceNumber}.pdf`;
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', reject);

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

    doc.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const key = `invoices/${fileName}`;
        await s3.send(new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: 'application/pdf',
        }));
        resolve(`https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`);
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = generateInvoicePdf;
