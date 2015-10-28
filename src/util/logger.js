import bunyan from 'bunyan';
import config from '../config';

const logger = bunyan.createLogger(config.logger);

export default logger;
