const Technician = require('../models/Technician');
const ServiceVisit = require('../models/ServiceVisit');

async function getTechnicians(req, res, next) {
  try {
    const { zone } = req.query;
    const filter = {};
    if (zone) filter.zones = zone;
    const technicians = await Technician.find(filter).sort({ name: 1 });
    res.json({ success: true, data: technicians });
  } catch (err) {
    next(err);
  }
}

async function getTechnicianById(req, res, next) {
  try {
    const technician = await Technician.findById(req.params.id);
    if (!technician) return res.status(404).json({ success: false, message: 'Technician not found' });
    res.json({ success: true, data: technician });
  } catch (err) {
    next(err);
  }
}

async function updateTechnician(req, res, next) {
  try {
    const technician = await Technician.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!technician) return res.status(404).json({ success: false, message: 'Technician not found' });
    res.json({ success: true, data: technician });
  } catch (err) {
    next(err);
  }
}

// Logged-in technician (ya admin) ke liye aaj ki assigned visits
async function getMyTodayVisits(req, res, next) {
  try {
    const technicianId = req.params.id || req.user.technician;
    if (!technicianId) return res.status(400).json({ success: false, message: 'No technician profile linked' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const visits = await ServiceVisit.find({
      technician: technicianId,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'in_progress'] },
    })
      .populate('client', 'name phone address zone')
      .populate('product', 'brand modelName category')
      .sort({ scheduledDate: 1 });

    res.json({ success: true, data: visits });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTechnicians, getTechnicianById, updateTechnician, getMyTodayVisits };
