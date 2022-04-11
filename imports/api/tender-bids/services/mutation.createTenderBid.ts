import moment from "moment";
import { TenderBid } from "../TenderBid";
import { TenderBidType } from "../interfaces/tenderBid.d";

interface CreateTenderBid {
  accountId: string;
  userId: string;
  tenderBid?: TenderBidType;
  create: () => Promise<CreateTenderBid>;
  getUIResponse: () => TenderBidType;
}

export const createTenderBid: (a: {
  accountId: string;
  userId: string;
}) => CreateTenderBid = ({ accountId, userId }) => ({
  accountId,
  userId,
  async create() {
    const newTenderBid = {
      status: "open",
      tender: {
        stage: "pre-bid",
        receivedDate: moment()
          .startOf("day")
          .toDate(),
        dueDate: moment()
          .startOf("day")
          .add(2, "weeks")
          .toDate(),
        currentRound: 1,
        totalRounds: 1
      },
      source: {
        type: "file"
      },
      name: `New tenderBid ${moment().format("YYYY-MM-DD")}`,
      accountId,
      contacts: [{ userId, role: "owner" }],
      created: {
        by: userId,
        at: new Date()
      },
      updates: [
        {
          action: "create",
          userId: this.userId,
          ts: new Date()
        }
      ]
    };

    // @ts-ignore FIXME: TS
    this.tenderBid = await TenderBid.create_async(newTenderBid);
    return this;
  },
  getUIResponse() {
    return this.tenderBid;
  }
});
