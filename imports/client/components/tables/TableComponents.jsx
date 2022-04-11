import React from "react";
import { Table, Icon } from "semantic-ui-react";

export const CellPositive = (
  <>
    <Table.Cell positive textAlign="center">
      <Icon name="checkmark" />
    </Table.Cell>
  </>
);

export const CellNegative = (
  <>
    <Table.Cell negative textAlign="center">
      <Icon name="close" />
    </Table.Cell>
  </>
);

export const emailsSend = qty => {
  return (
    <>
      <Table.Cell positive textAlign="center">
        <Icon name="send" />
        {qty}
      </Table.Cell>
    </>
  );
};

export const EmailMissing = (
  <>
    <Table.Cell negative textAlign="center">
      <Icon name="send" />
    </Table.Cell>
  </>
);
