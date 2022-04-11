import { _ } from "meteor/underscore";
import { Random } from "/imports/utils/functions/random.js";
import faker from "faker";
import { AccountService } from "../../services/service";
import { generateByAt } from "../../../../utils/testing/dataGeneration/generateByAt";

export const accountTestData = {
  dbData({ type, role, profile = false }) {
    // data that is inputted directly into the DB (through Factory)
    const obj = {
      _id: AccountService.generateId({ type }),
      name: faker.lorem.words(),
      type,
      created: {
        by: Random.id(),
        at: new Date()
      }
    };
    if (type === "provider") {
      obj.role = role || _.sample(["warehouse", "forwarder", "customs"]);
    }
    if (profile) {
      obj.profile = {
        certificates: ["ISO 1000"],
        footprint: ["be", "es"],
        services: ["groupage", "transport"]
      };
    }
    return obj;
  },
  modelData({ type, role }) {
    // data that passes the model (not through Factory)
    // type is either ['shipper','carrier','provider']
    const obj = {
      name: faker.lorem.words(),
      type
    };
    if (type === "provider") {
      obj.role = role || _.sample(["warehouse", "forwarder", "customs"]);
    }
    return obj;
  },

  invite({ type, role }) {
    const baseObj = this.modelData({ type, role });
    baseObj.company = baseObj.name;
    delete baseObj.name;
    const obj = {
      ...baseObj,
      sendInvite: true,
      email: faker.internet.email(),
      name: faker.name.findName()
    };
    return obj;
  },

  dbDataCarrier({ carrierId }) {
    return {
      _id: carrierId,
      type: "carrier",
      name: faker.lorem.words(),
      description: faker.lorem.paragraph(),
      logo: faker.internet.url(),
      banner: faker.internet.url(),

      validated: true,
      created: generateByAt()
    };
  },

  profileData() {
    return {
      sites: [
        {
          name: "main",
          url: "https://www.dachser.com/fr/en/index.php"
        }
      ],
      services: ["entargo", "classicline", "directload", "targo on-site"],
      certificates: ["ISO 27001", "ISO/IEC 27001:2005", "ISO 9001"]
    };
  }
};
