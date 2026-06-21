// Serves the public DataFast website ID from an env var so it isn't hard-coded
// in the client bundle. Set DATAFAST_WEBSITE_ID in your Vercel project settings.
//
// Note: the website ID is public by design (DataFast's own script exposes it in
// the page), so this endpoint just centralises configuration — it is not a secret.
module.exports = function handler(req, res) {
  // Cache at the edge so this isn't hit on every pageview.
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');
  res.status(200).json({
    websiteId: process.env.DATAFAST_WEBSITE_ID || '',
    domain: process.env.DATAFAST_DOMAIN || 'grovex.dk',
  });
};
