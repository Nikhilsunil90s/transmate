import React from "react";

interface IAppProps {
  references?: {
    containerNo?: string;
    truckId?: string;
    trailerId?: string;
  };
}

const ItemEquipmentRefTag: React.FunctionComponent<IAppProps> = ({
  references
}) => {
  const { containerNo, truckId, trailerId } = references || {};
  if (truckId || trailerId) return <>{[truckId, trailerId].join("/")}</>;
  if (containerNo) return <>{containerNo}</>;
  return <>{" - "}</>;
};

export default ItemEquipmentRefTag;
