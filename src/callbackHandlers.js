// src/callbackHandlers.js

const { getLead, deleteLead } = require('./leadStore');

async function handleCallbackQuery(ctx, config) {
  try {
    const data = ctx.callbackQuery.data;
    if (typeof console !== 'undefined' && console.log) console.log('[comm-agent] callback_query:', data);
    if (data.startsWith('forward_lead:')) {
      // Format: forward_lead:source:leadId
      const parts = data.split(':');
      const leadId = parts[2];
      const leadText = getLead(leadId);
      if (!leadText) {
        await ctx.answerCbQuery('Lead data expired or missing.');
        return;
      }
      // Forward to agent (you may want to get agent ID from config)
      await ctx.telegram.sendMessage(config.AGENT_CHAT_ID, leadText);
      await ctx.editMessageReplyMarkup();
      await ctx.answerCbQuery(config.STRINGS.APPROVED_CB || 'Forwarded to agent.');
      deleteLead(leadId);
    } else if (data.startsWith('no_forward_lead:')) {
      // Format: no_forward_lead:source:leadId
      const parts = data.split(':');
      const leadId = parts[2];
      await ctx.editMessageReplyMarkup();
      await ctx.answerCbQuery(config.STRINGS.REJECTED_CB || 'Not forwarded.');
      deleteLead(leadId);
    } else if (data.startsWith('approve:')) {
      await ctx.editMessageReplyMarkup(); // Remove inline keyboard
      await ctx.answerCbQuery(config.STRINGS.APPROVED_CB);
      // Optionally, notify the agent or user here
    } else if (data.startsWith('reject:')) {
      await ctx.editMessageReplyMarkup(); // Remove inline keyboard
      await ctx.answerCbQuery(config.STRINGS.REJECTED_CB);
    } else {
      await ctx.answerCbQuery(config.STRINGS.UNKNOWN_CB);
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.error) console.error('[comm-agent] Error in callback_query handler:', err);
    throw err;
  }
}

module.exports = { handleCallbackQuery };