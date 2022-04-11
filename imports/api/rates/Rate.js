import { Mongo } from "meteor/mongo";
import fx from "money";
import Model from "../Model";

class Rate extends Model {
  convert(amount, from, to) {
    check(amount, Number);
    check(from, String);
    check(to, String);
    if (from === to) {
      return amount;
    }
    fx.base = this.base;
    fx.rates = this.rates;
    return fx.convert(amount, {
      from,
      to
    });
  }

  sum(costs, base) {
    fx.base = this.base;
    fx.rates = this.rates;
    const convertAndAdd = (sum, cost) => {
      return (
        sum +
        fx.convert(cost.cost, {
          from: cost.currency,
          to: base
        })
      );
    };
    return costs.reduce(convertAndAdd, 0);
  }
}

Rate._collection = new Mongo.Collection("rates");
Rate._collection = Rate.updateByAt(Rate._collection);
export { Rate };
