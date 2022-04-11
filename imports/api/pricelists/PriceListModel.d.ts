import { ByAtModel } from "../_interfaces/model";

export interface PriceListModel {
  id: string;
  customerId: string;
  carrierId: string;
  carrierName: string;
  creatorId: string;
  title: string;
  template: any;
  F;
  currency: string;
  category: string;
  type: string;
  mode: string;
  validFrom: Date;
  validTo: Date;

  // allowed uoms and conversions:
  uoms: any;

  // rate card structure:
  lanes: Array<any>;
  volumes: Array<any>;
  equipments: Array<any>;
  shipments: Array<any>;
  charges: Array<any>;
  leadTimes: Array<any>;
  defaultLeadTime: any;

  attachments: Array<any>;

  specialRequirements: Array<any>;

  status: string;
  terms: any;
  created: ByAtModel;
  updated: ByAtModel;
  deleted: boolean;

  updates: Array<any>;

  fuelIndexId: string;
  tenderId: string;
  priceRequestId: string;
  notes: string;
  summary: any;

  rules: any;
  xlsUrl: string;
}
