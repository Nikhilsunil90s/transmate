import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";

import SecurityChecks from "/imports/utils/security/_security";

// collections
import { Invoice } from "/imports/api/invoices/Invoice";
import { AllAccounts } from "../allAccounts/AllAccounts";

// still in use?
export const shipmentCredit = new ValidatedMethod({
  name: "invoice.shipment.credit",
  validate: new SimpleSchema({
    invoiceId: {
      type: String
    },
    costIndex: {
      type: Number
    },
    delta: {
      type: Number
    }
  }).validator(),
  run({ invoiceId, costIndex, delta }) {
    SecurityChecks.checkLoggedIn(this.userId);
    const invoice = Invoice.first({
      _id: invoiceId,
      accountId: AllAccounts.id(this.userId)
    });
    SecurityChecks.checkIfExists(invoice);

    invoice.update({
      [`shipments.${costIndex}.creditNote.requested.by`]: this.userId,
      [`shipments.${costIndex}.creditNote.requested.at`]: new Date(),
      [`shipments.${costIndex}.creditNote.amount`]: delta
    });
  }
});

export const shipmentSettle = new ValidatedMethod({
  name: "invoice.shipment.settle",
  validate: new SimpleSchema({
    invoiceId: {
      type: String
    },
    costIndex: {
      type: Number
    },
    delta: {
      type: Number
    }
  }).validator(),
  run({ invoiceId, costIndex, delta }) {
    SecurityChecks.checkLoggedIn(this.userId);
    const invoice = Invoice.first({
      _id: invoiceId,
      accountId: AllAccounts.id(this.userId)
    });
    SecurityChecks.checkIfExists(invoice);

    invoice.update({
      [`shipments.${costIndex}.creditNote.settled.by`]: this.userId,
      [`shipments.${costIndex}.creditNote.settled.at`]: new Date(),
      [`shipments.${costIndex}.creditNote.amount`]: delta
    });
  }
});

export const settle = new ValidatedMethod({
  name: "invoice.settle",
  validate: new SimpleSchema({
    invoiceId: {
      type: String
    }
  }).validator(),
  run({ invoiceId }) {
    SecurityChecks.checkLoggedIn(this.userId);
    const invoice = Invoice.first({
      _id: invoiceId,
      accountId: AllAccounts.id(this.userId)
    });
    SecurityChecks.checkIfExists(invoice);

    invoice.update({
      settled: true
    });
  }
});
