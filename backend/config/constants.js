// Vapi (Gujarat) service zones used for technician auto-assignment.
// Add/edit freely to match the real coverage area.
const ZONES = [
  'GIDC Vapi',
  'Vapi Station',
  'Chala',
  'Dungra',
  'Salvav',
  'Char Rasta',
  'Killa Pardi',
  'Silvassa Road',
];

const ROLES = ['admin', 'technician', 'customer'];

const AMC_PLAN_TYPES = ['Basic', 'Standard', 'Premium'];

const AMC_STATUS = ['active', 'expiring_soon', 'expired', 'cancelled'];

const VISIT_STATUS = ['scheduled', 'in_progress', 'completed', 'missed', 'cancelled'];

const VISIT_TYPE = ['routine', 'complaint', 'installation'];

const COMPLAINT_STATUS = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];

const COMPLAINT_PRIORITY = ['low', 'medium', 'high', 'critical'];

const PAYMENT_STATUS = ['pending', 'paid', 'overdue', 'cancelled'];

// SLA (in hours) technicians must resolve a complaint by, based on priority
const SLA_HOURS = { critical: 4, high: 8, medium: 24, low: 48 };

module.exports = {
  ZONES,
  ROLES,
  AMC_PLAN_TYPES,
  AMC_STATUS,
  VISIT_STATUS,
  VISIT_TYPE,
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
  PAYMENT_STATUS,
  SLA_HOURS,
};
