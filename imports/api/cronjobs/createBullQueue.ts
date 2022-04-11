import Queue from "bull";

const { RedisConnection } = require("@transmate-eu/ibm-function-basis");
const debug = require("debug")("job:createbullqueue");

// It not recommend to reuse redis client because of this issue
// https://github.com/OptimalBits/bull/issues/1192#issuecomment-489566105
// const client = new Redis({
//   path: REDIS_URL,
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false
// });
// const subscriber = new Redis({
//   path: REDIS_URL,
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false
// });

const createBullQueue = name => {
  const { REDIS_URL } = process.env;
  if (!REDIS_URL) throw new Error("REDIS_URL is missing!");
  const redisSetup = { redis: RedisConnection.connectionParams(REDIS_URL) };
  debug("redis connectionParams %o" , redisSetup);
  // const opts = {
  //   createClient(type) {
  //     switch (type) {
  //       case "client":
  //         return client;
  //       case "subscriber":
  //         return subscriber;
  //       default:
  //         return new Redis(REDIS_URL);
  //     }
  //   }
  // };

  const queue = new Queue(name, redisSetup);

  return queue;
};

export default createBullQueue;
