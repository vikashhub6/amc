const ServiceVisit = require('../models/ServiceVisit');
const AMCContract = require('../models/AMCContract');
const Client = require('../models/Client');
const Product = require('../models/Product');
const SparePart = require('../models/SparePart');
const Technician = require('../models/Technician');
const { notifyServiceCompleted, notifyNewJobAssignment } = require('../services/alertEvents');

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// Admin ek visit schedule karta hai (routine ya complaint-based) aur technician ko assign karta hai
async function scheduleVisit(req, res, next) {
  try {
    const { amcContract, complaint, client, product, technician, type, scheduledDate } = req.body;

    const clientDoc = await Client.findById(client);
    const technicianDoc = await Technician.findById(technician);
    if (!clientDoc || !technicianDoc) {
      return res.status(404).json({ success: false, message: 'Client or Technician not found' });
    }

    const visit = await ServiceVisit.create({
      amcContract,
      complaint,
      client,
      product,
      technician,
      type: type || 'routine',
      scheduledDate,
    });

    // Dual-side alert: technician ko naya job assignment
    await notifyNewJobAssignment({ technician: technicianDoc, visit, client: clientDoc });

    res.status(201).json({ success: true, data: visit });
  } catch (err) {
    next(err);
  }
}

async function getVisits(req, res, next) {
  try {
    const { technician, status, client, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (technician) filter.technician = technician;
    if (status) filter.status = status;
    if (client) filter.client = client;
    if (req.user.role === 'customer') filter.client = req.user.client;
    if (req.user.role === 'technician' && !technician) filter.technician = req.user.technician;

    const visits = await ServiceVisit.find(filter)
      .populate('client', 'name phone zone address')
      .populate('product', 'brand modelName category')
      .populate('technician', 'name phone')
      .sort({ scheduledDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await ServiceVisit.countDocuments(filter);

    res.json({ success: true, data: visits, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

async function getVisitById(req, res, next) {
  try {
    const visit = await ServiceVisit.findById(req.params.id)
      .populate('client')
      .populate('product')
      .populate('technician')
      .populate('partsUsed.sparePart', 'name code unitPrice');
    if (!visit) return res.status(404).json({ success: false, message: 'Service visit not found' });
    if (req.user.role === 'customer' && String(visit.client._id) !== String(req.user.client)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, data: visit });
  } catch (err) {
    next(err);
  }
}

// Technician panel ka core action - "Service Completed" button:
// photos (before/after), signature, parts used - sab ek saath submit hote hain
async function completeVisit(req, res, next) {
  try {
    const visit = await ServiceVisit.findById(req.params.id);
    if (!visit) return res.status(404).json({ success: false, message: 'Service visit not found' });

    const { technicianNotes } = req.body;
    let partsUsed = [];
    if (req.body.partsUsed) {
      partsUsed = typeof req.body.partsUsed === 'string' ? JSON.parse(req.body.partsUsed) : req.body.partsUsed;
    }

    const photosBefore = (req.files?.photosBefore || []).map((f) => f.location);
    const photosAfter = (req.files?.photosAfter || []).map((f) => f.location);
    const signatureFile = req.files?.signature?.[0];

    if (photosBefore.length) visit.photosBefore.push(...photosBefore);
    if (photosAfter.length) visit.photosAfter.push(...photosAfter);
    if (signatureFile) visit.customerSignature = signatureFile.location;
    if (technicianNotes) visit.technicianNotes = technicianNotes;
    if (partsUsed.length) visit.partsUsed = partsUsed;

    visit.status = 'completed';
    visit.completedDate = new Date();
    await visit.save();

    // Parts used -> inventory se auto-deduct (aur zaroorat pade to low-stock alert
    // sparePartController.adjustStock jaisi logic yaha bhi apply hoti hai)
    const { notifyLowStockToAdmin } = require('../services/alertEvents');
    for (const item of partsUsed) {
      const part = await SparePart.findById(item.sparePart);
      if (!part) continue;
      part.quantityInStock = Math.max(0, part.quantityInStock - Number(item.quantity));
      if (part.quantityInStock <= part.minStockThreshold && !part.lowStockAlertSent) {
        await notifyLowStockToAdmin({ sparePart: part });
        part.lowStockAlertSent = true;
      }
      await part.save();
    }

    // Agar yeh AMC routine visit thi, to contract me service count badhao aur
    // agli service date auto-calculate karo
    if (visit.amcContract) {
      const contract = await AMCContract.findById(visit.amcContract);
      if (contract) {
        contract.servicesCompleted += 1;
        contract.nextServiceDate = addMonths(new Date(), contract.serviceFrequencyMonths);
        contract.remindersSent = {
          renewal30: contract.remindersSent.renewal30,
          renewal15: contract.remindersSent.renewal15,
          serviceDue7: false,
          serviceDue3: false,
          serviceDue1: false,
          overdue: false,
        };
        contract.status = 'active';
        await contract.save();
      }
    }

    const clientDoc = await Client.findById(visit.client);
    const productDoc = visit.product ? await Product.findById(visit.product) : null;
    await notifyServiceCompleted({ client: clientDoc, product: productDoc, visit });

    res.json({ success: true, message: 'Service marked as completed', data: visit });
  } catch (err) {
    next(err);
  }
}

module.exports = { scheduleVisit, getVisits, getVisitById, completeVisit };
