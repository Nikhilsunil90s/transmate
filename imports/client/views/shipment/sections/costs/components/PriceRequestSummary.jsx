/* eslint-disable no-use-before-define */
import React from "react";
import { Trans } from "react-i18next";

// UI
import { Segment, Form, Table } from "semantic-ui-react";
import moment from "moment";

const PriceRequestSummary = ({ priceRequest }) => {
  return priceRequest ? (
    <Segment>
      <Form.Field>
        <label>
          <Trans i18nKey="shipment.form.costs.priceRequest.label" />
        </label>
        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <Trans i18nKey="shipment.form.costs.priceRequest.status" />
              </Table.Cell>
              <Table.Cell>{priceRequest.status}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <Trans i18nKey="shipment.form.costs.priceRequest.offers" />
              </Table.Cell>
              <Table.Cell>
                {priceRequest.bids}/{priceRequest.biddersInRequest}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <Trans i18nKey="shipment.form.costs.priceRequest.expires" />
              </Table.Cell>
              <Table.Cell>{moment(priceRequest.dueDate).fromNow()}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Form.Field>
    </Segment>
  ) : null;
};

export default PriceRequestSummary;
