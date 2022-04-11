import { arraydiff } from "/imports/utils/functions/fnArrayHelpers";

export const checkUpdateFields = function checkUpdateFields(
  allowedKeys = [],
  updateKeys = []
) {
  // ensure dotted keys pass as well:
  const modKeys = updateKeys.map(key => key.split(".")[0]);

  const diff = arraydiff({
    subsetArr: modKeys,
    masterArr: allowedKeys
  });
  if (diff && diff.length > 0) {
    if (!!this.setMessage) {
      this.setMessage(`fields ${diff.concat(",")} are not allowed`);
    }
    return false;
  }
  return true;
};
