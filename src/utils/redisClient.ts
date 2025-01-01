import { createClient } from 'redis';
import { logger } from './logger';
import { REDIS_HOST, REDIS_PORT } from '../config';

const redisClient = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

redisClient.on('error', (err) => {
  logger.error(`Redis error: ${err.message}`);
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis successfully');
});

redisClient.connect();

export default redisClient;
