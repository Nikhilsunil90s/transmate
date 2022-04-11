/* eslint-disable no-use-before-define */
import React from "react";
import { Trans } from "react-i18next";

// UI
import { Form, Grid, Button } from "semantic-ui-react";
import { toggleSidePanel } from "../../../sidebar/toggleSidePanel";

const ShipmentCostChange = ({ shipment, canSelectCarrier }) => {
  const { carrier } = shipment;
  return (
    <Form>
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <Form.Field>
              {[
                <label key="label">
                  <Trans i18nKey="shipment.form.costs.carrier" />
                </label>,
                <div
                  key="name"
                  style={{ display: "inline-block", marginRight: "1em" }}
                  data-test="selectedCarrier"
                >
                  {carrier ? carrier.name : ""}
                </div>,
                canSelectCarrier && (
                  <Button
                    key="button"
                    onClick={toggleSidePanel}
                    basic
                    primary
                    className="select-carrier"
                    content={
                      carrier ? (
                        <Trans i18nKey="shipment.form.costs.button.change" />
                      ) : (
                        <Trans i18nKey="shipment.form.costs.button.select" />
                      )
                    }
                    data-test="changeCarrierBtn"
                  />
                )
              ]}
            </Form.Field>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Form>
  );
};

export default ShipmentCostChange;
