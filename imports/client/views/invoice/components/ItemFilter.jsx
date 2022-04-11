import React from "react";
import { Form, Grid, Checkbox, Divider } from "semantic-ui-react";

const InvoiceItemsFilter = ({ show, filters = {}, setFilter }) => {
  return show ? (
    <>
      <Form>
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column>
              <Form.Field>
                <Checkbox
                  label="shipments without costs"
                  checked={filters.withoutCosts}
                  onChange={(e, { checked }) => setFilter({ key: "withoutCosts", on: checked })}
                />
              </Form.Field>
              <Form.Field>
                <Checkbox
                  label="shipments with large delta"
                  checked={filters.largeDelta}
                  onChange={(e, { checked }) => setFilter({ key: "largeDelta", on: checked })}
                />
              </Form.Field>
            </Grid.Column>
            <Grid.Column>
              <Form.Field>
                <Checkbox
                  label="shipments with costs"
                  checked={filters.withCosts}
                  onChange={(e, { checked }) => setFilter({ key: "withCosts", on: checked })}
                />
              </Form.Field>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
      <Divider clearing />
    </>
  ) : null;
};

export default InvoiceItemsFilter;
