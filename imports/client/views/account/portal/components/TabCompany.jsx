import React from "react";
import { Form, Table } from "semantic-ui-react";

import { AutoField, ListAddField } from "uniforms-semantic";
import { CurrencyAmountField, SelectField } from "/imports/client/components/forms/uniforms";
import {
  ListRow,
  ListRowItem,
  NestedRow
} from "/imports/client/components/forms/uniforms/nestedTable";
import { toOptionList } from "../utils/helpers";

const DEFAULT_FLEET_LIST = [
  "truck",
  "sprinter",
  "sideLoader",
  "reefer",
  "thermoBiTemp",
  "curtainslider",
  "tautliner",
  "tipper",
  "flatBed",
  "bulkTruck",
  "tankTruck",
  "mega"
];

const CompanyTab = ({ canEdit }) => {
  const fleetOptions = toOptionList(DEFAULT_FLEET_LIST);
  return (
    <>
      <Form.Group widths={2}>
        <AutoField name="established" label="Established in" />
        <CurrencyAmountField name="turnover" label="Annual turnover" />
      </Form.Group>
      <h3>Fleet</h3>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell content="Type" width={10} />
            <Table.HeaderCell content="Count" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <ListRow name="fleet">
            <ListRowItem name="$">
              <NestedRow name="">
                <SelectField name="type" label={null} options={fleetOptions} />
                <AutoField name="count" label={null} />
              </NestedRow>
            </ListRowItem>
          </ListRow>
        </Table.Body>
      </Table>
      {canEdit && <ListAddField name="fleet.$" />}
    </>
  );
};

export default CompanyTab;
