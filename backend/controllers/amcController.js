const AMCContract = require('../models/AMCContract');
const Client = require('../models/Client');
const Product = require('../models/Product');
const ServiceVisit = require('../models/ServiceVisit');
const { notifyAmcPurchase } = require('../services/alertEvents');

// Plan type ke hisaab se default service frequency (mahino me) aur total services/year
const PLAN_DEFAULTS = {
  Basic: { serviceFrequencyMonths: 6, totalServicesIncluded: 2 },
  Standard: { serviceFrequencyMonths: 4, totalServicesIncluded: 3 },
  Premium: { serviceFrequencyMonths: 3, totalServicesIncluded: 4 },
};

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

async function createAMC(req, res, next) {
  try {
    const { client, product, planType, amount, startDate, serviceFrequencyMonths, totalServicesIncluded } = req.body;

    const clientDoc = await Client.findById(client);
    const productDoc = await Product.findById(product);
    if (!clientDoc || !productDoc) {
      return res.status(404).json({ success: false, message: 'Client or Product not found' });
    }

    const defaults = PLAN_DEFAULTS[planType] || PLAN_DEFAULTS.Basic;
    const start = startDate ? new Date(startDate) : new Date();
    const freq = serviceFrequencyMonths || defaults.serviceFrequencyMonths;

    // Next service date aur end date auto-calculate (business rule: 1 year contract)
    const amcContract = await AMCContract.create({
      client,
      product,
      planType,
      amount,
      startDate: start,
      endDate: addMonths(start, 12),
      serviceFrequencyMonths: freq,
      totalServicesIncluded: totalServicesIncluded || defaults.totalServicesIncluded,
      nextServiceDate: addMonths(start, freq),
    });

    // Dual-side alert: customer ko purchase confirmation
    await notifyAmcPurchase({ client: clientDoc, product: productDoc, amcContract });

    res.status(201).json({ success: true, data: amcContract });
  } catch (err) {
    next(err);
  }
}

async function getAMCContracts(req, res, next) {
  try {
    const { status, client, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (client) filter.client = client;
    // Customer sirf apna hi data dekh sake
    if (req.user.role === 'customer') filter.client = req.user.client;

    const contracts = await AMCContract.find(filter)
      .populate('client', 'name phone zone')
      .populate('product', 'brand modelName serialNumber category')
      .sort({ nextServiceDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await AMCContract.countDocuments(filter);

    res.json({ success: true, data: contracts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

async function getAMCById(req, res, next) {
  try {
    const contract = await AMCContract.findById(req.params.id).populate('client').populate('product');
    if (!contract) return res.status(404).json({ success: false, message: 'AMC contract not found' });
    if (req.user.role === 'customer' && String(contract.client._id) !== String(req.user.client)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const history = await ServiceVisit.find({ amcContract: contract._id })
      .populate('technician', 'name phone')
      .sort({ scheduledDate: -1 });

    res.json({ success: true, data: contract, serviceHistory: history });
  } catch (err) {
    next(err);
  }
}

async function updateAMC(req, res, next) {
  try {
    const contract = await AMCContract.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contract) return res.status(404).json({ success: false, message: 'AMC contract not found' });
    res.json({ success: true, data: contract });
  } catch (err) {
    next(err);
  }
}

// Renewal: purani contract ko cancel/expire maan ke ek nayi contract bana do,
// same product par, naye 1-saal cycle ke saath
async function renewAMC(req, res, next) {
  try {
    const old = await AMCContract.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'AMC contract not found' });

    const { planType, amount } = req.body;
    const clientDoc = await Client.findById(old.client);
    const productDoc = await Product.findById(old.product);

    const defaults = PLAN_DEFAULTS[planType || old.planType] || PLAN_DEFAULTS.Basic;
    const start = new Date(old.endDate); // purani expiry se naya cycle shuru
    const freq = defaults.serviceFrequencyMonths;

    const renewed = await AMCContract.create({
      client: old.client,
      product: old.product,
      planType: planType || old.planType,
      amount: amount || old.amount,
      startDate: start,
      endDate: addMonths(start, 12),
      serviceFrequencyMonths: freq,
      totalServicesIncluded: defaults.totalServicesIncluded,
      nextServiceDate: addMonths(start, freq),
    });

    old.status = 'cancelled';
    await old.save();

    await notifyAmcPurchase({ client: clientDoc, product: productDoc, amcContract: renewed });

    res.status(201).json({ success: true, message: 'AMC renewed', data: renewed });
  } catch (err) {
    next(err);
  }
}

module.exports = { createAMC, getAMCContracts, getAMCById, updateAMC, renewAMC };
