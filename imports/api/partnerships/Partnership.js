import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import Model from "../Model";
import { PartnershipSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/partnership";

// DEPRECATED
class Partnership extends Model {
  static query(accountId, type, status = ["active"]) {
    const query = {
      "partners.id": accountId,
      status: {
        $in: status
      }
    };

    // Only partners of given type
    if (type) {
      query.partners = {
        $elemMatch: {
          id: {
            $ne: accountId
          },
          type
        }
      };
    }
    return query;
  }

  static create(obj) {
    // Check if the partnership exists in the database already
    const existing = this.first({
      $and: [
        {
          "partners.id": obj.partners[0].id
        },
        {
          "partners.id": obj.partners[1].id
        }
      ]
    });
    if (existing) {
      throw new Meteor.Error("duplicate", "This partnership already exists.");
    }
    return super.create(obj);
  }
}

Partnership._collection = new Mongo.Collection("partnerships");

Partnership._collection.attachSchema(PartnershipSchema);
Partnership._collection = Partnership.updateByAt(Partnership._collection);
export { Partnership };
