import graphqlFields from "graphql-fields";

export function projectFields(info, fieldPath = null) {
  const selections = graphqlFields(info);
  const fieldProjection = Object.keys(
    fieldPath ? selections[fieldPath] : selections
  ).reduce((a, b) => ({ ...a, [b]: 1 }), {});
  return fieldProjection;
}
