/* eslint-disable camelcase */
import React from "react";
import PropTypes from "prop-types";
import get from "lodash.get";
import { Container, Grid, Segment, Table } from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";
import TrackAddress from "/imports/client/views/shipment-track/TrackAddress.jsx";
import { DateTimeTag, LocationSummaryTag, NumberTag } from "/imports/client/components/tags";
import { Trans, useTranslation } from "react-i18next";

const ParcelItems = ({ items }) => {
  const packingUnits = items.filter(({ isPackingUnit }) => isPackingUnit);
  return (
    <Table basic="very">
      <Table.Body>
        {packingUnits.map(({ id, quantity, weight_gross, weight_unit }) => (
          <Table.Row key={id}>
            <Table.Cell
              content={
                <>
                  {quantity.amount} {quantity.code}
                </>
              }
            />
            <Table.Cell content={<NumberTag value={weight_gross} suffix={weight_unit} />} />
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

const ManifestPrintout = ({ shipments }) => {
  const { t } = useTranslation();
  const firstShipment = shipments[0];
  return (
    <Container>
      <Segment>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10} />
            <Grid.Column width={6} textAlign="right">
              <Trans
                i18nKey="picking.manifest.printout.timeStamp"
                defaults="Printed on: <0/>"
                components={[<DateTimeTag key="ts" value={new Date()} />]}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={10}>
              <TrackAddress location={get(firstShipment, ["pickup", "location"])} />
            </Grid.Column>
            <Grid.Column width={6}>{firstShipment.carrier?.name}</Grid.Column>
          </Grid.Row>
        </Grid>
        <Segment clearing basic />

        <ReactTable
          columns={[
            {
              id: "reference",
              Header: t("picking.manifest.printout.reference"),
              Cell: ({ row: { original: o } }) => o.references?.number || o.number
            },
            {
              id: "destination",
              Header: t("picking.manifest.printout.destination"),
              accessor: "delivery.location",
              Cell: ({ value: destination }) => <LocationSummaryTag location={destination} />
            },
            {
              id: "consignee",
              Header: t("picking.manifest.printout.consignee"),
              accessor: "delivery.location",
              Cell: ({ value: destination }) => destination.name
            },
            {
              id: "itemSummary",
              Header: t("picking.manifest.printout.items"),
              accessor: "nestedItems",
              style: { padding: 0 },
              Cell: ({ value }) => <ParcelItems items={value || []} />
            }, // with tracking numbers
            {
              id: "deliveryDate",
              Header: t("picking.manifest.printout.deliveryDate"),
              accessor: "delivery",
              Cell: ({ value: delivery }) => (
                <DateTimeTag date={delivery.dateScheduled || delivery.datePlanned} />
              )
            }
          ]}
          data={shipments}
        />
      </Segment>
    </Container>
  );
};

ManifestPrintout.propTypes = {
  shipments: PropTypes.array
};

export default ManifestPrintout;
