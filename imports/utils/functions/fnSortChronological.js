import get from "lodash.get";

export function sortChronologic(a, b) {
  return get(b, ["created", "at"]) - get(a, ["created", "at"]);
}
