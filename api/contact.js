const { MongoClient } = require('mongodb');
const { Resend } = require('resend');

const mongoOptions = {
  appName: 'MODE_BOOKINGER',
  maxIdleTimeMS: 5000,
};

let cachedClient = null;

async function getClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MODE_BOOKINGER_MONGODB_URI, mongoOptions);
    await cachedClient.connect();
  }
  return cachedClient;
}

const resend = new Resend(process.env.RESEND);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { NAVN, VIRKSOMHED, TELEFON, EMAIL, DATO, TIDSPUNKT } = req.body;

  if (!NAVN || !EMAIL) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const client = await getClient();
    const db = client.db('MODE_BOOKINGER');
    const collection = db.collection('MODE_BOOKINGER');
    await collection.insertOne({
      NAVN,
      VIRKSOMHED,
      TELEFON,
      EMAIL,
      DATO,
      TIDSPUNKT,
      createdAt: new Date(),
    });

    res.status(201).json({ success: true });

    resend.emails.send({
      from: 'GroveX Booking <booking@grovex.dk>',
      to: 'grovex.dk@gmail.com',
      subject: `Ny booking fra ${NAVN}`,
      text: [
        `Navn:        ${NAVN}`,
        `Virksomhed:  ${VIRKSOMHED || '–'}`,
        `Telefon:     ${TELEFON || '–'}`,
        `Email:       ${EMAIL}`,
        `Dato:        ${DATO || '–'}`,
        `Tidspunkt:   ${TIDSPUNKT || '–'}`,
      ].join('\n'),
    }).catch(err => console.error('Email error:', err));

  } catch (err) {
    console.error('Booking error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
