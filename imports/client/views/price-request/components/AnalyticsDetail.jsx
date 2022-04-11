import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Table, Popup, Button, Placeholder, Segment, Icon } from "semantic-ui-react";
import get from "lodash.get";
import { useQuery } from "@apollo/client";

import { leadTimeDays, currencyFormat } from "/imports/utils/UI/helpers";

import { GET_SHIPMENT_BY_ID_MINIMAL } from "../utils/queries";
import { ShipmentReferences, GeneralSummary } from ".";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const debug = require("debug")("price-request:analytics");

const PriceRequestAnalyticsDetail = ({ ...props }) => {
  debug("props", props);
  const { priceRequest } = props;
  const bidders = get(props, ["priceRequest", "bidders"], []);
  const items = get(props, ["priceRequest", "calculation", "items"], []);
  const currency = get(props, ["priceRequest", "currency"], "EUR");

  return items.length ? (
    <>
      <h3 className="section-header">BID DETAILS</h3>
      <Table compact celled definition singleLine className="detail">
        <Table.Header>
          <Table.Row key="header">
            {[
              "",
              "Ref.",
              ...bidders.map(bidder =>
                (bidder.name || "").length > 10 ? `${bidder.name.slice(0, 10)}...` : bidder.name
              )
            ].map((col, colIndex) => {
              return <Table.HeaderCell key={colIndex} content={col} />;
            })}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item, itemIndex) => {
            return <BodyRow key={itemIndex} {...{ item, bidders, currency }} />;
          })}
        </Table.Body>
        <Table.Footer>
          <FooterRow {...{ priceRequest, bidders, currency }} />
        </Table.Footer>
      </Table>
    </>
  ) : (
    <Trans i18nKey="price.request.analytics.details.emptyAnalysis" />
  );
};

function getOffer(bidderId, data) {
  return data.find(pl => pl && pl.accountId === bidderId);
}

const BodyRow = ({ item, bidders, currency }) => {
  const { t } = useTranslation();

  // shipmentInfo:
  const { shipmentId, priceLists = [] } = item;
  const { data: shipmentData = {}, loading, error } = useQuery(GET_SHIPMENT_BY_ID_MINIMAL, {
    variables: { shipmentId },
    fetchPolicy: "cache-and-network",
    skip: !shipmentId
  });

  const { shipment } = shipmentData;
  debug("apollo returns GET_SHIPMENT_BY_ID_MINIMAL %o", { shipment, loading, error });

  return (
    <Table.Row key={`body_${shipmentId}`}>
      {/* block with shipment info */}
      <Table.Cell>
        <Button.Group icon basic size="mini">
          <Popup
            flowing
            on="click"
            popperDependencies={[shipment]}
            content={
              loading ? (
                <Placeholder style={{ minWidth: "200px" }}>
                  <Placeholder.Line length="short" />
                  <Placeholder.Line length="short" />
                </Placeholder>
              ) : (
                <ShipSummary shipment={shipment} />
              )
            }
            trigger={<Button icon="eye" />}
          />

          <Button
            icon="external alternate"
            onClick={() =>
              window.open(generateRoutePath("shipment", { _id: item.shipmentId }), "_blank")
            }
          />
        </Button.Group>
      </Table.Cell>
      <Table.Cell>
        {get(shipment, "references.number") || get(shipment, "number") || item.number}
      </Table.Cell>

      {/* block with bidder info*/}
      {bidders.map(({ accountId: bidderId, name: bidderName }) => {
        const offer = getOffer(bidderId, priceLists);
        return (
          <Table.Cell key={bidderId}>
            {!!offer ? (
              <Popup
                header={
                  item.totalCost !== 0 ? (
                    `${bidderName}`
                  ) : (
                    <Trans i18nKey="price.request.analytics.details.empty.header" />
                  )
                }
                content={
                  item.totalCost !== 0 ? (
                    <Table
                      size="small"
                      compact
                      tableData={Object.entries({
                        totalCost: currencyFormat(offer.totalCost, currency),
                        leadTime: leadTimeDays(offer.leadTime),
                        isCheapest: `${!!offer.isCheapest}`,
                        isFastest: `${!!offer.isFastest}`
                      })}
                      renderBodyRow={([k, v]) => ({
                        key: k,
                        cells: [t(`price.request.analytics.details.info.${k}`), v]
                      })}
                    />
                  ) : (
                    <Trans i18nKey="price.request.analytics.details.empty.content" />
                  )
                }
                trigger={
                  <span>
                    <span className="supsub">
                      {offer.isCheapest && (
                        <sup>
                          <Icon name="trophy" size="small" />
                        </sup>
                      )}

                      {offer.isFastest && (
                        <sub>
                          <Icon size="small" name="stopwatch" />
                        </sub>
                      )}
                    </span>

                    <span>
                      {currencyFormat(offer.totalCost, currency)}
                      <sup> {leadTimeDays(offer.leadTime)}d </sup>
                    </span>
                  </span>
                }
              />
            ) : (
              " - "
            )}
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
};

const FooterRow = ({ priceRequest, bidders, currency }) => {
  const totals = get(priceRequest, ["calculation", "totals"], []);
  return (
    <Table.Row key="footer">
      <Table.Cell key="empty1" />
      <Table.Cell key="empty2" />
      {/* block with bidder info*/}
      {bidders.map(({ accountId: bidderId }) => {
        const offer = getOffer(bidderId, totals);
        return (
          <Table.Cell key={bidderId}>
            {!!offer ? (
              <span>
                {currencyFormat(offer.totalCost, currency)}
                <sup> {leadTimeDays(offer.leadTime)}d </sup>
              </span>
            ) : (
              " - "
            )}
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
};

const ShipSummary = ({ shipment }) => {
  return (
    <Segment padded>
      <ShipmentReferences shipment={shipment} />
      <GeneralSummary shipment={shipment} />
    </Segment>
  );
};

export default PriceRequestAnalyticsDetail;
