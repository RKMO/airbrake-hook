import logger from '../util/logger.js';
import statsd from '../util/statsd.js';

function incrementAirbrakeStat(airbrake) {
  const statKey = airbrake.error.project.name.toLowerCase().replace(/\W+/, '_') +
    '.count';
  logger.info({statKey}, 'increment airbrake stat');
  statsd.increment(statKey);
}

export {incrementAirbrakeStat};
