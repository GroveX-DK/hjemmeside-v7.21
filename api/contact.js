const { MongoClient } = require('mongodb');
const { attachDatabasePool } = require('@vercel/functions');

const options = {
  appName: 'grovex.contact-form',
  maxIdleTimeMS: 5000,
};

const client = new MongoClient(process.env.MODE_BOOKINGER_MONGODB_URI, options);
attachDatabasePool(client.connect());

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { NAVN, VIRKSOMHED, TELEFON, EMAIL, DATO, TIDSPUNKT } = req.body;

  if (!NAVN || !EMAIL) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
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
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error('MongoDB error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
};
