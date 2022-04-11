class JobCollection {}
const debug = require("debug")("mock:job");
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
  }
  delay(...args) {
    debug("job delay called", { args });
    return this;
  }
  retry(...args) {
    debug("job retry called", { args });
    return this;
  }
  priority(...args) {
    debug("job priority called", { args });
    return this;
  }
  save(...args) {
    debug("job save called", { args });
    return this;
  }
}
