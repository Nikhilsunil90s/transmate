import React from "react";
import { Popup, Icon } from "semantic-ui-react";

const LIMIT_LOW = -50;
const LIMIT_HIGH = 50;

const ItemWarnings = ({ invoiceItem = {} }) => {
  const largeDelta = invoiceItem.delta < LIMIT_LOW || invoiceItem.delta > LIMIT_HIGH;
  const dateMismatch = invoiceItem.dateMatch?.match === false;

  return (
    <>
      {largeDelta && <Popup content="Delta exceeds limit" trigger={<Icon name="attention" />} />}
      {dateMismatch && (
        <Popup content="Currency dates differ" trigger={<Icon name="calendar times outline" />} />
      )}
    </>
  );
};

export default ItemWarnings;
