const SparePart = require('../models/SparePart');
const { notifyLowStockToAdmin } = require('../services/alertEvents');

async function createSparePart(req, res, next) {
  try {
    const part = await SparePart.create(req.body);
    res.status(201).json({ success: true, data: part });
  } catch (err) {
    next(err);
  }
}

async function getSpareParts(req, res, next) {
  try {
    const { lowStockOnly } = req.query;
    let parts = await SparePart.find().sort({ name: 1 });
    if (lowStockOnly === 'true') {
      parts = parts.filter((p) => p.quantityInStock <= p.minStockThreshold);
    }
    res.json({ success: true, data: parts });
  } catch (err) {
    next(err);
  }
}

async function updateSparePart(req, res, next) {
  try {
    const part = await SparePart.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!part) return res.status(404).json({ success: false, message: 'Spare part not found' });
    res.json({ success: true, data: part });
  } catch (err) {
    next(err);
  }
}

// Manual stock adjustment (e.g. naya stock aaya, ya galti sudharni hai)
async function adjustStock(req, res, next) {
  try {
    const { delta } = req.body; // +ve = stock in, -ve = stock out
    const part = await SparePart.findById(req.params.id);
    if (!part) return res.status(404).json({ success: false, message: 'Spare part not found' });

    part.quantityInStock = Math.max(0, part.quantityInStock + Number(delta));

    // Stock wapas threshold se upar gaya to alert flag reset karo taaki agli
    // baar phir se low-stock hone par naya alert ja sake
    if (part.quantityInStock > part.minStockThreshold) {
      part.lowStockAlertSent = false;
    } else if (!part.lowStockAlertSent) {
      await notifyLowStockToAdmin({ sparePart: part });
      part.lowStockAlertSent = true;
    }

    await part.save();
    res.json({ success: true, data: part });
  } catch (err) {
    next(err);
  }
}

async function deleteSparePart(req, res, next) {
  try {
    const part = await SparePart.findByIdAndDelete(req.params.id);
    if (!part) return res.status(404).json({ success: false, message: 'Spare part not found' });
    res.json({ success: true, message: 'Spare part deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createSparePart, getSpareParts, updateSparePart, adjustStock, deleteSparePart };
