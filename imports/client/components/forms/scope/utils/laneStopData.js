export const getLaneStopData = ({ lanes }) => {
  let addressIds = [];

  if (lanes != null) {
    lanes.forEach(lane => {
      return ["from", "to"].forEach(fromTo => {
        const addressIdsLane = lane[fromTo].addressIds || [];
        if (addressIdsLane.length > 0) {
          addressIds = [...addressIds, ...addressIdsLane];
        }
      });
    });
  }

  return { addressIds };
};
