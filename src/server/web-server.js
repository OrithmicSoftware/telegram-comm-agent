// Moved from root to src/server/web-server.js
const Telegraf = require('telegraf').Telegraf;
const express = require('express');
const cors = require('cors');
const { makeCorsConfig } = require('../utils/cors');

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

  const bot = botInstance || new Telegraf(BOT_TOKEN);
  const app = express();
  app.use(express.json());
  if (!corsOptions && typeof arguments[0] === 'object' && arguments[0].CORS_ORIGINS) {
    corsOptions = makeCorsConfig(arguments[0].CORS_ORIGINS);
  }

  if (corsOptions) {
    app.use(cors(corsOptions));
  } else {
    app.use(cors());
  }

  app.post('/lead', async (req, res) => {
    const { name, phone, message } = req.body;
    // Validation: all fields required and must be non-empty strings
    if (!name || typeof name !== 'string' || !name.trim() ||
        !phone || typeof phone !== 'string' || !phone.trim() ||
        !message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ ok: false, error: 'Missing or empty required fields' });
    }
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

  console.log('Web server created (not listening) for test app');
  return app;
}

module.exports = { createLeadWebServer };
