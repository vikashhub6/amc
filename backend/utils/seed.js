// Ek baar chalane wala seed script - admin + 2 technicians + spare parts bana deta hai
// taaki fresh DB par turant login/testing shuru ki ja sake.
// Run: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Technician = require("../models/Technician");
const SparePart = require("../models/SparePart");
const Client = require("../models/Client");
const Product = require("../models/Product");
const AMCContract = require("../models/AMCContract");
const Complaint = require("../models/Complaint");
const ServiceVisit = require("../models/ServiceVisit");
const Payment = require("../models/Payment");
const Feedback = require("../models/Feedback");
const AlertLog = require("../models/AlertLog");

async function seed() {
  await connectDB();

  // Remove an obsolete unique index from an older Firebase-based schema.
  const userIndexes = await mongoose.connection.db
    .collection("users")
    .indexes();
  if (userIndexes.some((index) => index.name === "firebaseUid_1")) {
    await mongoose.connection.db.collection("users").dropIndex("firebaseUid_1");
    console.log("Removed obsolete firebaseUid index.");
  }

  const adminEmail = "admin@dynamiccooling.in";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "Admin",
      email: adminEmail,
      phone: "9999900000",
      password: "admin123",
      role: "admin",
    });
    console.log(`Admin created -> email: ${adminEmail} / password: admin123`);
  } else {
    console.log("Admin already exists, skipping.");
  }

  const techSeed = [
    {
      name: "Ramesh Patel",
      email: "ramesh.tech@dynamiccooling.in",
      phone: "9998800001",
      zones: ["GIDC Vapi", "Vapi Station"],
      specialization: ["AC", "Refrigerator"],
    },
    {
      name: "Suresh Desai",
      email: "suresh.tech@dynamiccooling.in",
      phone: "9998800002",
      zones: ["Chala", "Dungra"],
      specialization: ["Cooler", "Deep Freezer"],
    },
  ];

  for (const t of techSeed) {
    const existingUser = await User.findOne({ email: t.email });
    if (existingUser) {
      console.log(`Technician ${t.name} already exists, skipping.`);
      continue;
    }
    const user = await User.create({
      name: t.name,
      email: t.email,
      phone: t.phone,
      password: "tech123",
      role: "technician",
    });
    const technician = await Technician.create({
      user: user._id,
      name: t.name,
      phone: t.phone,
      email: t.email,
      zones: t.zones,
      specialization: t.specialization,
    });
    user.technician = technician._id;
    await user.save();
    console.log(`Technician created -> email: ${t.email} / password: tech123`);
  }

  const partsSeed = [
    {
      name: "Compressor 1.5 Ton",
      code: "CMP-1.5T",
      category: "AC",
      quantityInStock: 10,
      minStockThreshold: 3,
      unitPrice: 4500,
    },
    {
      name: "Refrigerant Gas R32 (kg)",
      code: "GAS-R32",
      category: "AC",
      quantityInStock: 20,
      minStockThreshold: 5,
      unitPrice: 650,
    },
    {
      name: "Thermostat",
      code: "THRM-01",
      category: "Refrigerator",
      quantityInStock: 2,
      minStockThreshold: 5,
      unitPrice: 350,
    },
    {
      name: "Capacitor 2.5uF",
      code: "CAP-2.5",
      category: "AC",
      quantityInStock: 15,
      minStockThreshold: 5,
      unitPrice: 180,
    },
  ];

  for (const p of partsSeed) {
    const existing = await SparePart.findOne({ code: p.code });
    if (!existing) {
      await SparePart.create(p);
      console.log(`Spare part created: ${p.name}`);
    }
  }

  const demoClients = [
    [
      "Aarav Shah",
      "9876500001",
      "aarav.shah@example.com",
      "GIDC Vapi",
      "AC",
      "Voltas",
      "DEMO-AC-001",
      "Standard",
    ],
    [
      "Diya Patel",
      "9876500002",
      "diya.patel@example.com",
      "Vapi Station",
      "Refrigerator",
      "LG",
      "DEMO-REF-002",
      "Basic",
    ],
    [
      "Raj Mehta",
      "9876500003",
      "raj.mehta@example.com",
      "Chala",
      "AC",
      "Daikin",
      "DEMO-AC-003",
      "Premium",
    ],
    [
      "Neha Desai",
      "9876500004",
      "neha.desai@example.com",
      "Dungra",
      "Cooler",
      "Symphony",
      "DEMO-COOL-004",
      "Basic",
    ],
    [
      "Vivaan Joshi",
      "9876500005",
      "vivaan.joshi@example.com",
      "Salvav",
      "Deep Freezer",
      "Blue Star",
      "DEMO-DF-005",
      "Standard",
    ],
    [
      "Isha Shah",
      "9876500006",
      "isha.shah@example.com",
      "Char Rasta",
      "AC",
      "LG",
      "DEMO-AC-006",
      "Premium",
    ],
    [
      "Kabir Patel",
      "9876500007",
      "kabir.patel@example.com",
      "Killa Pardi",
      "Water Cooler",
      "Voltas",
      "DEMO-WC-007",
      "Standard",
    ],
    [
      "Anaya Mehta",
      "9876500008",
      "anaya.mehta@example.com",
      "Silvassa Road",
      "Refrigerator",
      "Samsung",
      "DEMO-REF-008",
      "Basic",
    ],
    [
      "Arjun Desai",
      "9876500009",
      "arjun.desai@example.com",
      "GIDC Vapi",
      "AC",
      "Carrier",
      "DEMO-AC-009",
      "Standard",
    ],
    [
      "Meera Joshi",
      "9876500010",
      "meera.joshi@example.com",
      "Chala",
      "Cooler",
      "Bajaj",
      "DEMO-COOL-010",
      "Basic",
    ],
    [
      "Rohan Shah",
      "9876500011",
      "rohan.shah@example.com",
      "Dungra",
      "Deep Freezer",
      "Voltas",
      "DEMO-DF-011",
      "Premium",
    ],
    [
      "Sara Patel",
      "9876500012",
      "sara.patel@example.com",
      "Vapi Station",
      "AC",
      "Hitachi",
      "DEMO-AC-012",
      "Standard",
    ],
  ];

  const demoRecords = [];
  for (let index = 0; index < demoClients.length; index += 1) {
    const [name, phone, email, zone, category, brand, serialNumber, planType] =
      demoClients[index];
    let client = await Client.findOne({ email });
    if (!client) {
      client = await Client.create({
        name,
        phone,
        email,
        address: `${index + 1}, Main Road, ${zone}`,
        city: "Vapi",
        pincode: "396191",
        zone,
        notes: "Demo record for dashboard testing",
      });
    }

    let product = await Product.findOne({ serialNumber });
    if (!product) {
      product = await Product.create({
        client: client._id,
        category,
        brand,
        modelName: `${brand} ${category}`,
        serialNumber,
        purchaseDate: new Date(
          Date.now() - (index + 3) * 30 * 24 * 60 * 60 * 1000,
        ),
        warrantyExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        installationAddress: client.address,
      });
    }

    let amc = await AMCContract.findOne({
      client: client._id,
      product: product._id,
    });
    if (!amc) {
      const startDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      const nextServiceDate = new Date();
      nextServiceDate.setDate(nextServiceDate.getDate() + index + 5);
      amc = await AMCContract.create({
        client: client._id,
        product: product._id,
        planType,
        amount:
          planType === "Basic" ? 8500 : planType === "Standard" ? 14500 : 22000,
        startDate,
        endDate,
        totalServicesIncluded:
          planType === "Basic" ? 2 : planType === "Standard" ? 3 : 4,
        servicesCompleted: index % 2,
        serviceFrequencyMonths: planType === "Basic" ? 6 : 4,
        nextServiceDate,
        status: "active",
      });
    }
    demoRecords.push({ client, product, amc });
  }

  const customerUsers = [];
  for (let index = 0; index < 3; index += 1) {
    const record = demoRecords[index];
    const email = record.client.email;
    let customerUser = await User.findOne({ email });
    if (!customerUser) {
      customerUser = await User.create({
        name: record.client.name,
        email,
        phone: record.client.phone,
        password: "customer123",
        role: "customer",
        client: record.client._id,
      });
      console.log(`Demo customer login created: ${email} / customer123`);
    } else if (!customerUser.client || String(customerUser.client) !== String(record.client._id)) {
      customerUser.client = record.client._id;
      await customerUser.save();
    }
    customerUsers.push(customerUser);
  }

  const technicians = await Technician.find().limit(2);
  for (let index = 0; index < 4 && technicians.length; index += 1) {
    const { client, product } = demoRecords[index];
    const ticketId = `DEMO-${String(index + 1).padStart(3, "0")}`;
    let complaint = await Complaint.findOne({ ticketId });
    if (!complaint) {
      complaint = await Complaint.create({
        ticketId,
        client: client._id,
        product: product._id,
        description: [
          "AC is not cooling properly",
          "Refrigerator making noise",
          "Indoor unit water leakage",
          "Cooler pump not working",
        ][index],
        zone: client.zone,
        priority: ["high", "medium", "critical", "low"][index],
        status: index === 0 ? "open" : "assigned",
        assignedTechnician: technicians[index % technicians.length]._id,
      });
    }
    if (!(await ServiceVisit.findOne({ complaint: complaint._id }))) {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + index + 1);
      await ServiceVisit.create({
        complaint: complaint._id,
        client: client._id,
        product: product._id,
        technician: technicians[index % technicians.length]._id,
        type: "complaint",
        scheduledDate,
        status: "scheduled",
      });
    }
  }

  for (let index = 0; index < 6 && technicians.length; index += 1) {
    const record = demoRecords[index];
    const visitKey = `DEMO-CUSTOMER-VISIT-${String(index + 1).padStart(3, "0")}`;
    const existingVisit = await ServiceVisit.findOne({ technician: technicians[index % technicians.length]._id, client: record.client._id, type: "routine", technicianNotes: visitKey });
    if (!existingVisit) {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() - (index < 3 ? index + 1 : -(index + 1)));
      await ServiceVisit.create({
        amcContract: record.amc._id,
        client: record.client._id,
        product: record.product._id,
        technician: technicians[index % technicians.length]._id,
        type: "routine",
        scheduledDate,
        completedDate: index < 3 ? new Date() : undefined,
        status: index < 3 ? "completed" : "scheduled",
        technicianNotes: visitKey,
      });
      console.log(`Customer dashboard visit created: ${visitKey}`);
    }
  }

  const payments = [
    {
      invoiceNumber: "DEMO-INV-001",
      status: "paid",
      method: "upi",
      amount: 14500,
    },
    {
      invoiceNumber: "DEMO-INV-002",
      status: "paid",
      method: "cash",
      amount: 8500,
    },
    { invoiceNumber: "DEMO-INV-003", status: "pending", amount: 22000 },
    { invoiceNumber: "DEMO-INV-004", status: "overdue", amount: 6500 },
    {
      invoiceNumber: "DEMO-INV-005",
      status: "paid",
      method: "bank_transfer",
      amount: 12500,
    },
    { invoiceNumber: "DEMO-INV-006", status: "pending", amount: 15000 },
  ];
  for (let index = 0; index < payments.length; index += 1) {
    const paymentData = payments[index];
    if (
      !(await Payment.findOne({ invoiceNumber: paymentData.invoiceNumber }))
    ) {
      const dueDate = new Date();
      dueDate.setDate(
        dueDate.getDate() - (paymentData.status === "overdue" ? 10 : -15),
      );
      const payment = await Payment.create({
        ...paymentData,
        client: demoRecords[index].client._id,
        amcContract: demoRecords[index].amc._id,
        dueDate,
        paidDate: paymentData.status === "paid" ? new Date() : undefined,
        reminderSent: paymentData.status !== "paid",
      });
      console.log(`Demo payment created: ${payment.invoiceNumber}`);
    }
  }

  for (let index = 0; index < 4 && technicians.length; index += 1) {
    const visit = await ServiceVisit.findOne({
      complaint: (
        await Complaint.findOne({
          ticketId: `DEMO-${String(index + 1).padStart(3, "0")}`,
        })
      )._id,
    });
    if (visit && !(await Feedback.findOne({ serviceVisit: visit._id }))) {
      await Feedback.create({
        client: demoRecords[index].client._id,
        serviceVisit: visit._id,
        technician: technicians[index % technicians.length]._id,
        rating: [5, 4, 5, 3][index],
        comment: [
          "Quick and professional service",
          "Technician explained the issue clearly",
          "Cooling restored successfully",
          "Good service, follow-up needed",
        ][index],
      });
      console.log(`Demo feedback created for: ${visit._id}`);
    }
  }

  const alertEvents = [
    ["customer", "AMC_PURCHASE", "email", "AMC contract created"],
    ["customer", "SERVICE_DUE_REMINDER", "sms", "Upcoming service reminder"],
    ["technician", "NEW_JOB_ASSIGNED", "email", "New service visit assigned"],
    ["admin", "LOW_STOCK_ALERT", "email", "Spare part stock is low"],
    ["customer", "PAYMENT_PENDING", "email", "Payment pending reminder"],
    ["technician", "OVERDUE_ESCALATION", "sms", "Complaint requires attention"],
    ["customer", "SERVICE_COMPLETED", "email", "Service visit completed"],
    ["admin", "DAILY_TASK_LIST", "email", "Daily operations summary"],
  ];
  for (let index = 0; index < alertEvents.length; index += 1) {
    const [recipientType, event, channel, message] = alertEvents[index];
    const recipient =
      recipientType === "admin"
        ? {
            name: "Admin",
            email: "admin@dynamiccooling.in",
            phone: "9999900000",
          }
        : {
            name: demoRecords[index % demoRecords.length].client.name,
            email: demoRecords[index % demoRecords.length].client.email,
            phone: demoRecords[index % demoRecords.length].client.phone,
          };
    if (!(await AlertLog.findOne({ event, message: `DEMO: ${message}` }))) {
      await AlertLog.create({
        recipientType,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        recipientPhone: recipient.phone,
        event,
        channel,
        subject: `Demo ${event}`,
        message: `DEMO: ${message}`,
        status: "sent",
      });
      console.log(`Demo alert created: ${event}`);
    }
  }

  console.log("\nSeed complete.");
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
