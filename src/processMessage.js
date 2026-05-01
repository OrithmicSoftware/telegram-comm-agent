// src/processMessage.js
const { forwardMessage } = require('./forward');
const handleLeadForwarding = require('./handleLeadForwarding');

function makeProcessMessage({ config, secrets, userStates, mainMenu, serviceMenu, bot }) {
  return async function processMessage(ctx) {
    if (typeof console !== 'undefined' && console.log) console.log('[comm-agent] processMessage from', ctx.from && ctx.from.id, 'text:', ctx.message && ctx.message.text);
    const user = ctx.from;
    const text = ctx.message && ctx.message.text ? ctx.message.text : '[non-text message]';
    if ([config.BUTTONS.SERVICE_LIST, config.BUTTONS.CONTACT].includes(text)) return;
    const state = userStates[user.id];
    let flow = null;
    if (state && state.step === 'service') {
      const serviceKey = Object.keys(config.SERVICES).find(key => config.SERVICES[key] === text);
      if (!serviceKey) {
        if (typeof console !== 'undefined' && console.warn) console.warn('[comm-agent] Invalid service selected:', text);
        await ctx.reply(config.STRINGS.INVALID_SERVICE, serviceMenu);
        return;
      }
      const flowKey = config.SERVICE_FLOW_MAP[serviceKey];
      const rawFlow = config.STEP_FLOWS[flowKey];
      if (!rawFlow) {
        if (typeof console !== 'undefined' && console.error) console.error('[comm-agent] Missing flow for serviceKey', serviceKey, 'flowKey', flowKey);
        await ctx.reply(config.STRINGS.CONFIG_ERROR_USER || 'Unknown error');
        try {
          const adminMsgPrefix = config.STRINGS.CONFIG_ERROR_ADMIN_PREFIX || 'Config error:';
          const detailed = `${adminMsgPrefix} missing flow for serviceKey='${serviceKey}' (flowKey='${flowKey}'). User input: "${text}" from @${user.username || user.first_name} (${user.id})`;
          await forwardMessage(bot, config, secrets, detailed);
        } catch (err) {
          if (typeof console !== 'undefined' && console.error) console.error('[comm-agent] Failed to notify admin about missing flow:', err);
        }
        return;
      }
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
        const leadText = config.STRINGS.MSG_TEMPLATE(collected, user);
        await handleLeadForwarding(bot, {
          ...config,
          ADMIN_CHAT_ID: secrets.ADMIN_CHAT_ID,
          AGENT_CHAT_ID: secrets.AGENT_CHAT_ID,
          FORWARD_TO_AGENT: secrets.FORWARD_TO_AGENT || config.FORWARD_TO_AGENT,
        }, leadText, { ctx });
        await ctx.reply(config.STRINGS.LEAD_SENT, mainMenu);
        delete userStates[user.id];
        return;
      }
    }
    if (typeof console !== 'undefined' && console.log) console.log('[comm-agent] Fallback message from', user && user.id, 'text:', text);
    // Use MSG_TEMPLATE from config, pass message text as collected and user for sender info
    const msg = config.STRINGS.MSG_TEMPLATE ? config.STRINGS.MSG_TEMPLATE({ message: text }, user) : JSON.stringify(user, null, 2);
    await forwardMessage(bot, config, secrets, msg, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: config.STRINGS.APPROVE_BTN, callback_data: `approve:${user.id}` },
            { text: config.STRINGS.REJECT_BTN, callback_data: `reject:${user.id}` }
          ]
        ]
      }
    });
    await ctx.reply(config.STRINGS.MSG_SENT, mainMenu);
  };
}

module.exports = { makeProcessMessage };
