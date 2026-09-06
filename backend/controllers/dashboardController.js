const AMCContract = require('../models/AMCContract');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');
const Client = require('../models/Client');
const ServiceVisit = require('../models/ServiceVisit');
const Feedback = require('../models/Feedback');

async function getAdminSummary(req, res, next) {
  try {
    const [activeAMC, expiringSoon, expired, overdueVisits, pendingPayments, revenueAgg, complaintStats, avgRatingAgg] =
      await Promise.all([
        AMCContract.countDocuments({ status: 'active' }),
        AMCContract.countDocuments({ status: 'expiring_soon' }),
        AMCContract.countDocuments({ status: 'expired' }),
        ServiceVisit.countDocuments({ status: 'missed' }),
        Payment.countDocuments({ status: { $in: ['pending', 'overdue'] } }),
        Payment.aggregate([
          { $match: { status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
      ]);

    const totalComplaints = complaintStats.reduce((sum, s) => sum + s.count, 0);
    const resolved = complaintStats.find((s) => s._id === 'resolved')?.count || 0;
    const closed = complaintStats.find((s) => s._id === 'closed')?.count || 0;
    const resolutionRate = totalComplaints ? Math.round(((resolved + closed) / totalComplaints) * 100) : 0;

    res.json({
      success: true,
      data: {
        activeAMC,
        expiringSoon,
        expired,
        overdueVisits,
        pendingPayments,
        totalRevenue: revenueAgg[0]?.total || 0,
        totalComplaints,
        complaintResolutionRate: resolutionRate,
        complaintsByStatus: complaintStats,
        avgRating: Number((avgRatingAgg[0]?.avg || 0).toFixed(1)),
        totalClients: await Client.countDocuments({ isActive: true }),
      },
    });
  } catch (err) {
    next(err);
  }
}

// Recharts ke liye ready-made series: last 6 mahino ka revenue + AMC growth
async function getMonthlyTrend(req, res, next) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const revenueByMonth = await Payment.aggregate([
      { $match: { status: 'paid', paidDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$paidDate' }, month: { $month: '$paidDate' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const newAMCByMonth = await AMCContract.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ success: true, data: { revenueByMonth, newAMCByMonth } });
  } catch (err) {
    next(err);
  }
}

// Area/zone-wise report - clients, active AMC, complaints per zone
async function getAreaWiseReport(req, res, next) {
  try {
    const clientsByZone = await Client.aggregate([{ $group: { _id: '$zone', clients: { $sum: 1 } } }]);
    const complaintsByZone = await Complaint.aggregate([{ $group: { _id: '$zone', complaints: { $sum: 1 } } }]);

    const zoneMap = {};
    clientsByZone.forEach((c) => {
      zoneMap[c._id] = { zone: c._id, clients: c.clients, complaints: 0 };
    });
    complaintsByZone.forEach((c) => {
      if (!zoneMap[c._id]) zoneMap[c._id] = { zone: c._id, clients: 0, complaints: 0 };
      zoneMap[c._id].complaints = c.complaints;
    });

    res.json({ success: true, data: Object.values(zoneMap) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAdminSummary, getMonthlyTrend, getAreaWiseReport };
