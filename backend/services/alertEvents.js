// Har business event ke liye customer-side aur company/technician-side alert
// yahan ek jagah define hai, taaki dono channel (email+sms) hamesha saath bhejein
// aur wording consistent rahe. Controllers aur alertScheduler.js dono isi file
// ko import karte hain.
const dispatchAlert = require('../utils/alertDispatcher');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PHONE = process.env.ADMIN_PHONE;
const COMPANY_NAME = process.env.COMPANY_NAME || 'Dynamic Cooling System';

const money = (n) => `Rs. ${Number(n).toLocaleString('en-IN')}`;
const dateStr = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/* ---------------------------- CUSTOMER SIDE ---------------------------- */

async function notifyAmcPurchase({ client, product, amcContract }) {
  const subject = `${COMPANY_NAME} - AMC Purchase Confirmed`;
  const html = `<p>Dear ${client.name},</p>
    <p>Your <b>${amcContract.planType}</b> AMC for ${product.brand} ${product.modelName} (Serial: ${product.serialNumber})
    has been activated successfully.</p>
    <p>Contract validity: ${dateStr(amcContract.startDate)} to ${dateStr(amcContract.endDate)}<br/>
    Amount: ${money(amcContract.amount)}<br/>
    Next service due: ${dateStr(amcContract.nextServiceDate)}</p>
    <p>Thank you for choosing ${COMPANY_NAME}, Vapi.</p>`;
  const smsText = `${COMPANY_NAME}: AMC activated for ${product.brand} ${product.modelName}. Valid till ${dateStr(amcContract.endDate)}. Next service: ${dateStr(amcContract.nextServiceDate)}.`;

  return dispatchAlert({
    recipientType: 'customer',
    event: 'AMC_PURCHASE_CONFIRMATION',
    name: client.name,
    email: client.email,
    phone: client.phone,
    subject,
    html,
    smsText,
    relatedModel: 'AMCContract',
    relatedId: amcContract._id,
  });
}

async function notifyServiceDueReminder({ client, product, amcContract, daysLeft }) {
  const subject = `Reminder: Servicing due in ${daysLeft} day(s)`;
  const html = `<p>Dear ${client.name},</p>
    <p>Your ${product.brand} ${product.modelName} servicing under AMC is due on
    <b>${dateStr(amcContract.nextServiceDate)}</b> (in ${daysLeft} day${daysLeft > 1 ? 's' : ''}).</p>
    <p>Our technician will contact you to schedule the visit.</p>`;
  const smsText = `${COMPANY_NAME}: Service due in ${daysLeft} day(s) for ${product.brand} ${product.modelName} on ${dateStr(amcContract.nextServiceDate)}.`;

  return dispatchAlert({
    recipientType: 'customer',
    event: 'SERVICE_DUE_REMINDER',
    name: client.name,
    email: client.email,
    phone: client.phone,
    subject,
    html,
    smsText,
    relatedModel: 'AMCContract',
    relatedId: amcContract._id,
  });
}

async function notifyServiceOverdue({ client, product, amcContract }) {
  const subject = `Overdue: Your servicing was missed`;
  const html = `<p>Dear ${client.name},</p>
    <p>Your scheduled servicing (due ${dateStr(amcContract.nextServiceDate)}) for
    ${product.brand} ${product.modelName} has not been completed. Please contact us to reschedule.</p>`;
  const smsText = `${COMPANY_NAME}: Servicing for ${product.brand} ${product.modelName} is OVERDUE (was due ${dateStr(amcContract.nextServiceDate)}). Please call us to reschedule.`;

  return dispatchAlert({
    recipientType: 'customer',
    event: 'SERVICE_OVERDUE',
    name: client.name,
    email: client.email,
    phone: client.phone,
    subject,
    html,
    smsText,
    relatedModel: 'AMCContract',
    relatedId: amcContract._id,
  });
}

async function notifyServiceCompleted({ client, product, visit }) {
  const subject = `Service Completed - Thank you!`;
  const html = `<p>Dear ${client.name},</p>
    <p>Servicing for your ${product ? `${product.brand} ${product.modelName}` : 'appliance'} was completed on
    ${dateStr(visit.completedDate || Date.now())}. We would love your feedback (rate us 1-5 stars).</p>`;
  const smsText = `${COMPANY_NAME}: Your service visit is complete. Please share feedback via the customer portal. Thank you!`;

  return dispatchAlert({
    recipientType: 'customer',
    event: 'SERVICE_COMPLETED',
    name: client.name,
    email: client.email,
    phone: client.phone,
    subject,
    html,
    smsText,
    relatedModel: 'ServiceVisit',
    relatedId: visit._id,
  });
}

async function notifyRenewalReminder({ client, product, amcContract, daysLeft }) {
  const renewLink = `${process.env.CLIENT_URL || ''}/customer/amc/${amcContract._id}/renew`;
  const subject = `Your AMC expires in ${daysLeft} days - Renew now`;
  const html = `<p>Dear ${client.name},</p>
    <p>Your AMC for ${product.brand} ${product.modelName} expires on <b>${dateStr(amcContract.endDate)}</b>
    (in ${daysLeft} days). Renew now to keep uninterrupted service coverage.</p>
    <p><a href="${renewLink}">Click here to renew</a></p>`;
  const smsText = `${COMPANY_NAME}: AMC for ${product.brand} ${product.modelName} expires in ${daysLeft} days (${dateStr(amcContract.endDate)}). Renew soon.`;

  return dispatchAlert({
    recipientType: 'customer',
    event: 'RENEWAL_REMINDER',
    name: client.name,
    email: client.email,
    phone: client.phone,
    subject,
    html,
    smsText,
    relatedModel: 'AMCContract',
    relatedId: amcContract._id,
  });
}

async function notifyPaymentPending({ client, payment }) {
  const subject = `Payment Pending - Invoice ${payment.invoiceNumber}`;
  const html = `<p>Dear ${client.name},</p>
    <p>Invoice <b>${payment.invoiceNumber}</b> for ${money(payment.amount)} is pending, due on ${dateStr(payment.dueDate)}.</p>`;
  const smsText = `${COMPANY_NAME}: Invoice ${payment.invoiceNumber} of ${money(payment.amount)} is pending, due ${dateStr(payment.dueDate)}.`;

  return dispatchAlert({
    recipientType: 'customer',
    event: 'PAYMENT_PENDING_REMINDER',
    name: client.name,
    email: client.email,
    phone: client.phone,
    subject,
    html,
    smsText,
    relatedModel: 'Payment',
    relatedId: payment._id,
  });
}

/* ------------------------- COMPANY / TECHNICIAN SIDE ------------------------- */

async function notifyDailyTaskList({ technician, visits }) {
  if (!visits.length) return null;
  const list = visits
    .map((v) => `- ${v.client?.name || 'Client'} (${v.client?.zone || ''}) at ${dateStr(v.scheduledDate)}`)
    .join('<br/>');
  const subject = `Your task list for today (${visits.length} visit${visits.length > 1 ? 's' : ''})`;
  const html = `<p>Hi ${technician.name},</p><p>Today's assigned visits:</p><p>${list}</p>`;
  const smsText = `${COMPANY_NAME}: You have ${visits.length} visit(s) today. Check the technician app for details.`;

  return dispatchAlert({
    recipientType: 'technician',
    event: 'DAILY_TASK_LIST',
    name: technician.name,
    email: technician.email,
    phone: technician.phone,
    subject,
    html,
    smsText,
  });
}

async function notifyNewJobAssignment({ technician, visit, client }) {
  const subject = `New job assigned: ${client.name}`;
  const html = `<p>Hi ${technician.name},</p>
    <p>A new visit has been assigned to you for <b>${client.name}</b> (${client.zone}) on ${dateStr(visit.scheduledDate)}.</p>`;
  const smsText = `${COMPANY_NAME}: New job assigned - ${client.name} (${client.zone}) on ${dateStr(visit.scheduledDate)}.`;

  return dispatchAlert({
    recipientType: 'technician',
    event: 'NEW_JOB_ASSIGNMENT',
    name: technician.name,
    email: technician.email,
    phone: technician.phone,
    subject,
    html,
    smsText,
    relatedModel: 'ServiceVisit',
    relatedId: visit._id,
  });
}

async function notifyOverdueEscalationToAdmin({ amcContract, client, product }) {
  const subject = `[Escalation] Overdue AMC service - ${client.name}`;
  const html = `<p>AMC service for <b>${client.name}</b> (${product.brand} ${product.modelName}) is overdue.
    Was due on ${dateStr(amcContract.nextServiceDate)}. Please follow up.</p>`;
  const smsText = `Escalation: Overdue AMC service for ${client.name}, was due ${dateStr(amcContract.nextServiceDate)}.`;

  return dispatchAlert({
    recipientType: 'admin',
    event: 'OVERDUE_ESCALATION',
    name: 'Admin',
    email: ADMIN_EMAIL,
    phone: ADMIN_PHONE,
    subject,
    html,
    smsText,
    relatedModel: 'AMCContract',
    relatedId: amcContract._id,
  });
}

async function notifyNewComplaintToTechnician({ technician, complaint, client }) {
  const subject = `New complaint assigned: Ticket ${complaint.ticketId}`;
  const html = `<p>Hi ${technician.name},</p>
    <p>New ${complaint.priority} priority complaint from <b>${client.name}</b> (${complaint.zone}):</p>
    <p>${complaint.description}</p>
    <p>Ticket: ${complaint.ticketId} | SLA: resolve by ${dateStr(complaint.slaDeadline)}</p>`;
  const smsText = `${COMPANY_NAME}: New complaint ${complaint.ticketId} from ${client.name} (${complaint.zone}). Priority: ${complaint.priority}.`;

  return dispatchAlert({
    recipientType: 'technician',
    event: 'NEW_COMPLAINT_ASSIGNED',
    name: technician.name,
    email: technician.email,
    phone: technician.phone,
    subject,
    html,
    smsText,
    relatedModel: 'Complaint',
    relatedId: complaint._id,
  });
}

async function notifyLowStockToAdmin({ sparePart }) {
  const subject = `Low stock alert: ${sparePart.name}`;
  const html = `<p>Spare part <b>${sparePart.name}</b> (${sparePart.code}) stock is low:
    ${sparePart.quantityInStock} left (threshold: ${sparePart.minStockThreshold}). Please reorder.</p>`;
  const smsText = `${COMPANY_NAME}: Low stock - ${sparePart.name} (${sparePart.quantityInStock} left). Please reorder.`;

  return dispatchAlert({
    recipientType: 'admin',
    event: 'LOW_STOCK_ALERT',
    name: 'Admin',
    email: ADMIN_EMAIL,
    phone: ADMIN_PHONE,
    subject,
    html,
    smsText,
    relatedModel: 'SparePart',
    relatedId: sparePart._id,
  });
}

module.exports = {
  notifyAmcPurchase,
  notifyServiceDueReminder,
  notifyServiceOverdue,
  notifyServiceCompleted,
  notifyRenewalReminder,
  notifyPaymentPending,
  notifyDailyTaskList,
  notifyNewJobAssignment,
  notifyOverdueEscalationToAdmin,
  notifyNewComplaintToTechnician,
  notifyLowStockToAdmin,
};
