const debug = require("debug")("analysis:security");

export const initializeSecurity = ({ analysis }) => {
  debug("analysis", analysis);
  return {
    canEdit: true
  };
};
