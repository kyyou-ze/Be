// server.js
const http = require('http');
const app = require('./app');
const { PORT } = require('./Config/env');
const logger = require('./Config/logger');

const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
});
