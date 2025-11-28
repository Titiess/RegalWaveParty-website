const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  // Read raw body
  const raw = await new Promise((r, e) => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => r(d));
    req.on('error', e);
  });

  console.log('webhook headers:', req.headers);
  console.log('webhook raw body:', raw);

  // TODO: Replace the placeholder verification below with Flutterwave's exact method
  // Example placeholder (not production-secure):
  // const signature = req.headers['verif-hash'] || req.headers['x-flw-signature'];
  // const expected = crypto.createHmac('sha256', process.env.FLW_SECRET_KEY).update(raw).digest('hex');
  // if (signature !== expected) return res.status(400).send('invalid signature');

  let event;
  try { event = JSON.parse(raw); } catch (e) { return res.status(400).end(); }

  // Example handling: log and respond.
  console.log('webhook event:', event);

  // TODO: take actions e.g. verify payment, create ticket, send email
  res.status(200).send('ok');
};
