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

const resend = new Resend(process.env.RESEND_API_KEY);

// Read a single cookie value from the raw Cookie header.
function getCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

// Fire a server-side DataFast goal, attributed to the visitor via the
// datafast_visitor_id cookie that the client-side tracker (datafast.js) set.
// Fire-and-forget: never block or fail the request on analytics.
async function trackDatafastGoal(req, name, metadata) {
  const apiKey = process.env.DATAFAST_API_KEY;
  if (!apiKey) return; // Not configured — skip silently.

  const visitorId = getCookie(req.headers.cookie, 'datafast_visitor_id');
  if (!visitorId) return; // Visitor was never tracked (e.g. cookies blocked).

  try {
    const resp = await fetch('https://datafa.st/api/v1/goals', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ datafast_visitor_id: visitorId, name, metadata }),
    });
    if (!resp.ok) {
      console.error('DataFast goal error:', resp.status, await resp.text());
    }
  } catch (err) {
    console.error('DataFast goal error:', err);
  }
}

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

    // Track the booking as a DataFast conversion goal (cookie-attributed).
    trackDatafastGoal(req, 'booking', {
      company: VIRKSOMHED || '',
    });

    resend.emails.send({
      from: 'GroveX Booking <Booking@grovex.dk>',
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
