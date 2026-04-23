const { createLeadWebServer } = require('../../src/server/web-server');
const request = require('supertest');

describe('createLeadWebServer', () => {
  it('throws if missing secrets', () => {
    expect(() => createLeadWebServer({})).toThrow();
  });
  it('forwards lead to both admin and agent', async () => {
    const botInstance = {
      telegram: {
        sendMessage: jest.fn().mockResolvedValue(true),
      },
    };
    const app = createLeadWebServer({
      BOT_TOKEN: 'token',
      ADMIN_CHAT_ID: 'admin',
      AGENT_CHAT_ID: 'agent',
      botInstance,
      port: 0,
    });
    await request(app)
      .post('/lead')
      .send({ name: 'n', phone: 'p', message: 'm' })
      .expect(200);
    expect(botInstance.telegram.sendMessage).toHaveBeenCalledWith('admin', expect.any(String));
    expect(botInstance.telegram.sendMessage).toHaveBeenCalledWith('agent', expect.any(String));
  });
});