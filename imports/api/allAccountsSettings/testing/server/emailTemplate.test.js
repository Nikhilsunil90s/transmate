/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
// import { expect } from "chai";

// import { AllAccountsSettings } from "../../AllAccountsSettings";

// const templateId = "shipment-create";
// const accountId = "myAccountId";
// const customTemplateId = "customTemplateId";

// const settingsDocument = {
//   _id: accountId,
//   emails: { [templateId]: customTemplateId }
// };

// todo fix tests
describe("EmailTemplate", function() {
  // obsolete
  // before(function() {
  //   AllAccountsSettings._collection.remove({});
  //   AllAccountsSettings._collection.direct.insert(settingsDocument);
  // });
  // describe("getting custom tempalate", function() {
  //   it("should return original template when no record is found in database", function() {
  //     const numberOfObj = AllAccountsSettings._collection.find({}).count();
  //     expect(numberOfObj).to.equal(1);
  //     const relevantTemplateId = AllAccountsSettings.getCustomTemplateId({
  //       accountId: "not-existing-account",
  //       templateId
  //     });
  //     expect(relevantTemplateId).to.equal(templateId);
  //   });
  //   it("should return original template when record is found in database, but has no corresponding custom template", function() {
  //     const numberOfObj = AllAccountsSettings._collection.find({}).count();
  //     expect(numberOfObj).to.equal(1);
  //     const otherTemplateId = "test2";
  //     const relevantTemplateId = AllAccountsSettings.getCustomTemplateId({
  //       accountId,
  //       templateId: otherTemplateId
  //     });
  //     expect(relevantTemplateId).to.equal(otherTemplateId);
  //   });
  //   it("should return custom template when record is found in database", function() {
  //     const numberOfObj = AllAccountsSettings._collection.find({}).count();
  //     expect(numberOfObj).to.equal(1);
  //     // debug(
  //     //   "docs AllAccountsSettings",
  //     //   AllAccountsSettings._collection.find({}).fetch()
  //     // );
  //     const relevantTemplateId = AllAccountsSettings.getCustomTemplateId({
  //       accountId,
  //       templateId
  //     });
  //     expect(relevantTemplateId).to.equal(customTemplateId);
  //   });
  // });
});
