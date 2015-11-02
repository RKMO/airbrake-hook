import Lynx from 'lynx';

import logger from './logger.js';
import config from '../config.js';

const client = new Lynx(config.host, config.port, {
  scope: config.scope,
});

logger.info({ statsd: config }, 'statsd client loaded');

export default client;
