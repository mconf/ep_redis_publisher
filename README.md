# ep_redis_publisher

Etherpad-Lite plugin that publshes (some) server hooks' events to redis

- Etherpad's `settings.json` configuration:

```
  "ep_redis_publisher": {
    "host": "127.0.0.1",
    "port": 6379,
    "channel": "from-etherpad-redis-channel",
    "password": "change-me" [optional]
  }

```
