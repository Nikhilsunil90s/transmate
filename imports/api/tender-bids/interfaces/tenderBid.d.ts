import { FileStoreWithId } from "/imports/api/documents/interfaces/files.d";
import { ByAt } from "/imports/api/_jsonSchemas/interfaces/model.d";

type TenderBidStatus = "open" | "closed" | "canceled" | "archived";
type TenderBidSourceOptions = "file" | "web" | "other";
type TenderBidStage = "pre-bid";
interface TenderBidContact {
  name: string;
  email?: string;
  phone?: string;
}
interface TenderBidOwnerContact {
  userId: string;
  role: "owner" | "manager" | "follower" | "analyst";
}

// TODO: move to workflow
interface WorkflowType {
  title: string;
  details?: string;
  dueBy: Date;
  owner?: string;
  isChecked: Boolean;
}

interface TenderBidOfferItem {
  version: number;
  ts: Date;
  validFrom: Date;
  validTo: Date;
  file: string;
}

// FIXME: methods come from model
export interface TenderBidType {
  push(arg0: any): TenderBidType;
  update_async(update: any): TenderBidType;
  pull(arg0: any): TenderBidType;
  pull_async(arg0: any): Promise<TenderBidType>;

  id?: string;
  _id?: string;
  number: string;
  name: string;
  status: TenderBidStatus;
  accountId: string;
  partnerId?: string;

  // meta info of customer:
  partner?: {
    name: string;
    accountNumbers?: Array<string>;

    // internalContacts: {
    //   accountManager: "W3WguXKt2cLu2h8LM",
    //   salesManager: "W3WguXKt2cLu2h8LM"
    // },
    segment?: string;
    contacts?: Array<TenderBidContact>;
  };

  notes?: string;

  workflow?: Array<WorkflowType>;

  source: {
    type: TenderBidSourceOptions;
    documents?: Array<FileStoreWithId>;
  };

  // internal contacts:
  contacts?: Array<TenderBidOwnerContact>;

  // all information concerning the tender itself:
  tender: {
    stage: TenderBidStage;
    receivedDate: Date;
    dueDate: Date;
    currentRound: number;
    totalRounds: number;
    volume?: number;
    volumeWon?: number;
    volumeUOM?: string; // fixme >>TS to options
    revenue?: {
      value: number;
      currency: string;
    };
  };

  // the offer the bidder makes from the UBS:
  offer?: {
    latest?: TenderBidOfferItem;
    history?: Array<TenderBidOfferItem>;
  };

  // control on bidding sheet: all params go here
  bidControl?: {
    priceLists?: Array<string>;
    itemCount?: Number;
    offeredCount?: Number;
    emptyCount?: Number;
    errors?: Array<Object>;
  };

  // timeStamps
  created: ByAt;
  updated?: ByAt;
}
