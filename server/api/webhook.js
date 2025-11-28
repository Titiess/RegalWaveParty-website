module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const raw = await new Promise((r, e) => {
      let d = '';
      req.on('data', c => d += c);
      req.on('end', () => r(d));
      req.on('error', e);
    });

    console.log('webhook headers:', req.headers);
    console.log('webhook raw body:', raw);

    let event;
    try { event = JSON.parse(raw); } catch (e) { return res.status(400).end(); }

    // TODO: implement Flutterwave signature verification here using FLW_SECRET_KEY
    console.log('webhook event:', event);

    // placeholder: respond ok
    res.status(200).send('ok');
  } catch (err) {
    console.error('webhook handler error', err);
    res.status(500).send('error');
  }
};
