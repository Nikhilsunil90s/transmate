import Ajv from "ajv";
import pick from "lodash.pick";
import dot from "dot-object";
import get from "lodash.get";

import { callCloudFunction } from "/imports/utils/server/ibmFunctions/callFunction";

// data
import { Address } from "/imports/api/addresses/Address";
import { AddressService } from "/imports/api/addresses/services/address";
import schema from "/imports/api/_jsonSchemas/restAPI/imports-address.json";

const debug = require("debug")("imports:address");

class DataImportAddress {
  constructor({ accountId, userId, importId }) {
    this.accountId = accountId;
    this.userId = userId;
    this.importId = importId;
    this.warnings = [];
    return this;
  }

  initData({ data }) {
    this.data = data;
    debug("data initialized");
    return this;
  }

  validate() {
    // schema validation for address:
    const ajv = new Ajv({ allErrors: true });
    this.isValid = ajv.validate(schema, this.data);

    if (!this.isValid) throw new Meteor.Error(ajv.errors);
    debug("data validated");
    return this;
  }

  transform() {
    return this;
  }

  async validateAddress() {
    // call external API
    // results, errors
    // this result -> store & link
    // use a sharable code -> block in Address.validate() should be replaced by this block too!!!

    const address = pick(this.data, [
      "name",
      "country",
      "city",
      "zipCode",
      "street",
      "nr",
      "bus"
    ]);

    const response = await callCloudFunction(
      "CheckAddress",
      {
        address,
        references: {
          accountId: this.accountId,
          creatorId: this.userId
        }
      },
      { accountId: this.accountId, userId: this.userId }
    );
    debug("call api address :", response);
    const { result } = response || {};

    debug("validated object: %O", result);

    // todo: some checks on faulty addresses ->  "validated" : {       "isValidated" : false
    if (get(result, ["validated", "isValidated"])) {
      debug("address is valid");
      this.address = result;
      this.addressId = result._id;
    } else {
      throw new Error("Could not validate the given address");
    }
    return this;
  }

  async addToAddressBook() {
    const srv = await AddressService.init({
      addressId: this.addressId,
      accountId: this.accountId,
      userId: this.userId
    });
    this.address = await srv.addToAddressBook({ name: this.data.name });
    return this;
  }

  async anotate() {
    // fields:
    const anotateData = dot.transform(
      {
        // <from> : <to>
        id: "externalId",
        notes: "notes",
        notesPackaging: "notesPackaging",
        notesLoading: "notesLoading",
        openingHours: "openingHours"
      },
      this.data
    );

    debug("anotating address %s, %o", this.addressId, anotateData);

    // update other accountFields through anotate (we set the addressId rather than initialize as it is a pure db call)
    const addressSRV = AddressService;
    addressSRV.addressId = this.addressId;
    await addressSRV.anotate(anotateData);
    return this;
  }

  get() {
    // get the address item (! might want to init again..)
    return {
      addressId: this.addressId,
      name: this.data.name,
      warnings: this.warnings
    };
  }

  check() {
    const addr = Address.first(this.addressId);
    debug("document after updates: %O", addr);
  }
}

export { DataImportAddress };
