// Simple mock Telegram API server for E2E testing
const express = require('express');
const app = express();
app.use(express.json());

// Store received messages for assertions
global.__MOCK_TG_MESSAGES__ = [];

// Emulate /sendMessage endpoint
app.post('/bot:token/sendMessage', (req, res) => {
  global.__MOCK_TG_MESSAGES__.push(req.body);
  res.json({ ok: true, result: { message_id: 1, ...req.body } });
});

// Emulate /setWebhook endpoint
app.post('/bot:token/setWebhook', (req, res) => {
  res.json({ ok: true, result: true });
});

// Emulate /getMe endpoint
app.get('/bot:token/getMe', (req, res) => {
  res.json({ ok: true, result: { id: 123456, is_bot: true, username: 'mock_bot' } });
});

const server = app.listen(8081, () => {
  console.log('Mock Telegram API server running on http://localhost:8081');
});

module.exports = server;
