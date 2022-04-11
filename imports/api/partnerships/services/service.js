import get from "lodash.get";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";

class PartnerShipService {
  constructor({ requestorId, requestedId }) {
    this.requestorId = requestorId;
    this.requestedId = requestedId;
    if (!this.requestorId) throw new Error("requestorId not set!");
    if (!this.requestedId) throw new Error("requestedId not set!");
  }

  async init() {
    this.requestor = await AllAccounts.first(
      { _id: this.requestorId },
      {
        fields: {
          _id: 1,
          name: 1,
          partners: { $elemMatch: { requestedId: this.requestedId } }
        }
      }
    );
    this.requested = await AllAccounts.first(
      { _id: this.requestedId },
      {
        fields: {
          _id: 1,
          name: 1,
          partners: { $elemMatch: { requestedId: this.requestedId } }
        }
      }
    );
    if (!this.requestor) throw new Error("Requestor account not found");
    if (!this.requested) throw new Error("Requested account not found");
    return this;
  }

  async update({ update }) {
    // modify other:
    await AllAccounts._collection.update(
      {
        _id: this.requestedId,
        partners: {
          $elemMatch: { accountId: this.requestorId }
        }
      },
      { $set: update },
      { bypassCollection2: true }
    );

    // modify self:
    await AllAccounts._collection.update(
      {
        _id: this.requestorId,
        partners: {
          $elemMatch: { accountId: this.requestedId }
        }
      },
      { $set: update },
      { bypassCollection2: true }
    );
    return this;
  }

  async setStatus({ status }) {
    // console.log(status); return;
    await this.update({ update: { "partners.$.status": status } });
    return this;
  }

  async create(data = {}) {
    // console.log('ok');
    // console.log(data);
    const { importId } = data;
    if (!this.requested) {
      throw new Error("not-found", "Partner account not found");
    }

    // console.log(status); return;
    const partnerShip = get(this.requested, ["partners", 0]);
    if (partnerShip && partnerShip.status !== "active") {
      await this.setStatus({ status: "requested" });
    } else if (partnerShip && partnerShip.status === "active") {
      return this;
    } else {
      // modify other:
      await Promise.all([
        this.requested.push(
          {
            partners: {
              accountId: this.requestorId,
              status: "requested",
              requestor: false,
              ...(importId ? { importId } : undefined)
            },
            accounts: {
              accountId: this.requestorId,
              name: this.requested.name,
              profile: {},
              coding: {}
            }
          },
          true
        ),

        // modify self:
        this.requestor.push(
          {
            partners: {
              accountId: this.requestedId,
              status: "requested",
              requestor: true
            },
            accounts: {
              accountId: this.requestedId,
              profile: {},
              coding: {}
            }
          },
          true
        )
      ]);
    }
    return this;
  }

  async remove() {
    // remove items from own
    await this.requestor.pull({ partners: { accountId: this.requestedId } });

    // remove items from other
    await this.requested.pull({ partners: { accountId: this.requestorId } });

    return this;
  }

  get() {
    return {
      requestedBy: this.requestor,
      requestedTo: this.requested
    };
  }
}

export { PartnerShipService };
