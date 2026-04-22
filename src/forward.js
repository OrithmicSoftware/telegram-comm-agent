// src/forward.js

/**
 * Forward a message to admin/agent according to FORWARD_TO_AGENT
 */
async function forwardMessage(bot, config, secrets, text, opts = {}) {
  if (config.FORWARD_TO_AGENT === 'all') {
    await bot.telegram.sendMessage(secrets.ADMIN_CHAT_ID, text, opts);
    await bot.telegram.sendMessage(secrets.AGENT_CHAT_ID, text, opts);
  } else {
    await bot.telegram.sendMessage(secrets.ADMIN_CHAT_ID, text, opts);
  }
}

module.exports = { forwardMessage };