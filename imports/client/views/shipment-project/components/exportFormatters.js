/* eslint-disable new-cap */
import get from "lodash.get";
import { addressFormatter } from "/imports/api/addresses/services/addressFormatter";
import { getTimezoneOffset } from "/imports/utils/functions/timeConverter";

export function formatCarrier(carrier) {
  return (
    get(carrier, "annotation.coding.ediId") || get(carrier, "name") || null
  );
}

export function formatShipper(shipper) {
  return (
    get(shipper, "annotation.coding.ediId") || get(shipper, "name") || null
  );
}
export function formatCooling(hasCooling) {
  return hasCooling
    ? `${hasCooling.condition}${
        hasCooling.range
          ? ` ${hasCooling.range.from}-${hasCooling.range.to} ${hasCooling.range.unit}`
          : ""
      }`
    : null;
}
export function formatDateType({ isScheduled, isActual }) {
  if (isActual) return "Actual";
  if (isScheduled) return "Scheduled";
  return "Planned";
}

// date is converted
export function dateFormatter({ date }) {
  return new Intl.DateTimeFormat("default").format(date); // date
}

// date is converted
export function timeFormatter({ date }) {
  return new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric"
  }).format(date); // date
}

// TZ formatter
export function timeZoneFormatter({ timeZone }) {
  const diffHours = getTimezoneOffset(timeZone) / 60;
  return `UTC${diffHours >= 0 ? "+" : "-"}${Math.abs(diffHours)}`;
}

export function locationNameFormatter(location) {
  return (
    get(location, "annotation.coding.ediId") || get(location, "name") || ""
  );
}

export function locationFormatter(location) {
  return addressFormatter({ location });
}

export function itemFormatter(item = {}) {
  const { commodity, description } = item;
  return commodity || description;
}

export function equipmentFormatter(equipment) {
  const { containerNo, truckId, trailerId } = equipment || {};
  if (truckId || trailerId) return [truckId, trailerId].join("/");
  if (containerNo) return containerNo;
  return " - ";
}
