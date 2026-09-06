const nodemailer = require('nodemailer');

let cachedTransporter = null;
let cachedIsEthereal = false;

// Dev me real SMTP creds nahi hain to Ethereal ka free test inbox use karo
// (email actually kahi nahi jaata, bas ek preview URL milta hai console me)
async function getTransporter() {
  if (cachedTransporter) return { transporter: cachedTransporter, isEthereal: cachedIsEthereal };

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    cachedIsEthereal = false;
  } else {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    cachedIsEthereal = true;
    console.log('[email] No EMAIL_USER/PASS set -> using Ethereal test inbox for dev emails');
  }

  return { transporter: cachedTransporter, isEthereal: cachedIsEthereal };
}

async function sendEmail({ to, subject, html, text }) {
  if (!to) throw new Error('sendEmail: recipient (to) is required');
  const { transporter, isEthereal } = await getTransporter();

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Dynamic Cooling AMC" <no-reply@dynamiccooling.in>',
    to,
    subject,
    text: text || subject,
    html: html || `<p>${subject}</p>`,
  });

  if (isEthereal) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[email:preview] "${subject}" -> ${to} :: ${previewUrl}`);
  }

  return info;
}

module.exports = sendEmail;
