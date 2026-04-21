// Example CORS config for telegram-comm-agent web server
// Use in your consumer project to specify allowed origins

module.exports = {
  origin: [
    'https://orithmicsoftware.github.io',
    // Add more allowed origins as needed
  ],
  methods: ['POST'],
  credentials: false,
};
