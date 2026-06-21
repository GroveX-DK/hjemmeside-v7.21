// DataFast Analytics — cookie-based tracking.
//
// Uses the official `datafast` npm package (v3.0.18). Because this is a static
// site with no bundler, the package is loaded as a native ES module from the
// jsDelivr CDN (same version that is pinned in package.json).
//
// "Cookie mode" (cookieless: false) is DataFast's default: it stores the
// visitor/session IDs in the first-party `datafast_visitor_id` cookie, which the
// backend reads in api/contact.js to attribute conversions to a visitor.
import { initDataFast } from 'https://cdn.jsdelivr.net/npm/datafast@3.0.18/+esm';

// Your DataFast website ID. It's public (DataFast exposes it in the page anyway),
// so hard-coding it here is fine.
const DATAFAST_WEBSITE_ID = 'dfid_6mkFlWs0Ci1sXNImp8mFA';

const datafast = await initDataFast({
  websiteId: DATAFAST_WEBSITE_ID,
  // Root domain so the cookie is shared across www. and apex (and any subdomains).
  domain: 'grovex.dk',
  // false = cookie-based tracking (sets the first-party datafast_visitor_id cookie).
  cookieless: false,
  // Track pageviews automatically on load (and on history navigation).
  autoCapturePageviews: true,
}).catch((err) => {
  console.error('DataFast init error:', err);
  return null;
});

// Expose the client so other inline scripts (e.g. custom button events) can use it:
//   window.datafast?.track('cta_click', { location: 'hero' });
if (datafast) {
  window.datafast = datafast;
}
