import { _ } from "meteor/underscore";

export default function leadTimeFormat(v) {
  if (typeof v === "number") {
    if (v < 24) {
      return `${_.round(v, 1)}h`;
    }
    return `${_.round(v / 24, 1)}d`;
  }
  return " - ";
}
