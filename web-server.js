const express = require('express');
const cors = require('cors');
const { makeCorsConfig } = require('./cors');

/**
 * Create and start a web server to receive leads and forward to Telegram.
 * @param {Object} options
 * @param {string} options.BOT_TOKEN - Telegram bot token
 * @param {string} options.ADMIN_CHAT_ID - Admin chat ID
 * @param {string} options.AGENT_CHAT_ID - Agent chat ID
 * @param {function} [options.formatLead] - Optional function to format the lead message
 * @param {number} [options.port=3000] - Port to listen on
 * @param {object} [options.botInstance] - Optional Telegraf bot instance (for re-use)
 * @returns {object} The Express app instance
 */
/**
 * @param {Object} options
 * @param {Object} [options.cors] - Optional CORS config (see cors npm package)
 */
function createLeadWebServer({ BOT_TOKEN, ADMIN_CHAT_ID, AGENT_CHAT_ID, formatLead, port = 3000, botInstance, cors: corsOptions }) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID || !AGENT_CHAT_ID) {
    throw new Error('Missing BOT_TOKEN, ADMIN_CHAT_ID, or AGENT_CHAT_ID');
  }

  const { Telegraf } = require('telegraf');
  const bot = botInstance || new Telegraf(BOT_TOKEN);
  const app = express();
  app.use(express.json());
  // If consumer did not pass a `cors` config but provided `CORS_ORIGINS` (via secrets),
  // build the cors config internally from that value. This allows consumers to
  // simply set `CORS_ORIGINS` in their `secrets` without calling `makeCorsConfig()`.
  if (!corsOptions && typeof arguments[0] === 'object' && arguments[0].CORS_ORIGINS) {
    corsOptions = makeCorsConfig(arguments[0].CORS_ORIGINS);
  }

  if (corsOptions) {
    app.use(cors(corsOptions));
  } else {
    app.use(cors()); // allow all by default
  }

  app.post('/lead', async (req, res) => {
    const { name, phone, message } = req.body;
    const msg = formatLead
      ? formatLead({ name, phone, message })
      : `New lead from website:\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`;
    try {
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, msg);
      await bot.telegram.sendMessage(AGENT_CHAT_ID, msg);
      res.json({ ok: true });
    } catch (err) {
      console.error('Error sending lead:', err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  let server = null;
  if (port !== 0) {
    server = app.listen(port, () => {
      console.log(`Web server listening on port ${server.address().port}`);
    });
    return server;
  }

  // When port is 0 (tests), don't start listening to avoid open handles;
  // return the express app so tests can use supertest(app) without starting a server.
  console.log('Web server created (not listening) for test app');
  return app;
}

module.exports = { createLeadWebServer };
