import { ByAt } from "/imports/api/_jsonSchemas/interfaces/model.d";

export interface ShipmentItemType {
  _id: string;
  id?: string;
  shipmentId: string;
  parentItemId?: string;

  level: number;

  // type
  quantity: {
    amount: number;
    code: String;
    description?: string;
  };

  // fields from quantity_unit
  type: "HU" | "TU";
  itemType?: "container" | "truck" | "pal" | "box" | "custom";

  // general
  number?: string;
  description?: string;
  commodity?: string;
  notes?: string;

  // references:
  references?: {
    order?: string;
    delivery?: string;
    containerNo?: string;
    truckId?: string;
    trailerId?: string;
    document?: string;
    seal?: string;
  };

  material?: {
    id?: string;
    description?: string;
  };

  // conditions
  DG?: Boolean;
  DGClassType?: string;
  customs?: {
    HScode?: string;
    countryOfOrigin?: string;
    value?: number;
    currency?: string;
  };

  temperature?: {
    condition?: string;
    range?: {
      from: number;
      to: number;
      unit: "C" | "F";
    };
  };

  // weight
  weight_net?: number;
  weight_tare?: number;
  weight_gross?: number;
  weight_unit?: string;

  // dimensions
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    uom?: string;
  };

  // cost relevance
  taxable?: Array<{ type: string; quantity: number }>;

  // taxable master data
  calcSettings?: {
    costRelevant?: Boolean;
    itemize?: Boolean;
    keys?: Object;
    linkField?: string;
  };

  isPicked?: Boolean;
  isPackingUnit?: Boolean;
  edi?: Object;
  labelUrl?: string;

  created: ByAt;
  updated?: {
    shipment_items: string;
  };
  deleted?: Boolean;
}
