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

async function forwardToAdmin(bot, adminId, text, opts = {}) {
  await bot.telegram.sendMessage(adminId, text, opts);
}

async function forwardToAgent(bot, agentId, text, opts = {}) {
  await bot.telegram.sendMessage(agentId, text, opts);
}

module.exports = { forwardMessage, forwardToAdmin, forwardToAgent };