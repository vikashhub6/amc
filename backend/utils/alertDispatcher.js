const sendEmail = require('./sendEmail');
const sendSMS = require('./sendSMS');
const AlertLog = require('../models/AlertLog');

/**
 * Dual-channel alert dispatcher - system ka core feature.
 * Har important event par isi function se guzarte hue Email + SMS dono
 * bhejte hain, aur result AlertLog collection me record hota hai (audit trail
 * ke liye + reports/dashboard me "alerts sent" dikhane ke liye).
 *
 * @param {Object} opts
 * @param {'customer'|'technician'|'admin'} opts.recipientType
 * @param {string} opts.event - e.g. 'AMC_PURCHASE_CONFIRMATION'
 * @param {string} opts.name
 * @param {string} [opts.email]
 * @param {string} [opts.phone]
 * @param {string} opts.subject - email subject / sms headline
 * @param {string} opts.html - email body (html)
 * @param {string} opts.smsText - short sms body
 * @param {string} [opts.relatedModel]
 * @param {string} [opts.relatedId]
 */
async function dispatchAlert({
  recipientType,
  event,
  name,
  email,
  phone,
  subject,
  html,
  smsText,
  relatedModel,
  relatedId,
}) {
  const results = [];

  if (email) {
    try {
      await sendEmail({ to: email, subject, html });
      results.push(
        await AlertLog.create({
          recipientType,
          recipientName: name,
          recipientEmail: email,
          event,
          channel: 'email',
          subject,
          message: html,
          status: 'sent',
          relatedModel,
          relatedId,
        })
      );
    } catch (err) {
      results.push(
        await AlertLog.create({
          recipientType,
          recipientName: name,
          recipientEmail: email,
          event,
          channel: 'email',
          subject,
          message: html,
          status: 'failed',
          errorMessage: err.message,
          relatedModel,
          relatedId,
        })
      );
    }
  }

  if (phone) {
    try {
      await sendSMS({ to: phone, message: smsText || subject });
      results.push(
        await AlertLog.create({
          recipientType,
          recipientName: name,
          recipientPhone: phone,
          event,
          channel: 'sms',
          message: smsText || subject,
          status: 'sent',
          relatedModel,
          relatedId,
        })
      );
    } catch (err) {
      results.push(
        await AlertLog.create({
          recipientType,
          recipientName: name,
          recipientPhone: phone,
          event,
          channel: 'sms',
          message: smsText || subject,
          status: 'failed',
          errorMessage: err.message,
          relatedModel,
          relatedId,
        })
      );
    }
  }

  return results;
}

module.exports = dispatchAlert;
