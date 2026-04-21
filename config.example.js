// Example config.js for telegram-comm-agent consumers
// Copy to config.js and fill in your values, or use environment variables

module.exports = {
  BOT_TOKEN: 'example_bot_token_123456',
  ADMIN_CHAT_ID: '111111111',
  AGENT_CHAT_ID: '222222222',
  FORWARD_TO_AGENT: 'ask', // 'no', 'all', or 'ask'

  SERVICES: {
    pizza: '🍕 Pizza Delivery',
    car: '🚗 Car Rental',
    event: '🎟 Event Booking',
    hotel: '🏨 Hotel Reservation',
    package: '📦 Package Tracking',
    inquiry: '💬 General Inquiry',
  },

  STRINGS: {
    WELCOME: 'Hello! I am your friendly assistant bot. I can help you order pizza, rent a car, book events, and more!\n\nPlease use the menu below to get started.',
    CHOOSE_SERVICE: 'Please select a service from the menu below:',
    CONTACT_PROMPT: 'Please provide your name and details. I will get back to you soon!',
    INVALID_SERVICE: 'Please select a valid service from the list.',
    LEAD_SENT: 'Thank you! Your request has been sent to the admin.',
    MSG_SENT: 'Your message has been sent.',
    LEAD_TEMPLATE: (collected, user) => `New lead from @${user.username || user.first_name}:\nService: ${collected.service}\nBudget: ${collected.budget || '-'}\nName: ${collected.name || '-'}\nPhone: ${collected.phone || '-'}`,
    MSG_TEMPLATE: (user, text) => `Message from @${user.username || user.first_name}:\n${text}`,
    APPROVE_BTN: '✅ Approve and send to agent',
    REJECT_BTN: '❌ Reject',
    FORWARD_PROMPT: 'Forward this to agent?',
    FORWARD_BTN: '➡️ Forward to Agent',
    NO_FORWARD_BTN: '🚫 Do Not Forward',
    WAITING_FORWARD_CONFIRM: 'Waiting for confirmation to forward to agent.',
    FLOW: [
      { field: 'budget', prompt: 'Please enter your budget:' },
      { field: 'district', prompt: 'Please enter your preferred district:' },
      { field: 'name', prompt: 'Please enter your name:' },
      { field: 'phone', prompt: 'Please enter your phone number:' },
    ],
  },

  BUTTONS: {
    SERVICE_LIST: '📋 List Services',
    CONTACT: '✉️ Contact',
  },
};
