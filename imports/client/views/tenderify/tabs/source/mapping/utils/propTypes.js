import PropTypes, { string, bool, number } from "prop-types";

const linkedMapping = {
  fill: bool,
  target: string,
  location: PropTypes.shape({
    absolute: string,
    relative: PropTypes.shape({
      r: PropTypes.oneOfType([string, number]),
      c: PropTypes.oneOfType([string, number])
    })
  })
};

export const mappingHType = {
  cell: string,
  origin: string,
  target: string,
  type: string,
  updated: bool,
  accountId: string,
  workbookFile: string,
  linkedMapping: PropTypes.arrayOf(PropTypes.shape(linkedMapping))
};
