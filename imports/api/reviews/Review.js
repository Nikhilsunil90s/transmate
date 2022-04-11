import { Mongo } from "meteor/mongo";
import Model from "../Model";
import { ReviewSchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/review";

class Review extends Model {
  // eslint-disable-next-line camelcase
  static before_create(obj) {
    delete obj.createdAt;
    return obj;
  }
}

Review._collection = new Mongo.Collection("reviews");

Review._collection.attachSchema(ReviewSchema);
Review._collection = Review.updateByAt(Review._collection);
export { Review };
