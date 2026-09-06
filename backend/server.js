require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { startAlertScheduler } = require('./services/alertScheduler');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Uploaded photos/signatures/invoices static serve
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is healthy' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/technicians', require('./routes/technicianRoutes'));
app.use('/api/amc', require('./routes/amcRoutes'));
app.use('/api/service-visits', require('./routes/serviceVisitRoutes'));
app.use('/api/spare-parts', require('./routes/sparePartRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/alert-logs', require('./routes/alertLogRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startAlertScheduler();
});
