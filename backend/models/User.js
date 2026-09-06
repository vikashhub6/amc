const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, default: 'customer' },
    // Role ke hisaab se linked profile document (Client ya Technician)
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Password ko save se pehle hash karo, sirf jab modify hui ho
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
