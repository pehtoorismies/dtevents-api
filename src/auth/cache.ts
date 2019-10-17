import redis from 'redis';
import { promisify } from 'util';

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

redisClient.on('connect', () => {
  console.log('Connected to redis');
});

const getFromCache = promisify(redisClient.get).bind(redisClient);
const setToCache = promisify(redisClient.set).bind(redisClient);
const deleteKey = promisify(redisClient.del).bind(redisClient);

export { getFromCache, setToCache, deleteKey };
