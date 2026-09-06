// node-cron se chalne wale saare daily automated alert jobs yaha hain.
// Yeh file server.js se ek baar require/start hoti hai. Har job apna kaam
// karke AMCContract.remindersSent flags update karta hai taaki duplicate
// alert dobara na jaye.
const cron = require('node-cron');
const AMCContract = require('../models/AMCContract');
const Client = require('../models/Client');
const Product = require('../models/Product');
const Payment = require('../models/Payment');
const Technician = require('../models/Technician');
const ServiceVisit = require('../models/ServiceVisit');
const SparePart = require('../models/SparePart');
const {
  notifyServiceDueReminder,
  notifyServiceOverdue,
  notifyOverdueEscalationToAdmin,
  notifyRenewalReminder,
  notifyPaymentPending,
  notifyDailyTaskList,
  notifyLowStockToAdmin,
} = require('./alertEvents');

const daysBetween = (a, b) => Math.ceil((new Date(a) - new Date(b)) / (1000 * 60 * 60 * 24));

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// 1) Servicing due reminder: 7 din, 3 din, 1 din pehle
async function checkServiceDueReminders() {
  const today = startOfToday();
  const contracts = await AMCContract.find({ status: { $in: ['active', 'expiring_soon'] } });

  for (const contract of contracts) {
    const diff = daysBetween(contract.nextServiceDate, today);
    const client = await Client.findById(contract.client);
    const product = await Product.findById(contract.product);
    if (!client || !product) continue;

    if (diff === 7 && !contract.remindersSent.serviceDue7) {
      await notifyServiceDueReminder({ client, product, amcContract: contract, daysLeft: 7 });
      contract.remindersSent.serviceDue7 = true;
      await contract.save();
    } else if (diff === 3 && !contract.remindersSent.serviceDue3) {
      await notifyServiceDueReminder({ client, product, amcContract: contract, daysLeft: 3 });
      contract.remindersSent.serviceDue3 = true;
      await contract.save();
    } else if (diff === 1 && !contract.remindersSent.serviceDue1) {
      await notifyServiceDueReminder({ client, product, amcContract: contract, daysLeft: 1 });
      contract.remindersSent.serviceDue1 = true;
      await contract.save();
    }
  }
}

// 2) Overdue alert - servicing miss ho gayi (nextServiceDate nikal gayi)
async function checkOverdueServices() {
  const today = startOfToday();
  const contracts = await AMCContract.find({
    status: { $in: ['active', 'expiring_soon'] },
    nextServiceDate: { $lt: today },
    'remindersSent.overdue': false,
  });

  for (const contract of contracts) {
    const client = await Client.findById(contract.client);
    const product = await Product.findById(contract.product);
    if (!client || !product) continue;

    await notifyServiceOverdue({ client, product, amcContract: contract });
    await notifyOverdueEscalationToAdmin({ client, product, amcContract: contract });

    contract.remindersSent.overdue = true;
    await contract.save();
  }
}

// 3) Renewal reminder - expiry se 30/15 din pehle
async function checkRenewalReminders() {
  const today = startOfToday();
  const contracts = await AMCContract.find({ status: { $in: ['active', 'expiring_soon'] } });

  for (const contract of contracts) {
    const diff = daysBetween(contract.endDate, today);
    const client = await Client.findById(contract.client);
    const product = await Product.findById(contract.product);
    if (!client || !product) continue;

    if (diff <= 30 && diff > 15 && !contract.remindersSent.renewal30) {
      await notifyRenewalReminder({ client, product, amcContract: contract, daysLeft: diff });
      contract.remindersSent.renewal30 = true;
      contract.status = 'expiring_soon';
      await contract.save();
    } else if (diff <= 15 && diff > 0 && !contract.remindersSent.renewal15) {
      await notifyRenewalReminder({ client, product, amcContract: contract, daysLeft: diff });
      contract.remindersSent.renewal15 = true;
      contract.status = 'expiring_soon';
      await contract.save();
    } else if (diff <= 0 && contract.status !== 'expired') {
      contract.status = 'expired';
      await contract.save();
    }
  }
}

// 4) Payment/invoice pending reminder + overdue marking
async function checkPendingPayments() {
  const today = startOfToday();
  const pending = await Payment.find({ status: 'pending' });

  for (const payment of pending) {
    if (new Date(payment.dueDate) < today) {
      payment.status = 'overdue';
      await payment.save();
    }
    if (!payment.reminderSent) {
      const client = await Client.findById(payment.client);
      if (client) {
        await notifyPaymentPending({ client, payment });
        payment.reminderSent = true;
        await payment.save();
      }
    }
  }
}

// 5) Company/Technician side: aaj ki task list har technician ko subah bhejo
async function sendDailyTaskLists() {
  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const technicians = await Technician.find({ isAvailable: true });
  for (const technician of technicians) {
    const visits = await ServiceVisit.find({
      technician: technician._id,
      scheduledDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['scheduled', 'in_progress'] },
    }).populate('client', 'name zone');

    await notifyDailyTaskList({ technician, visits });
  }
}

// 6) Spare part low-stock safety-net sweep (adjustStock/completeVisit bhi
// real-time check karte hain, yeh daily sweep sirf missed cases catch karta hai)
async function checkLowStockSweep() {
  const lowStockParts = await SparePart.find({ lowStockAlertSent: false });
  for (const part of lowStockParts) {
    if (part.quantityInStock <= part.minStockThreshold) {
      await notifyLowStockToAdmin({ sparePart: part });
      part.lowStockAlertSent = true;
      await part.save();
    }
  }
}

async function runAllDailyChecks() {
  console.log(`[alertScheduler] Running daily checks @ ${new Date().toISOString()}`);
  try {
    await checkServiceDueReminders();
    await checkOverdueServices();
    await checkRenewalReminders();
    await checkPendingPayments();
    await sendDailyTaskLists();
    await checkLowStockSweep();
    console.log('[alertScheduler] Daily checks completed successfully');
  } catch (err) {
    console.error('[alertScheduler] Error during daily checks:', err.message);
  }
}

// Har din subah 8:00 baje (server timezone) saare alert jobs chalao
function startAlertScheduler() {
  cron.schedule('0 8 * * *', runAllDailyChecks);
  console.log('[alertScheduler] Scheduled daily alert job at 08:00');
}

module.exports = { startAlertScheduler, runAllDailyChecks };
