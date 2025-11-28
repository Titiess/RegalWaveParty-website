
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // read JSON body safely
    const payload = await new Promise((resolve, reject) => {
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

    if (!process.env.FLW_SECRET_KEY) {
      console.error('missing FLW_SECRET_KEY');
      return res.status(500).json({ error: 'server misconfigured' });
    }

    const resp = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();
    return res.status(resp.ok ? 200 : 502).json(data);
  } catch (err) {
    console.error('charge handler error', err);
    return res.status(500).json({ error: 'server error' });
  }
};
