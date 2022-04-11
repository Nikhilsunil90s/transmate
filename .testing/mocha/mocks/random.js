const { createId } = require("../DefaultMongo.js");

module.exports = {
  Random: {
    id: chars => {throw Error("you should not use meteor/random anymore, use alternative in stack")},
    secret: chars => {throw Error("you should not use meteor/random anymore, use alternative in stack")}
  }
};
