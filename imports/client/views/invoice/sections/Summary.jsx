import React from "react";
import { Grid, List, Table } from "semantic-ui-react";
import { currencyFormat, percentFormat } from "/imports/utils/UI/helpers";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

import { tabPropTypes } from "../utils/_tabProptypes";

//#region components
const InvoiceSummary = ({ invoice: { totals, invoiceCurrency } }) => {
  const currency = invoiceCurrency || "EUR";
  const tableData = [
    {
      label: "Total Invoice",
      value: currencyFormat(totals.invoice.total, currency),
      pct: percentFormat(totals.invHasCostCount / totals.shipCount, 2)
    },
    {
      label: "Total Calculated",
      value: currencyFormat(totals.shipment.total, currency),
      pct: percentFormat(totals.shipHasCostCount / totals.shipCount, 2)
    }
  ];
  const renderBodyRow = ({ label, value, pct }, i) => ({
    key: `row-${i}`,
    cells: [label, value, pct]
  });
  const footerRow = ["Delta", currencyFormat(totals.delta, currency), ""];

  return (
    <Grid columns={2}>
      <Grid.Row>
        <Grid.Column>
          <Table
            definition
            renderBodyRow={renderBodyRow}
            tableData={tableData}
            footerRow={footerRow}
          />
        </Grid.Column>
        <Grid.Column>
          <List>
            {totals.dateMismatch > 0 && (
              <List.Item>{`${totals.dateMismatch} shipments have deviating currency dates`}</List.Item>
            )}
            {totals.largeDeltaCount > 0 && (
              <List.Item>{`${totals.largeDeltaCount} shipments have large deltas`}</List.Item>
            )}
          </List>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};
//#endregion

const InvoiceSummarySection = ({ ...props }) => {
  return <IconSegment title="Summary" icon="calculator" body={<InvoiceSummary {...props} />} />;
};

InvoiceSummarySection.propTypes = { ...tabPropTypes };

export default InvoiceSummarySection;
