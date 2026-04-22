// src/handleLeadForwarding.js
/**
 * Handles forwarding a lead according to config.
 * @param {Object} bot - Telegraf bot instance
 * @param {Object} config - Bot config (must include ADMIN_CHAT_ID, AGENT_CHAT_ID, FORWARD_TO_AGENT, STRINGS)
 * @param {string} leadText - The formatted lead text
 * @param {Object} [options] - Optional context for callback (e.g. ctx for Telegram, res for web)
 * @returns {Promise<'all'|'admin'|'ask'>} - How the lead was forwarded
 */
async function handleLeadForwarding(bot, config, leadText, options = {}) {
  if (config.FORWARD_TO_AGENT === 'all') {
    await bot.telegram.sendMessage(config.ADMIN_CHAT_ID, leadText);
    await bot.telegram.sendMessage(config.AGENT_CHAT_ID, leadText);
    if (options.ctx) await options.ctx.reply('Ваша заявка отправлена администратору и агенту.');
    if (options.res) options.res.json({ ok: true, forwarded: 'all' });
    return 'all';
  } else if (config.FORWARD_TO_AGENT === 'no') {
    await bot.telegram.sendMessage(config.ADMIN_CHAT_ID, leadText);
    if (options.ctx) await options.ctx.reply('Ваша заявка отправлена администратору.');
    if (options.res) options.res.json({ ok: true, forwarded: 'admin' });
    return 'admin';
  } else {
    // 'ask' mode: prompt admin with inline buttons
    await bot.telegram.sendMessage(config.ADMIN_CHAT_ID, leadText, {
      reply_markup: {
        inline_keyboard: [[
          { text: config.STRINGS.FORWARD_BTN, callback_data: `forward_lead:${options.source || 'web'}:${Buffer.from(leadText).toString('base64')}` },
          { text: config.STRINGS.NO_FORWARD_BTN, callback_data: `no_forward_lead:${options.source || 'web'}` }
        ]]
      }
    });
    if (options.ctx) await options.ctx.reply('Ваша заявка отправлена администратору на рассмотрение.');
    if (options.res) options.res.json({ ok: true, forwarded: 'ask' });
    return 'ask';
  }
}

module.exports = handleLeadForwarding;
