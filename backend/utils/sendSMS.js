// Placeholder SMS sender - MSG91 / Fast2SMS jaisi providers ka shape follow karta hai.
// Live jaane par sirf yeh function ke andar ka fetch() call real API se replace karna hai,
// baaki poore app me kahi kuch change nahi karna padega.
async function sendSMS({ to, message }) {
  if (!to) throw new Error('sendSMS: recipient phone (to) is required');

  if (!process.env.SMS_API_KEY || process.env.SMS_API_KEY === 'demo_key') {
    console.log(`[sms:stub] -> ${to} :: ${message}`);
    return { success: true, provider: 'stub' };
  }

  // Real provider example (Fast2SMS):
  // const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
  //   method: 'POST',
  //   headers: { authorization: process.env.SMS_API_KEY, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ route: 'q', message, numbers: to }),
  // });
  // return res.json();

  console.log(`[sms:stub] -> ${to} :: ${message}`);
  return { success: true, provider: 'stub' };
}

module.exports = sendSMS;
