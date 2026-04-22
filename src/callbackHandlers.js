// src/callbackHandlers.js

async function handleCallbackQuery(ctx, config) {
  try {
    const data = ctx.callbackQuery.data;
    if (typeof console !== 'undefined' && console.log) console.log('[comm-agent] callback_query:', data);
    if (data.startsWith('approve:')) {
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