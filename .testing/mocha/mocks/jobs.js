class JobCollection {}
const debug = require("debug")("mock:job");
const { Mongo } = require("../DefaultMongo");
export { JobCollection };

export class Job {
  constructor(collection, name, data) {
    if (typeof name !== "string") throw Error("job name should be a string!");
    if (typeof data !== "object") throw Error("job data should be an object!");
    if (
      name === "script.numdia.price.confirmation" &&
      typeof data.shipmentId !== "string"
    )
      throw Error(name + " should have a shipmentId in data!");

    
    this.collection = new Mongo.Collection("jobs.test");
    this.obj = {data,name}
  }
  delay(...args) {
    this.obj.delay = args;
    debug("job delay called", { args });
    return this;
  }
  retry(...args) {
    this.obj.retry = args;
    debug("job retry called", { args });
    return this;
  }
  priority(...args) {
    this.obj.priority = args;
    debug("job priority called", { args });
    return this;
  }
  async save() {
    const { name, data, priority, retry, delay } = this.obj;
    debug("job save called data %o", { name, data, priority, retry, delay });
    this.jobResult = await this.collection.insert({
      name,
      data,
      priority,
      retry,
      delay
    });
    return this;
  }
}
