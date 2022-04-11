/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
import React from "react";
import { Form } from "semantic-ui-react";

const ShipmentReferences = ({ shipment }) => {
  const { number, references = {} } = shipment;
  const refs = Object.entries({ TMnumber: number, ...references }).filter(
    ([k, v]) => !!v && k !== "__typename"
  );
  return (
    <Form>
      <Form.Group widths="equal">
        {refs.map(([key, v], i) => (
          <Form.Field key={i}>
            <label>{key}</label>
            <p>{v}</p>
          </Form.Field>
        ))}
      </Form.Group>
    </Form>
  );
};

export default ShipmentReferences;
