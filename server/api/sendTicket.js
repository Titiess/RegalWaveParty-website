const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = await new Promise((r,e) => {
      let d=''; req.on('data', c => d+=c); req.on('end', () => r(JSON.parse(d||'{}'))); req.on('error', e);
    });

    const emailPayload = {
      personalizations: [{ to: [{ email: body.email }], subject: body.subject || 'Your ticket' }],
      from: { email: process.env.EMAIL_FROM || 'no-reply@yourdomain.com', name: 'RegalWave' },
      content: [{ type: 'text/plain', value: body.text || ('Your ticket ID: ' + (body.ticketId||'')) }]
    };

    const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': Bearer ,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    if (r.status >= 400) {
      const text = await r.text();
      console.error('sendgrid error', text);
      return res.status(502).json({ error: 'email error', detail: text });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
};
