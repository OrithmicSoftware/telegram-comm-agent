// CORS config helper for telegram-comm-agent
// Accepts origins from config, not from env

/**
 * @param {string[]|string|false} origins - Allowed origins (array, string, or false to disable)
 * @returns {object} CORS config for Express
 */
function makeCorsConfig(origins) {
  let allowed = origins;
  if (typeof origins === 'string') {
    allowed = origins.split(',').map(s => s.trim());
  }
  if (allowed === false) return { origin: false };
  if (Array.isArray(allowed) && allowed.length === 0) return { origin: false };
  return {
    origin: allowed,
    methods: ['POST'],
    credentials: false,
  };
}

module.exports = { makeCorsConfig };
