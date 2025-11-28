const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const payload = await new Promise((r, e) => {
      let d = '';
      req.on('data', c => d += c);
      req.on('end', () => r(JSON.parse(d || '{}')));
      req.on('error', e);
    });

    const r = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Bearer 
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    res.status(r.ok ? 200 : 502).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
};
