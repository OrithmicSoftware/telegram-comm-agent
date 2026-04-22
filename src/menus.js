// src/menus.js

const buildMainMenu = (config) => ({
  reply_markup: {
    keyboard: [
      [config.BUTTONS.SERVICE_LIST, config.BUTTONS.CONTACT],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
});

const buildServiceMenu = (config) => ({
  reply_markup: {
    keyboard: Object.values(config.SERVICES).map((s) => [s]),
    resize_keyboard: true,
    one_time_keyboard: true,
  },
});

module.exports = { buildMainMenu, buildServiceMenu };