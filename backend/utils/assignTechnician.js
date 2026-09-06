const Technician = require('../models/Technician');

// Zone ke andar available technician dhundo. Agar specialization diya hai to
// pehle wahi try karo (e.g. AC complaint -> AC specialist), warna zone ka koi
// bhi available technician assign kar do. Sabse kam active/pending visits
// wale ko priority (simple load-balancing).
async function findTechnicianForZone(zone, specialization) {
  const baseQuery = { zones: zone, isAvailable: true };

  let candidates = specialization
    ? await Technician.find({ ...baseQuery, specialization }).lean()
    : [];

  if (!candidates.length) {
    candidates = await Technician.find(baseQuery).lean();
  }

  if (!candidates.length) return null;

  const ServiceVisit = require('../models/ServiceVisit');
  const withLoad = await Promise.all(
    candidates.map(async (tech) => {
      const pendingCount = await ServiceVisit.countDocuments({
        technician: tech._id,
        status: { $in: ['scheduled', 'in_progress'] },
      });
      return { tech, pendingCount };
    })
  );

  withLoad.sort((a, b) => a.pendingCount - b.pendingCount);
  return withLoad[0].tech;
}

module.exports = findTechnicianForZone;
