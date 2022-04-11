/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */

import { Random } from "/imports/utils/functions/random.js";
import { expect } from "chai";

describe("random", function() {
  it("get default id", function() {
    const id = Random.id();
    expect(id.length).to.equal(17);
  });

  it("get long id", function() {
    const id = Random.id(47);
    expect(id.length).length.to.equal(47);
  });

  it("get secret", function() {
    const id = Random.secret();
    expect(id.length).length.to.equal(43);
  });
});
