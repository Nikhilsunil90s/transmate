import { v4 as uuidv4 } from "uuid";
import JobCollection from "./JobCollection";

import {
  JobPriority,
  JobProcessFunction,
  JobProcessOptions
} from "./JobConstants";

// FIXME:
const debug = require("debug")("BULL:job");

export class BullJob {
  _id: string;
  queue: any;
  collection: JobCollection;

  options = {
    name: "",
    delay: 0,
    attempts: 1,
    retryProcessDelay: 5000,
    timeout: null,
    removeOnComplete: 1000,
    removeOnFail: 1000,
    priority: JobPriority.NORMAL
  };

  data: any;

  get name(): string {
    return this.options.name;
  }

  get id(): string {
    if (!this._id) this._id = uuidv4();

    return this._id;
  }

  constructor(collection: JobCollection, name: string, data: any) {
    if (
      name === "script.numdia.price.confirmation" &&
      typeof data.shipmentId !== "string"
    )
      throw Error(`${name} should have a shipmentId in data!`);

    this.collection = collection;
    this.options.name = name;
    this.data = data;
  }

  /**
   *
   * @param value milliseconds
   * @returns
   */
  delay(value: number) {
    this.options.delay = value;
    return this;
  }

  timeout(value: number) {
    this.options.timeout = value;

    return this;
  }

  retry(opts: { retries: number; wait: number }) {
    // https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueadd
    // retryProcessDelay
    // attempts
    const { retries, wait } = opts;
    this.options.attempts = retries;
    // this maybe not the same thing
    this.options.retryProcessDelay = wait;
    return this;
  }

  /**
   *
   * @param value high 1, normal 10, low 19
   * @returns
   */
  priority(value: number | string) {
    let _priority = value;
    if (typeof value === "string") {
      if (value === "high") {
        _priority = JobPriority.HIGH;
      } else if (value === "normal") {
        _priority = JobPriority.NORMAL;
      } else if (value === "low") {
        _priority = JobPriority.LOW;
      } else {
        throw Error("unknow priority " + _priority);
      }
    }

    this.options.priority = _priority as number;
    return this;
  }

  async save() {
    if (!process.env.REDIS_URL) {
      console.warn("redis not available, so job will not excecute:", this.options.name, this.data);
      return this;
    }
    //  see https://github.com/OptimalBits/bull/issues/873
    const queue = this.collection.getQueue(this.options.name);
    const jobOptions: any = {
      jobId: this.id,
      delay: this.options.delay,
      priority: this.options.priority,
      attempts: this.options.attempts,
      retryProcessDelay: this.options.retryProcessDelay,
      removeOnComplete: this.options.removeOnComplete,
      removeOnFail: this.options.removeOnFail
    };
    if (this.options.timeout != null) {
      jobOptions.timeout = this.options.timeout;
    }
    queue.add(this.options.name, this.data, jobOptions);
    await this.collection.saveJob(this);
    debug("save job to queue", this.options.name, jobOptions);

    return this;
  }
}
