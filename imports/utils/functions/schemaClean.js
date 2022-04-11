// function that cleans an object according to simple schema
export const schemaClean = ({ schema, updates, options = {} }) => {
  let cleanUpdate;
  let validation;
  if (options.modifier) {
    ({ $set: cleanUpdate } = schema.clean(
      { $set: updates },
      { modifier: true }
    ));
    validation =
      schema.newContext().validate({ $set: cleanUpdate }, { modifier: true }) ||
      [];
  } else {
    cleanUpdate = schema.clean(updates);
    validation = schema.newContext().validate(updates);
  }

  if (options.throw && validation.length > 0) {
    throw new Meteor.Error("Validation error", validation.validationErrors());
  }

  return { cleanUpdate };
};
