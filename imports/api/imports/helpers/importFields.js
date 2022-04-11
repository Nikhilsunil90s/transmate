export const importFields = [
  { key: "shipment.references.number", type: String, required: true },
  { key: "shipment.references.carrier", type: String, required: false },
  { key: "shipment.references.consignee", type: String, required: false },
  { key: "shipment.references.bof", type: String, required: false },
  { key: "shipment.references.fa", type: String, required: false },
  { key: "shipment.references.container", type: String, required: false },
  { key: "shipment.references.cmr", type: String, required: false },

  { key: "shipment.status", type: String, required: false },
  { key: "shipment.serviceLevel", type: String, required: false },
  { key: "shipment.created.at", type: Date, required: false },
  { key: "shipment.created.by", type: String, required: false },
  { key: "shipment.planner", type: String, required: false },
  { key: "shipment.priceList", type: String, required: false },

  { key: "shipment.notes.BookingNotes", type: String, required: false },
  { key: "shipment.notes.PlanningNotes", type: String, required: false },
  { key: "shipment.notes.LoadingNotes", type: String, required: false },
  { key: "shipment.notes.UnloadingNotes", type: String, required: false },
  { key: "shipment.notes.OtherNotes", type: String, required: false },

  { key: "shipment.tracking", type: Boolean, required: false },

  { key: "shipment.costs.amount", type: Number, required: false },
  { key: "shipment.costs.currency", type: String, required: false },

  { key: "stage.mode", type: String, required: false },
  { key: "stage.vehicleId", type: String, required: false },
  { key: "stage.trailerId", type: String, required: false },
  { key: "stage.carrier.id", type: String, required: false },
  { key: "stage.carrier.name", type: String, required: false },
  { key: "stage.dates.pickup.arrival.planned", type: Date, required: true },

  // { key:"stage.dates.pickup.arrival.scheduled", type: Date,required: false},
  { key: "stage.dates.pickup.arrival.actual", type: Date, required: false },

  // { key: "stage.dates.pickup.departure.planned", type: Date,required: false},
  // { key: "stage.dates.pickup.departure.scheduled",type: Date,required: false},
  // { key: "stage.dates.pickup.departure.actual",type: Date,required: false},
  { key: "stage.dates.delivery.arrival.planned", type: Date, required: true },

  // { key: "stage.dates.delivery.arrival.scheduled",type: Date,required: false},
  { key: "stage.dates.delivery.arrival.actual", type: Date, required: false },

  // {key: "stage.dates.delivery.departure.planned",type: Date,required: false},
  // {key: "stage.dates.delivery.departure.scheduled",type: Date,required: false},
  // {key: "stage.dates.delivery.departure.actual",type: Date,required: false},
  { key: "stage.from.id", type: String, required: false },
  { key: "stage.from.name", type: String, required: false },
  { key: "stage.from.locode", type: String, required: false },
  { key: "stage.from.portName", type: String, required: false },
  { key: "stage.from.address.city", type: String, required: false },
  { key: "stage.from.address.street", type: String, required: false },
  { key: "stage.from.address.number", type: String, required: false },
  { key: "stage.from.address.zip", type: String, required: false },
  { key: "stage.from.address.country", type: String, required: false },
  { key: "stage.to.id", type: String, required: false },
  { key: "stage.to.name", type: String, required: false },
  { key: "stage.to.locode", type: String, required: false },
  { key: "stage.to.portName", type: String, required: false },
  { key: "stage.to.address.city", type: String, required: false },
  { key: "stage.to.address.street", type: String, required: false },
  { key: "stage.to.address.number", type: String, required: false },
  { key: "stage.to.address.zip", type: String, required: false },
  { key: "stage.to.address.country", type: String, required: false },

  { key: "item.number", type: String, required: false },
  { key: "item.description", type: String, required: false },

  // additional allowed fields in api, limit them to simple number & description
  // { key: "item.material.id", type: String, required: false },
  // { key: "item.material.description", type: String, required: false },

  { key: "item.quantity", type: Number, required: true },
  { key: "item.quantity_unit", type: String, required: true }, // needs to be matched with own
  { key: "item.volume.kg", type: Number, required: false },
  { key: "item.volume.lm", type: Number, required: false },
  { key: "item.volume.m3", type: Number, required: false },
  { key: "item.volume.l", type: Number, required: false },
  { key: "item.volume.pal", type: Number, required: false },
  { key: "item.weight_net", type: Number, required: false },
  { key: "item.weight_gross", type: Number, required: false },
  { key: "item.weight_unit", type: String, required: false }
];

/* 
const natural = require("natural");
const classifier = new natural.BayesClassifier();

classifier.addDocument("shipment", "shipment.references.number");
importFields.forEach(el => {
  classifier.addDocument(el.key.split(".").join(" "), el.key);

  const cleanKey = el.key
    .toLowerCase()
    .replace("stage.", "")
    .replace("address.", "")
    .replace("shipment.", "")
    .replace("volume.", "")
    .replace("item.", "")
    .replace("_", " ")
    .split(".")
    .join(" ")
    .replace(/[^a-z0-9]/g, " ")
    .trim();
  classifier.addDocument(cleanKey, el.key);
});

classifier.train();

export function classifyField(field) {
  return classifier.classify(field.replace("postal", "zip"));
} */
// for lookup of field names
// add "shipment" as first match
// planned is the default so we remove it.
const fields = {
  shipment: "shipment.references.number"
};
importFields.forEach(el => {
  const cleanKey = el.key
    .toLowerCase()
    .replace("stage.", "")
    .replace("address.", "")
    .replace("shipment.", "")
    .replace("volume.", "")
    .replace("item.", "")
    .replace(".planned", "")
    .replace("_", " ")
    .split(".")
    .join(" ")
    .replace(/[^a-z0-9]/g, " ")
    .trim();
  fields[cleanKey] = el.key;
});
export const importLookupFields = fields;
