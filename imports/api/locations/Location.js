import { Mongo } from "meteor/mongo";
import Model from "../Model";

class Location extends Model {
  format() {
    return `${this.latLng.lat},${this.latLng.lng}`;
  }

  line(num = 1) {
    switch (num) {
      case 1:
        return `${this.countryCode}`;
      case 2:
        return `${this.countryCode}${this.locationCode}`;
      default:
        return "";
    }
  }

  code() {
    return this.countryCode + this.locationCode;
  }
}

Location._collection = new Mongo.Collection("locations");
Location._collection = Location.updateByAt(Location._collection);
export { Location };
