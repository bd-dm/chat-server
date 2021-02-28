import redis, { RedisClient as RedisClientType } from 'redis';

import redisConfig from '@/configs/redisConfig';

export default class RedisClient {
  private static client: RedisClientType;

  static getInstance() {
    return RedisClient.client;
  }

  static init() {
    RedisClient.client = redis.createClient(redisConfig.port, redisConfig.host);
  }

  static async get(key: string): Promise<string> {
    return new Promise((resolve) => RedisClient.client.get(key, (e, data) => resolve(data)));
  }

  static async set(key: string, value: string, duration: number): Promise<void> {
    return new Promise((resolve) => {
      RedisClient.client.set(key, value, 'EX', duration, () => {
        resolve();
      });
    });
  }
}
