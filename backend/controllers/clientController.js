const Client = require('../models/Client');

async function createClient(req, res, next) {
  try {
    const client = await Client.create(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

async function getClients(req, res, next) {
  try {
    const { search, zone, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (zone) filter.zone = zone;
    if (search) filter.$text = { $search: search };

    const clients = await Client.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Client.countDocuments(filter);

    res.json({ success: true, data: clients, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

async function getClientById(req, res, next) {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

async function updateClient(req, res, next) {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

async function deleteClient(req, res, next) {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, message: 'Client deactivated', data: client });
  } catch (err) {
    next(err);
  }
}

module.exports = { createClient, getClients, getClientById, updateClient, deleteClient };
