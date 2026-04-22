const { handleCallbackQuery } = require('../src/callbackHandlers');

describe('handleCallbackQuery', () => {
  let ctx;
  let config;
  beforeEach(() => {
    ctx = {
      callbackQuery: { data: '' },
      editMessageReplyMarkup: jest.fn(() => Promise.resolve()),
      answerCbQuery: jest.fn(() => Promise.resolve()),
    };
    config = { STRINGS: { APPROVED_CB: 'Approved', REJECTED_CB: 'Rejected', UNKNOWN_CB: 'Unknown' } };
  });
  it('handles approve', async () => {
    ctx.callbackQuery.data = 'approve:123';
    await handleCallbackQuery(ctx, config);
    expect(ctx.editMessageReplyMarkup).toHaveBeenCalled();
    expect(ctx.answerCbQuery).toHaveBeenCalledWith('Approved');
  });
  it('handles reject', async () => {
    ctx.callbackQuery.data = 'reject:123';
    await handleCallbackQuery(ctx, config);
    expect(ctx.editMessageReplyMarkup).toHaveBeenCalled();
    expect(ctx.answerCbQuery).toHaveBeenCalledWith('Rejected');
  });
  it('handles unknown', async () => {
    ctx.callbackQuery.data = 'somethingelse';
    await handleCallbackQuery(ctx, config);
    expect(ctx.answerCbQuery).toHaveBeenCalledWith('Unknown');
  });
});
