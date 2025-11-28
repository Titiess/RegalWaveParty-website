
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = await new Promise((resolve, reject) => {
      let d = '';
      req.on('data', c => (d += c));
      req.on('end', () => {
        try {
          resolve(JSON.parse(d || '{}'));
        } catch (err) {
          resolve({});
        }
      });
      req.on('error', reject);
    });

    // If SENDGRID_API_KEY present, send email via SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const emailPayload = {
        personalizations: [
          { to: [{ email: body.email || 'no-reply@example.com' }], subject: body.subject || 'Your ticket' }
        ],
        from: { email: process.env.EMAIL_FROM || 'no-reply@yourdomain.com', name: 'RegalWave' },
        content: [{ type: 'text/plain', value: body.text || ('Your ticket ID: ' + (body.ticketId || '')) }]
      };

      const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });

      if (r.status >= 400) {
        const text = await r.text();
        console.error('sendgrid error', text);
        return res.status(502).json({ error: 'email error', detail: text });
      }

      return res.status(200).json({ ok: true, method: 'email' });
    }

    // Default behavior: return ticket payload in response so frontend can show it
    return res.status(200).json({
      ok: true,
      method: 'response',
      ticket: { ticketId: body.ticketId || null, data: body }
    });
  } catch (err) {
    console.error('sendTicket handler error', err);
    return res.status(500).json({ error: 'server error' });
  }
};
