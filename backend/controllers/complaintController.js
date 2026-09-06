const Complaint = require('../models/Complaint');
const Client = require('../models/Client');
const findTechnicianForZone = require('../utils/assignTechnician');
const { notifyNewComplaintToTechnician } = require('../services/alertEvents');

// Naya complaint/breakdown - client ke zone ke andar nearest available
// technician ko auto-assign karta hai aur usse alert bhejta hai
async function createComplaint(req, res, next) {
  try {
    const { client, product, description, priority } = req.body;

    const clientDoc = await Client.findById(client);
    if (!clientDoc) return res.status(404).json({ success: false, message: 'Client not found' });

    const complaint = await Complaint.create({
      client,
      product,
      description,
      priority: priority || 'medium',
      zone: clientDoc.zone,
    });

    const technician = await findTechnicianForZone(clientDoc.zone);
    if (technician) {
      complaint.assignedTechnician = technician._id;
      complaint.status = 'assigned';
      await complaint.save();
      await notifyNewComplaintToTechnician({ technician, complaint, client: clientDoc });
    }

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
}

async function getComplaints(req, res, next) {
  try {
    const { status, zone, technician, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (zone) filter.zone = zone;
    if (technician) filter.assignedTechnician = technician;
    if (req.user.role === 'customer') filter.client = req.user.client;
    if (req.user.role === 'technician' && !technician) filter.assignedTechnician = req.user.technician;

    const complaints = await Complaint.find(filter)
      .populate('client', 'name phone zone')
      .populate('product', 'brand modelName')
      .populate('assignedTechnician', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Complaint.countDocuments(filter);

    res.json({ success: true, data: complaints, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

async function getComplaintById(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('client')
      .populate('product')
      .populate('assignedTechnician');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (req.user.role === 'customer' && String(complaint.client._id) !== String(req.user.client)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
}

// Status flow: open -> assigned -> in_progress -> resolved -> closed
async function updateComplaintStatus(req, res, next) {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.status = status;
    if (status === 'resolved') complaint.resolvedAt = new Date();
    await complaint.save();

    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
}

async function reassignComplaint(req, res, next) {
  try {
    const { technicianId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    complaint.assignedTechnician = technicianId;
    complaint.status = 'assigned';
    await complaint.save();

    res.json({ success: true, data: complaint });
  } catch (err) {
    next(err);
  }
}

module.exports = { createComplaint, getComplaints, getComplaintById, updateComplaintStatus, reassignComplaint };
