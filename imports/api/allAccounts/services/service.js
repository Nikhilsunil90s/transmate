import { AllAccounts } from "../AllAccounts";
import { getType } from "./getAccountType";

const debug = require("debug")("account:AllAccounts:service");

function padding(pad, userStr, padPos) {
  if (typeof userStr === "undefined") return pad;
  if (padPos === "l") {
    return (pad + userStr).slice(-pad.length);
  }

  return (userStr + pad).substring(0, pad.length);
}

const AccountService = {
  // meteor fiber way
  generateId({ type }) {
    let typeCode;
    const min = 1;
    const max = 99999;

    switch (type) {
      case "shipper":
        typeCode = "S";
        break;
      case "carrier":
        typeCode = "C";
        break;
      case "provider":
        typeCode = "P";
        break;
      default:
        typeCode = "S";
    }
    const number = Math.floor(Math.random() * (max - min + 1) + min);
    return `${typeCode}${String(number).padStart(5, "0")}`;
  },

  // new async version
  async generateAccountId(type = "carrier") {
    let typeCode;
    const min = 1;
    const max = 99999;

    switch (type) {
      case "shipper":
        typeCode = "S";
        break;
      case "carrier":
        typeCode = "C";
        break;
      case "provider":
        typeCode = "P";
        break;
      default:
        typeCode = "S";
    }

    // try to create a new id for account and see if it is unique
    let accountId;

    try {
      let obj = true;
      do {
        const number = Math.floor(Math.random() * (max - min + 1) + min);
        accountId = `${typeCode}${padding("00000", number, "l")}`;
        debug("check account id :", accountId);
        // eslint-disable-next-line no-await-in-loop
        obj = await AllAccounts.findOne(
          { _id: accountId },
          { fields: { _id: 1 } }
        );
        debug("result check existing account:%o", obj);
      } while (obj);
    } catch (err) {
      console.error(err);
      throw Error("issue when generating accountID");
    }

    return accountId;
  },

  getType,

  create({ _id, type, name, created }) {
    // is role passed in? -> isnot a schema key
    return AllAccounts.create_async({
      _id,
      type,
      name,
      accounts: [],
      created
    });
  }
};
export { AccountService };
