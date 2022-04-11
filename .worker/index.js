
const { RedisConnection } = require("@transmate-eu/ibm-function-basis");
const Queue = require("bull");
const app = require("express")();

const REDIS_URI = process.env.REDIS_URL;

const redisOptions = {
  redis: RedisConnection.connectionParams(REDIS_URI)
};
const { createBullBoard } = require("@bull-board/api");
const { BullAdapter } = require("@bull-board/api/bullAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const serverAdapter = new ExpressAdapter();
const PORT = 4000;

const redis = new RedisConnection(REDIS_URI);

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [],
  serverAdapter
});

const queueNames = [];
let client; // redis client
const prefix = process.env.BULL_PREFIX || "bull";

function refreshQueues() {
  console.log("Refreshing Queues");
  client.keys(`${prefix}:*`, (_err, keys) => {
    keys.sort().forEach(key => {
      const queueName = key.replace(/^.+?:(.+?):.+?$/, "$1");
      if (!queueNames.includes(queueName)) {
        console.log("add queue_name", queueName);
        const queue = new Queue(queueName, redisOptions);
        const queueAdapter = new BullAdapter(queue);
        setQueues([queueAdapter]);
        queueNames.push(queueName);

      }
    });
  });
}


function setupQueues() {
  console.log("get Queues");
  const keys = Object.keys(config.bullQueues).sort((a, b) => a - b);
  keys.forEach(key => {
    const queueName = config.bullQueues[key].name;
    if (!queueNames.includes(queueName)) {
      console.log("add queue_name", queueName);
      const queue = new Queue(queueName, redisOptions);
      const queueAdapter = new BullAdapter(queue);
      setQueues([queueAdapter]);
      queueNames.push(queueName);
    }
  });
}

const run = async () => {
  client = await redis.connect();
  //setInterval(refreshQueues, process.env.REFRESH_INTERVAL || 10000);

  refreshQueues();

  app.use("/", serverAdapter.getRouter());
  const server = app.listen(PORT, () => {
    console.log(`Running on ${PORT}...`);
    console.log(`For the UI, open http://localhost:${PORT}/`);
  });
  process.on("SIGINT", () => {
    server.close(() => {
      process.exit();
    });
  });
};

run().catch(e => console.error(e));