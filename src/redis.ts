import Redis from 'ioredis';
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
});

redis.on('connect', () => {
  console.log('Redis подключен.');
});

redis.on('error', (err) => {
  console.error('Ошибка подключения к Redis:', err);
});

export default redis;
