const { buildMainMenu, buildServiceMenu } = require('../src/menus');

describe('menus', () => {
  const config = {
    BUTTONS: { SERVICE_LIST: 'List', CONTACT: 'Contact' },
    SERVICES: { pizza: 'Pizza', sushi: 'Sushi' },
  };

  it('builds main menu', () => {
    const menu = buildMainMenu(config);
    expect(menu.reply_markup.keyboard).toEqual([
      [config.BUTTONS.SERVICE_LIST, config.BUTTONS.CONTACT],
    ]);
    expect(menu.reply_markup.resize_keyboard).toBe(true);
    expect(menu.reply_markup.one_time_keyboard).toBe(false);
  });

  it('builds service menu', () => {
    const menu = buildServiceMenu(config);
    expect(menu.reply_markup.keyboard).toEqual([
      ['Pizza'],
      ['Sushi'],
    ]);
    expect(menu.reply_markup.resize_keyboard).toBe(true);
    expect(menu.reply_markup.one_time_keyboard).toBe(true);
  });
});
