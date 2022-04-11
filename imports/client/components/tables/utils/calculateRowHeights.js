const DEFAULT_ROW_HEIGHT = 45;
const DEFAULT_HEADER_HEIGHT = 45;
const DEFAULT_NUMBER_OF_HEADERS = 1;
const DEFAULT_VIEW_SELECT_HEADER_HEIGHT = 30;
const MINIMUM_NO_OF_ROWS = 10;

// todo memoize this function
export const calculateRowHeights = input => {
  const {
    numberOfHeaders = DEFAULT_NUMBER_OF_HEADERS,
    headerHeight = DEFAULT_HEADER_HEIGHT,
    rowHeight = DEFAULT_ROW_HEIGHT,
    containerHeight
  } = input || {};

  const totalHeaderHeight =
    numberOfHeaders * headerHeight + DEFAULT_VIEW_SELECT_HEADER_HEIGHT;
  const windowHeight = Math.floor(containerHeight - headerHeight * 4);
  const windowEvaluation = Math.floor(windowHeight / rowHeight);

  // minimum show 8 rows
  const maxRows =
    Math.max(MINIMUM_NO_OF_ROWS, windowEvaluation) || MINIMUM_NO_OF_ROWS;

  return {
    maxRows,
    totalHeaderHeight,
    headerHeight,
    rowHeight,
    containerHeight,
    windowEvaluation
  };
};
