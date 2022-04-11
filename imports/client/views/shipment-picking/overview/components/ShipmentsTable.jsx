import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { Button, Popup, List, Icon } from "semantic-ui-react";

import { ReactTableWithRowResizer } from "/imports/client/components/tables";
import { DateTimeTag, NumberTag, LocationMinTag } from "/imports/client/components/tags";
import ButtonActions from "./ButtonActions";
import PickingStatus from "./PickingStatus";
import PickingTag from "./PickingTag";
import { checkForErrors } from "../../utils/checkForDataErrors";
import { VIEWS_WITH_TRACKING_IDS } from "/imports/api/shipmentPicking/enums/views";

const ItemsSummaryCell = ({ nestedItems }) => {
  if (!nestedItems || !nestedItems.length) return " - ";
  const items = nestedItems
    .filter(({ isPackingUnit }) => !isPackingUnit)
    .reduce(
      (acc, cur) => {
        acc[cur.isPicked ? "picked" : "open"] += cur.quantity?.amount || 0;
        return acc;
      },
      { picked: 0, open: 0 }
    );
  return (
    <Popup
      content={
        <List>
          {nestedItems
            .filter(({ isPackingUnit }) => !isPackingUnit)
            .map((item, i) => (
              <List.Item
                key={`item-${i}`}
                icon={item.isPicked ? "check" : "circle outline"}
                content={item.description}
              />
            ))}
        </List>
      }
      trigger={
        <div>
          <NumberTag value={items.picked} /> / <NumberTag value={items.picked + items.open} />
        </div>
      }
    />
  );
};

const ShipmentsTable = ({ items, onCancel, onPrint, isLoading, hasAddressId, currentViewKey }) => {
  const { t } = useTranslation();
  const columns = [
    {
      Header: t("picking.overview.columns.status"),
      accessor: "pickingStatus",
      Cell: ({ value }) => <PickingStatus status={value} />
    },
    {
      Header: t("picking.overview.columns.errors"),
      id: "errorsColumn",
      Cell: ({ row: { original } }) => {
        const errorChecks = checkForErrors(original);
        return Object.values(errorChecks).some(a => a) ? (
          <Popup
            content={Object.entries(errorChecks)
              .filter(([, v]) => v)
              .map(([k]) => t(`picking.errors.${k}`))}
            trigger={
              <div>
                <Icon color="red" name="warning sign" />
              </div>
            }
          />
        ) : null;
      }
    },
    {
      Header: t("picking.overview.columns.tag"),
      accessor: "tags", // []
      Cell: ({ value, row: { original } }) => <PickingTag shipmentId={original.id} tags={value} />
    },
    {
      Header: t("picking.overview.columns.reference"),
      accessor: "references.number",
      Cell: ({ value }) => value || ""
    },

    // {
    //   Header: t("picking.overview.columns.pickupLocation"),
    //   accessor: "pickup.location",
    //   Cell: ({ value }) => <LocationMinTag location={value} />
    // },
    {
      Header: t("picking.overview.columns.created"),
      accessor: "created.at",
      Cell: ({ value }) => <DateTimeTag date={value} />
    },
    {
      Header: t("picking.overview.columns.pickupDate"),
      accessor: "pickup.datePlanned",
      Cell: ({ value }) => <DateTimeTag date={value} />
    },
    {
      Header: t("picking.overview.columns.deliveryLocation"),
      accessor: "delivery.location",
      Cell: ({ value }) => <LocationMinTag location={value} />
    },
    {
      Header: t("picking.overview.columns.deliveryDate"),
      accessor: "delivery.datePlanned",
      Cell: ({ value }) => <DateTimeTag date={value} />
    },
    {
      Header: t("picking.overview.columns.items"),
      accessor: "nestedItems",
      Cell: ({ value }) => <ItemsSummaryCell nestedItems={value} />
    },
    {
      Header: t("picking.overview.columns.trackingNumbers"),
      accessor: "trackingNumbers",
      Cell: ({ value: trackingNumbers }) =>
        trackingNumbers?.length ? trackingNumbers.join(", ") : null
    },
    {
      Header: t("picking.overview.columns.actions"),
      accessor: "id",
      Cell: ({ value: shipmentId, row: { original } }) => (
        <ButtonActions
          shipmentId={shipmentId}
          shipmentStatus={original.status}
          pickingStatus={original.pickingStatus}
          onCancel={onCancel}
          onPrint={onPrint}
        />
      )
    }
  ];

  const shouldShowTrackingReferenceColumn = VIEWS_WITH_TRACKING_IDS.includes(currentViewKey);

  return (
    <div>
      <div style={{ position: "absolute", width: "100%", height: "100%", overflowY: "scroll" }}>
        <ReactTableWithRowResizer
          paginate
          shouldShowFooterPagination
          initialState={{
            hiddenColumns: shouldShowTrackingReferenceColumn ? [] : ["trackingNumbers"]
          }}
          columns={columns}
          data={items}
          isLoading={isLoading}
          paginationContent={
            <>
              <Button
                as="a"
                primary
                icon="arrow left"
                content={<Trans i18nKey="form.back" />}
                href="/shipments"
              />

              <Button
                primary
                basic
                icon="print"
                content={<Trans i18nKey="picking.manifest.footerBtn" />}
                href="/manifest"
                disabled={!hasAddressId}
              />
            </>
          }
        />
      </div>
    </div>
  );
};

export default ShipmentsTable;
