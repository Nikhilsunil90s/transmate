// allows to quickly jump between obj keys (dot.transform)
export const SCHEDULED_DATE_RECIPE = {
  instructions: "instructions",
  plate: "plate",
  "dates.pickup.arrival.scheduled": "loading",
  "dates.delivery.arrival.scheduled": "unloading"
};

export const SCHEDULED_DATE_SHIPMENT_RECIPE = {
  "pickup.dateScheduled": "loading",
  "delivery.dateScheduled": "unloading"
};

export const CONFIRMATION_RECIPE = {
  "dates.pickup.arrival.actual": "pickupArrival",
  "dates.pickup.start.actual": "pickupStart",
  "dates.pickup.end.actual": "pickupEnd",
  "dates.delivery.arrival.actual": "deliveryArrival",
  "dates.delivery.start.actual": "deliveryStart",
  "dates.delivery.end.actual": "deliveryEnd"
};

export const CONFIRMATION_SHIPMENT_RECIPE = {
  "pickup.dateActual": "loading",
  "delivery.dateActual": "unloading"
};
