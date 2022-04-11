/** projects fields to mongo projection for queries
 * @param {[String]} fields
 */
export function projectFields(fields = []) {
  const res = {};
  fields.forEach(field => {
    res[field] = 1;
  });
  return res;
}
