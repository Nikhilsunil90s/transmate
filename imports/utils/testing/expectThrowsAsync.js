import { expect } from "chai";

const isError = err => {
  return err instanceof Error || err instanceof Meteor.Error;
};

export const expectThrowsAsync = async (method, errorMessage, cb) => {
  let error = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(isError(error)).to.equal(true);
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
  if (typeof cb === "function") {
    cb();
  }
};
