/* eslint-disable no-underscore-dangle */
import { Mongo } from "meteor/mongo";

// between mongo pure & meteor mongo there is a difference
// we ensure that we have a correct ObjectID initialization

export const toObjectID = id => {
  console.log(id._str);
  if (id._str) {
    return new Mongo.ObjectID(id._str);
  }
  return new Mongo.ObjectID(id);
};
