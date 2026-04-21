const { Telegraf } = require('telegraf');

/**
 * Create a new Telegram Communication Agent bot instance.
 * @param {Object} config - Bot configuration (strings, flow, services, etc.)
 * @param {Object} secrets - Secrets (BOT_TOKEN, ADMIN_CHAT_ID, AGENT_CHAT_ID, FORWARD_TO_AGENT, etc.)
 * @returns {Telegraf} Configured Telegraf bot instance
 */
function createCommAgent(config, secrets) {
  if (!secrets.BOT_TOKEN || !secrets.ADMIN_CHAT_ID || !secrets.AGENT_CHAT_ID) {
    throw new Error('Missing BOT_TOKEN, ADMIN_CHAT_ID, or AGENT_CHAT_ID');
  }
  const bot = new Telegraf(secrets.BOT_TOKEN);
  bot.on('callback_query', async (ctx) => {
    const data = ctx.callbackQuery.data;
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
  });
  const userStates = {};
  const mainMenu = {
    reply_markup: {
      keyboard: [
        [config.BUTTONS.SERVICE_LIST, config.BUTTONS.CONTACT],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };
  const serviceMenu = {
    reply_markup: {
      keyboard: Object.values(config.SERVICES).map((s) => [s]),
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
  bot.start(async (ctx) => {
    await ctx.reply(config.STRINGS.WELCOME, mainMenu);
  });
  bot.hears(config.BUTTONS.SERVICE_LIST, async (ctx) => {
    userStates[ctx.from.id] = { step: 'service' };
    await ctx.reply(config.STRINGS.CHOOSE_SERVICE, serviceMenu);
  });
  bot.hears(config.BUTTONS.CONTACT, async (ctx) => {
    await ctx.reply(config.STRINGS.CONTACT_PROMPT, mainMenu);
  });
  bot.on('message', async (ctx) => {
    const user = ctx.from;
    const text = ctx.message.text || '[non-text message]';
    if ([config.BUTTONS.SERVICE_LIST, config.BUTTONS.CONTACT].includes(text)) return;
    const state = userStates[user.id];
    let flow = null;
    if (state && state.step === 'service') {
      const serviceKey = Object.keys(config.SERVICES).find(key => config.SERVICES[key] === text);
      if (!serviceKey) {
        await ctx.reply(config.STRINGS.INVALID_SERVICE, serviceMenu);
        return;
      }
      const flowKey = config.SERVICE_FLOW_MAP[serviceKey];
      const rawFlow = config.STEP_FLOWS[flowKey];
      if (!rawFlow) {
        // Generic user-facing message from config
        await ctx.reply(config.STRINGS.CONFIG_ERROR_USER || 'Unknown error');
        // Notify admin with detailed info (from config string prefix)
        try {
          const adminMsgPrefix = config.STRINGS.CONFIG_ERROR_ADMIN_PREFIX || 'Config error:';
          const detailed = `${adminMsgPrefix} missing flow for serviceKey='${serviceKey}' (flowKey='${flowKey}'). User input: "${text}" from @${user.username || user.first_name} (${user.id})`;
          await ctx.telegram.sendMessage(secrets.ADMIN_CHAT_ID, detailed);
        } catch (err) {
          console.error('Failed to notify admin about missing flow:', err);
        }
        return;
      }
      // Resolve rawFlow entries (keys) into {field,prompt} objects using STEP_DEFS when needed
      const resolvedFlow = rawFlow.map(f => {
        if (typeof f === 'string') {
          const prompt = (config.STEP_DEFS && config.STEP_DEFS[f]) || (config.STRINGS && (config.STRINGS.FLOW || []).find(x => x.field === f)?.prompt) || f;
          return { field: f, prompt };
        }
        return f;
      });
      userStates[user.id] = { step: resolvedFlow[0].field, service: serviceKey, flow: resolvedFlow };
      await ctx.reply(resolvedFlow[0].prompt);
      return;
    }
    if (state && state.flow && state.flow.some(f => f.field === state.step)) {
      flow = state.flow;
      const idx = flow.findIndex(f => f.field === state.step);
      const nextStep = flow[idx + 1];
      userStates[user.id] = { ...state, [state.step]: text };
      if (nextStep) {
        userStates[user.id].step = nextStep.field;
        await ctx.reply(nextStep.prompt);
        return;
      } else {
        const collected = { service: state.service };
        for (const f of flow) collected[f.field] = userStates[user.id][f.field] || text;
        await ctx.telegram.sendMessage(
          secrets.ADMIN_CHAT_ID,
          config.STRINGS.LEAD_TEMPLATE(collected, user),
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: config.STRINGS.APPROVE_BTN, callback_data: `approve:${user.id}` },
                  { text: config.STRINGS.REJECT_BTN, callback_data: `reject:${user.id}` }
                ]
              ]
            }
          }
        );
        await ctx.reply(config.STRINGS.LEAD_SENT, mainMenu);
        delete userStates[user.id];
        return;
      }
    }
    await ctx.telegram.sendMessage(
      secrets.ADMIN_CHAT_ID,
      config.STRINGS.MSG_TEMPLATE(user, text),
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: config.STRINGS.APPROVE_BTN, callback_data: `approve:${user.id}` },
              { text: config.STRINGS.REJECT_BTN, callback_data: `reject:${user.id}` }
            ]
          ]
        }
      }
    );
    await ctx.reply(config.STRINGS.MSG_SENT, mainMenu);
  });
  return bot;
}

module.exports = { createCommAgent };
