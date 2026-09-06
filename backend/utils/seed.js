// Ek baar chalane wala seed script - admin + 2 technicians + spare parts bana deta hai
// taaki fresh DB par turant login/testing shuru ki ja sake.
// Run: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Technician = require('../models/Technician');
const SparePart = require('../models/SparePart');

async function seed() {
  await connectDB();

  const adminEmail = 'admin@dynamiccooling.in';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      phone: '9999900000',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`Admin created -> email: ${adminEmail} / password: admin123`);
  } else {
    console.log('Admin already exists, skipping.');
  }

  const techSeed = [
    { name: 'Ramesh Patel', email: 'ramesh.tech@dynamiccooling.in', phone: '9998800001', zones: ['GIDC Vapi', 'Vapi Station'], specialization: ['AC', 'Refrigerator'] },
    { name: 'Suresh Desai', email: 'suresh.tech@dynamiccooling.in', phone: '9998800002', zones: ['Chala', 'Dungra'], specialization: ['Cooler', 'Deep Freezer'] },
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
      password: 'tech123',
      role: 'technician',
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
    { name: 'Compressor 1.5 Ton', code: 'CMP-1.5T', category: 'AC', quantityInStock: 10, minStockThreshold: 3, unitPrice: 4500 },
    { name: 'Refrigerant Gas R32 (kg)', code: 'GAS-R32', category: 'AC', quantityInStock: 20, minStockThreshold: 5, unitPrice: 650 },
    { name: 'Thermostat', code: 'THRM-01', category: 'Refrigerator', quantityInStock: 2, minStockThreshold: 5, unitPrice: 350 },
    { name: 'Capacitor 2.5uF', code: 'CAP-2.5', category: 'AC', quantityInStock: 15, minStockThreshold: 5, unitPrice: 180 },
  ];

  for (const p of partsSeed) {
    const existing = await SparePart.findOne({ code: p.code });
    if (!existing) {
      await SparePart.create(p);
      console.log(`Spare part created: ${p.name}`);
    }
  }

  console.log('\nSeed complete.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
