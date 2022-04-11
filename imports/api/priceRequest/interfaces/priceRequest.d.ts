import { AccountContactType } from "/imports/api/allAccounts/interfaces/Account.d";

interface ChargeLine {
  chargeId: String;
  name: String;
  costId?: string;
  amount: {
    unit: string;
    value: number;
  };
  comment?: string;
}

interface SimpleBidType {
  notes?: string;
  date: Date;
  shipmentId: String;
  won?: Date;
  lost?: Date;
  queueMail?: Date;
  chargeLines: Array<ChargeLine>;
}

export interface BidderType {
  accountId: string;
  name?: string;
  notified?: Date;
  won?: Date;
  lost?: Date;
  viewed?: Boolean;
  bid?: Boolean;
  bidOpened?: Date;
  priceListId?: String;
  userIds?: Array<string>;
  firstSeen?: Date;
  lastSeen?: Date;
  notes?: string;
  simpleBids?: Array<SimpleBidType>;
  contacts?: Array<AccountContactType>;
}
