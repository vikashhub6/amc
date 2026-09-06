export const ZONES = [
  'GIDC Vapi',
  'Vapi Station',
  'Chala',
  'Dungra',
  'Salvav',
  'Char Rasta',
  'Killa Pardi',
  'Silvassa Road',
];

export const PRODUCT_CATEGORIES = ['AC', 'Refrigerator', 'Cooler', 'Deep Freezer', 'Water Cooler', 'Other'];

export const AMC_PLANS = ['Basic', 'Standard', 'Premium'];

export function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatMoney(n) {
  return `Rs. ${Number(n || 0).toLocaleString('en-IN')}`;
}
