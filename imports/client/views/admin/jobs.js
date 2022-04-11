/* global Job */
import { ReactiveVar } from "meteor/reactive-var";
import moment from "moment";
import { Template } from "meteor/templating";

import "./jobs.html";

const tick = 2500;

// If two values sum to forever, then ∞, else the first value
const isInfinity = (val1, val2) => {
  if (val1 + val2 === Job.forever) {
    return false;
  }
  return val1;
};

Template.JobsAdmin.onCreated(function onCreated() {
  this.subscribe("jobs.overview", 30);
  this.now = new ReactiveVar(new Date());
  this.interval = setInterval(() => {
    return this.now.set(new Date());
  }, tick);
});

Template.JobsAdmin.onDestroyed(function onDestroyed() {
  return clearInterval(this.interval);
});

Template.JobsAdmin.helpers({
  jobs() {
    return [];
  },
  truncateId(id) {
    if (id) {
      if (typeof id === "object") {
        // eslint-disable-next-line no-param-reassign
        id = `${id.valueOf()}`;
      }
      return `${id.substr(0, 3)}…`;
    }
    return "";
  },
  relativeTime(time) {
    const now = Template.instance().now.get();
    if (Math.abs(time - now) < tick) {
      return "Now";
    }
    return moment(time).from(now);
  },
  numRepeats() {
    return isInfinity(this.repeats, this.repeated);
  },
  numRetries() {
    return isInfinity(this.retries, this.retried);
  },
  statusClass(status) {
    return {
      waiting: "grey",
      ready: "blue",
      paused: "black",
      running: "default",
      cancelled: "yellow",
      failed: "red",
      completed: "green"
    }[status];
  },
  unique(failures) {
    return [...new Set(failures.map(f => f.value))].join(" • ");
  },
  recentEvents(numEvents = 5) {
    const output = [];

    output.sort((a, b) => b.time - a.time);
    return output.slice(0, numEvents);
  }
});
