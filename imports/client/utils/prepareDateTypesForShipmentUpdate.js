const prepareDateTypesForShipmentUpdate = ({
  updateKey,
  value,
  initialValues = {}
}) => {
  const [directionType, dateType] = updateKey.split(".");

  const shipmentDirection = initialValues[directionType];
  shipmentDirection[dateType] = value;

  const { day, time } = shipmentDirection || {};
  return new Date(`${day} ${time}`);
};

export default prepareDateTypesForShipmentUpdate;
