/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
import React from "react";
import { Table } from "semantic-ui-react";

const RequirementSummary = ({ requirements = {} }) => {
  const { customsClearance, freeDays } = requirements;
  const biddingNotes = null;

  return (
    <Table definition>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell />
          <Table.HeaderCell>Description</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {customsClearance && <CustomsRow />}
        {freeDays && <FreeDaysRow {...{ freeDays }} />}
        {biddingNotes && <NotesRow {...{ notes: biddingNotes }} />}
      </Table.Body>
    </Table>
  );
};

const CustomsRow = () => (
  <Table.Row>
    <Table.Cell verticalAlign="top">Customs</Table.Cell>
    <Table.Cell>Customs clearance is required. Please include in bid.</Table.Cell>
  </Table.Row>
);

const FreeDaysRow = ({ freeDays = {} }) => (
  <Table.Row>
    <Table.Cell verticalAlign="top">Free days</Table.Cell>
    <Table.Cell style={{ padding: 0 }}>
      <Table definition>
        <Table.Body>
          <Table.Row>
            <Table.Cell collapsing> Condition </Table.Cell>
            <Table.Cell>{freeDays.condition}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell collapsing>Demurrage</Table.Cell>
            <Table.Cell>{freeDays.demurrage}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell collapsing>Detention</Table.Cell>
            <Table.Cell>{freeDays.detention}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </Table.Cell>
  </Table.Row>
);

const NotesRow = ({ notes }) => (
  <Table.Row>
    <Table.Cell verticalAlign="top">Notes</Table.Cell>
    <Table.Cell>{notes}</Table.Cell>
  </Table.Row>
);

export default RequirementSummary;
