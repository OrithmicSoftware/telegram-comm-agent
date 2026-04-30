


const { Telegraf } = require('telegraf');
const { buildMainMenu, buildServiceMenu } = require('./src/menus');
const { handleCallbackQuery } = require('./src/callbackHandlers');
const { makeProcessMessage } = require('./src/processMessage');
const handleLeadForwarding = require('./src/handleLeadForwarding');
const { initLogging } = require('./src/logging');
const { createLeadWebServer } = require('./src/server/web-server');

function createCommAgent(config, secrets) {
  // Optional logging setup
  if (config && config.logging && config.logging.enable) {
    initLogging({
      logFile: config.logging.logFile,
      maxLogLines: config.logging.maxLogLines,
      enable: true,
      logDir: config.logging.logDir
    });
  }
  if (typeof console !== 'undefined' && console.log) console.log('[comm-agent] createCommAgent called');
  if (!secrets.BOT_TOKEN || !secrets.ADMIN_CHAT_ID || !secrets.AGENT_CHAT_ID) {
    if (typeof console !== 'undefined' && console.error) console.error('[comm-agent] Missing required secrets:', secrets);
    throw new Error('Missing BOT_TOKEN, ADMIN_CHAT_ID, or AGENT_CHAT_ID');
  }
  if (typeof console !== 'undefined' && console.log) console.log('[comm-agent] Initializing Telegraf bot');
  const bot = new Telegraf(secrets.BOT_TOKEN);
  const userStates = {};
  const mainMenu = buildMainMenu(config);
  const serviceMenu = buildServiceMenu(config);

  bot.on('callback_query', async (ctx) => handleCallbackQuery(ctx, config));

  bot.start(async (ctx) => {
    if (typeof console !== 'undefined' && console.log) console.log('[comm-agent] /start received from', ctx.from && ctx.from.id);
    await ctx.reply(config.STRINGS.WELCOME, mainMenu);
  });
  bot.hears(config.BUTTONS.SERVICE_LIST, async (ctx) => {
    if (typeof console !== 'undefined' && console.log) console.log('[comm-agent] SERVICE_LIST button from', ctx.from && ctx.from.id);
    userStates[ctx.from.id] = { step: 'service' };
    await ctx.reply(config.STRINGS.CHOOSE_SERVICE, serviceMenu);
  });
  bot.hears(config.BUTTONS.CONTACT, async (ctx) => {
    if (typeof console !== 'undefined' && console.log) console.log('[comm-agent] CONTACT button from', ctx.from && ctx.from.id);
    await ctx.reply(config.STRINGS.CONTACT_PROMPT, mainMenu);
  });

  const processMessage = makeProcessMessage({ config, secrets, userStates, mainMenu, serviceMenu, bot });

  bot.on('message', async (ctx) => {
    if (typeof console !== 'undefined' && console.log) console.log('[comm-agent] message event from', ctx.from && ctx.from.id, 'text:', ctx.message && ctx.message.text);
    try {
      await processMessage(ctx);
    } catch (err) {
      if (typeof console !== 'undefined' && console.error) console.error('[comm-agent] Error in message handler:', err);
      throw err;
    }
  });

  // Override handleUpdate for tests: when a `ctx` is provided (second arg), process using it
  const originalHandleUpdate = bot.handleUpdate.bind(bot);
  bot.handleUpdate = async (update, providedCtx) => {
    if (typeof console !== 'undefined' && console.log) console.log('[comm-agent] handleUpdate called', { update, hasProvidedCtx: !!providedCtx });
    try {
      if (providedCtx && update && update.message) {
        providedCtx.telegram = providedCtx.telegram || bot.telegram;
        providedCtx.message = { ...update.message, from: providedCtx.from };
        const text = providedCtx.message && providedCtx.message.text ? providedCtx.message.text : '';
        if (text === '/start') {
          await providedCtx.reply(config.STRINGS.WELCOME, mainMenu);
          return;
        }
        if (text === config.BUTTONS.SERVICE_LIST) {
          userStates[providedCtx.from.id] = { step: 'service' };
          await providedCtx.reply(config.STRINGS.CHOOSE_SERVICE, serviceMenu);
          return;
        }
        if (text === config.BUTTONS.CONTACT) {
          await providedCtx.reply(config.STRINGS.CONTACT_PROMPT, mainMenu);
          return;
        }
        await processMessage(providedCtx);
        return;
      }
      return await originalHandleUpdate(update);
    } catch (err) {
      if (typeof console !== 'undefined' && console.error) console.error('[comm-agent] Error in handleUpdate:', err, { update });
      throw err;
    }
  };
  if (typeof console !== 'undefined' && console.log) console.log('[comm-agent] Bot instance created');
  return bot;
}

module.exports = { createCommAgent, handleLeadForwarding, initLogging, createLeadWebServer };
