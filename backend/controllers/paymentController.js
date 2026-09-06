const Payment = require('../models/Payment');
const Client = require('../models/Client');
const AMCContract = require('../models/AMCContract');
const Product = require('../models/Product');
const generateInvoicePdf = require('../utils/generateInvoice');
const { notifyPaymentPending } = require('../services/alertEvents');

async function createPayment(req, res, next) {
  try {
    const { client, amcContract, amount, dueDate } = req.body;

    const clientDoc = await Client.findById(client);
    if (!clientDoc) return res.status(404).json({ success: false, message: 'Client not found' });

    const payment = await Payment.create({ client, amcContract, amount, dueDate });

    const contract = amcContract ? await AMCContract.findById(amcContract) : null;
    const product = contract ? await Product.findById(contract.product) : null;

    const pdfPath = await generateInvoicePdf({ payment, client: clientDoc, amcContract: contract, product });
    payment.invoicePdfPath = pdfPath;
    await payment.save();

    await notifyPaymentPending({ client: clientDoc, payment });

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
}

async function getPayments(req, res, next) {
  try {
    const { status, client, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (client) filter.client = client;
    if (req.user.role === 'customer') filter.client = req.user.client;

    const payments = await Payment.find(filter)
      .populate('client', 'name phone')
      .sort({ dueDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Payment.countDocuments(filter);

    res.json({ success: true, data: payments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

async function getPaymentById(req, res, next) {
  try {
    const payment = await Payment.findById(req.params.id).populate('client').populate('amcContract');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (req.user.role === 'customer' && String(payment.client._id) !== String(req.user.client)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
}

async function markAsPaid(req, res, next) {
  try {
    const { method } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = 'paid';
    payment.paidDate = new Date();
    payment.method = method || 'cash';
    await payment.save();

    res.json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
}

module.exports = { createPayment, getPayments, getPaymentById, markAsPaid };
