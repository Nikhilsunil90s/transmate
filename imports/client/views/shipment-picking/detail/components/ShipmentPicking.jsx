import React, { useState, useRef, useEffect } from "react";
import { ApolloProvider, useMutation } from "@apollo/client";
import convert from "convert-units";
import { toast } from "react-toastify";
import { Trans, useTranslation } from "react-i18next";
import { Button, Segment, Popup, Checkbox, Icon, Grid } from "semantic-ui-react";
import get from "lodash.get";
import { ReactTable } from "/imports/client/components/tables";
import { GeneralSummary } from "/imports/client/views/price-request/components";
import { ITEM_TYPE_ICONS, DEFAULT_UNITS } from "/imports/api/_jsonSchemas/enums/shipmentItems";
import { NumberTag } from "/imports/client/components/tags";
import { buildNestedItems } from "/imports/api/items/items-helper";

import PackingModal from "./PackingModal";
import PackingLabelsModal from "./PackingLabelsModal";
import PackingFooter from "./PackingFooter";
import ErrorSummary from "./ErrorSummary";

import ChangeAddressModal from "../modals/AddressChangeModal";
import PickingStatus from "../../overview/components/PickingStatus";
import { ConfirmComponent } from "/imports/client/components/modals";
import { printPage } from "../../utils/printPage";
import ShipmentReferences from "/imports/client/views/price-request/components/ShipmentReferences";
import SplitItemModal from "/imports/client/views/shipment/sections/items/modals/SplitItemModal";
import { SPLIT_SHIPMENT_ITEM, UPDATE_SHIPMENT_LOCATION } from "../../utils/queries";
import { WEIGHT_DEFAULT } from "/imports/api/_jsonSchemas/enums/units";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

import client from "/imports/client/services/apollo/client"; // root -> required

const debug = require("debug")("shipment:picker");

const ShipmentPicking = ({
  shipmentId,
  data,
  refetch,
  shipmentItems = [],
  selectedItems,
  setSelectedItems,
  onCancelLabel,
  onSubmit,
  unpackItems,
  confirmState,
  setConfirmState,
  confirmCancelState,
  setConfirmCancelState,
  withButtons = true
}) => {
  const { t } = useTranslation();
  const [totalWeight, setTotalWeight] = useState({ amount: 0, uom: WEIGHT_DEFAULT });
  const formRef = useRef(null);

  const showConfirm = show => setConfirmState({ ...confirmState, show });
  const showConfirmCancel = show => setConfirmCancelState({ ...confirmCancelState, show });
  const [splitModalState, setSplitModalState] = useState({ show: false });
  const showSplitModal = show => setSplitModalState({ ...splitModalState, show });
  const [changeAddressModalState, setChangeAddressModalState] = useState({ show: false });

  const [splitItem] = useMutation(SPLIT_SHIPMENT_ITEM);
  const [updateShipmentLocation] = useMutation(UPDATE_SHIPMENT_LOCATION);

  /** @param {"pickup" | "delivery"} locType */
  const onClickEditLocation = locType => {
    // FIXME: title translation
    setChangeAddressModalState({
      show: true,
      title: locType,
      location: get(data.shipment, [locType, "location"]),
      locationType: locType
    });
  };

  const updateLocation = updatedLocation => {
    const { locationType } = changeAddressModalState;
    updateShipmentLocation({
      variables: { input: { shipmentId, locationType, updates: updatedLocation } }
    })
      .then(() => {
        toast.success("Location modified");
        setChangeAddressModalState({ show: false });
      })
      .catch(error => {
        console.error({ error });
        toast.error("Could not modify location");
      });
  };

  useEffect(() => {
    if (Boolean(selectedItems.length)) {
      const uom = selectedItems[0].weight_unit || WEIGHT_DEFAULT;
      const sum = selectedItems
        .map(({ weight_gross: weightGross, weight_unit: curUom = WEIGHT_DEFAULT }) =>
          convert(weightGross)
            .from(curUom)
            .to(uom)
        )
        .reduce((acc, n) => acc + n, 0);

      setTotalWeight({ amount: sum, uom });
    }

    return () => setTotalWeight({ amount: 0, uom: WEIGHT_DEFAULT });
  }, [selectedItems]);

  const onSelectItem = id => {
    const { nestedItems = [] } = data.shipment;
    const currentItem = nestedItems.find(({ id: currentItemId }) => currentItemId === id);

    setSelectedItems(prevItems => [...prevItems, currentItem]);
  };

  const onDeselectItem = id => {
    const filterdItems = selectedItems.filter(({ id: currentItemId }) => currentItemId !== id);

    setSelectedItems(filterdItems);
  };

  const deselectAllItems = () => setSelectedItems([]);

  const onConfirm = () => formRef.current.submit();

  const { pickup, delivery } = data.shipment;
  const toPickItems =
    shipmentItems &&
    shipmentItems.filter(
      ({ isPicked, isPackingUnit }) => isPicked !== true && isPackingUnit !== true
    );
  const pickedItems =
    shipmentItems &&
    buildNestedItems(shipmentItems).filter(
      ({ isPackingUnit, isPicked }) => isPicked === true || isPackingUnit === true
    );
  const existingItems =
    shipmentItems && shipmentItems.filter(({ isPackingUnit }) => isPackingUnit === true);
  const unpackAllItems = pickedItems.filter(
    ({ isPackingUnit, labelUrl }) => isPackingUnit && !labelUrl
  );

  const onPackAll = () => setSelectedItems(toPickItems);

  const onUnPackAll = () => {
    const packingUnitsIds = unpackAllItems.map(({ id }) => id);

    setConfirmState({ show: true, packingUnitsIds });
  };

  const onPrint = () => {
    printPage(
      <ApolloProvider client={client}>
        <ShipmentPicking
          shipmentId={shipmentId}
          data={data}
          shipmentItems={shipmentItems}
          withButtons={false}
        />
      </ApolloProvider>
    );
  };

  const handleSplitStage = ({ amount }) => {
    const { itemId } = splitModalState;
    if (!itemId || !amount) return;
    splitItem({ variables: { input: { shipmentItemId: itemId, amount } } })
      .then(res => {
        debug("handlesplitstage %o", res);
        toast.success("Items split");
        setSplitModalState({ show: false });
      })
      .catch(err => {
        console.error(err);
        toast.error("Could not split item");
      });
  };

  const mainTableColumns = [
    {
      accessor: "type",
      Cell: ({ value }) => <Icon name={ITEM_TYPE_ICONS[value] || "box"} />
    },
    {
      accessor: "quantity",
      Cell: ({ value = {} }) => (
        <NumberTag value={value.amount} suffix={value.code || value.description} />
      )
    },
    {
      accessor: "description",
      Header: t("item.material.description"),
      Cell: ({ value }) => value
    },
    {
      accessor: "temperature",
      Cell: ({ row: { original: item } }) =>
        get(item, ["temperature", "condition"], []) ? (
          <Popup
            content={get(item, ["temperature", "condition"])}
            trigger={<Icon name="thermometer quarter" />}
          />
        ) : null
    },
    {
      accessor: "DG",
      Cell: ({ row: { original: item } }) =>
        item.DG ? (
          <Popup content="Dangerous goods" trigger={<Icon name="exclamation triangle" />} />
        ) : null
    },
    {
      accessor: "weight_unit",
      Header: t("item.weight_gross"),
      Cell: ({ row: { original: item } }) => (
        <NumberTag value={item.weight_gross} suffix={item.weight_unit} />
      )
    }
  ];

  const renderChildrenRow = ({ row, colSpan }) => (
    <td colSpan={colSpan} style={{ paddingLeft: "4rem" }}>
      <ReactTable
        tableClass="ts-shipment-pick__table ui blue table"
        TheadComponent={() => null}
        columns={mainTableColumns}
        data={get(row, ["original", "subItems"], [])}
      />
    </td>
  );

  const expanded = {};
  (pickedItems || []).forEach((item, index) => {
    if (item.subItems && item.subItems.length > 0) {
      expanded[index] = true;
    }
  });

  return (
    <div style={{ maxWidth: "initial" }}>
      <div className="ts-shipment-pick__container">
        <Segment>
          <Grid>
            {/* title , picking status & link to shipment:*/}
            <Grid.Row>
              <Grid.Column width={13}>
                <h3 className="ts-shipment-pick__heading">
                  <Trans i18nKey="picking.detail.header">Picking</Trans>
                </h3>
              </Grid.Column>
              <Grid.Column width={2} textAlign="right">
                <PickingStatus status={data.shipment?.pickingStatus} />
                {data.shipment?.pickingStatus
                  ? t(`picking.detail.status.${data.shipment.pickingStatus}`)
                  : t("picking.detail.status.none")}
              </Grid.Column>
              <Grid.Column width={1} textAlign="right">
                <a
                  href={generateRoutePath("shipment", { _id: shipmentId })}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="share square outline" color="grey" />
                </a>
              </Grid.Column>
            </Grid.Row>
            {/* tracking numbers from labels if any*/}
            {data.shipment?.trackingNumbers?.length && (
              <Grid.Row>
                <Grid.Column width={13} />
                <Grid.Column width={3} textAlign="right">
                  {/* List all tracking Numbers*/}
                  {data.shipment.trackingNumbers.map((trackingNumber, i) => (
                    <span key={`trackingNumber-${i}`}>{trackingNumber}</span>
                  ))}
                </Grid.Column>
              </Grid.Row>
            )}
          </Grid>
          <ShipmentReferences shipment={data.shipment} />
          <GeneralSummary
            shipment={{ pickup, delivery }}
            className="ts-shipment-pick__table"
            canEdit
            onClickEditLocation={onClickEditLocation}
          />
          <ChangeAddressModal
            show={changeAddressModalState.show}
            location={changeAddressModalState.location}
            showModal={show => setChangeAddressModalState({ ...changeAddressModalState, show })}
            onSubmitForm={updateLocation}
          />
          <ErrorSummary shipment={data.shipment} />

          {withButtons && (
            <Grid.Row>
              {Boolean(toPickItems.length) && (
                <PackingModal
                  btnText={t("picking.detail.actions.packAll")}
                  onClick={onPackAll}
                  existingItems={existingItems}
                  newItems={DEFAULT_UNITS}
                  totalWeight={totalWeight}
                  formRef={formRef}
                  onSubmit={onSubmit}
                  onConfirm={onConfirm}
                  onCancel={deselectAllItems}
                />
              )}
              {Boolean(selectedItems.length) && (
                <PackingModal
                  btnColor="grey"
                  btnText={t("picking.detail.actions.packSelected")}
                  existingItems={existingItems}
                  newItems={DEFAULT_UNITS}
                  totalWeight={totalWeight}
                  formRef={formRef}
                  onSubmit={onSubmit}
                  onConfirm={onConfirm}
                />
              )}
            </Grid.Row>
          )}

          {Boolean(toPickItems.length) && (
            <>
              <h3 className="ts-shipment-pick__heading">{t("picking.detail.toBePickedTitle")}</h3>

              <ReactTable
                tableClass="ts-shipment-pick__table ui table"
                data={toPickItems}
                columns={[
                  {
                    accessor: "id",
                    id: "selectColumn",
                    Cell: ({ value }) => {
                      const handleChange = (e, { checked }) => {
                        if (checked) onSelectItem(value);
                        else onDeselectItem(value);
                      };

                      const isChecked =
                        selectedItems && selectedItems.find(({ id }) => id === value);

                      if (!withButtons) return null;

                      return <Checkbox onChange={handleChange} checked={Boolean(isChecked)} />;
                    }
                  },
                  ...mainTableColumns,
                  ...(withButtons
                    ? [
                        {
                          accessor: "id",
                          id: "actions",
                          Cell: ({ value: itemId, row: { original } }) =>
                            original.quantity?.amount > 1 && (
                              <Popup
                                trigger={
                                  <div>
                                    <Icon
                                      name="share alternate"
                                      style={{ cursor: "pointer" }}
                                      onClick={() =>
                                        setSplitModalState({
                                          show: true,
                                          itemId,
                                          amount: original.quantity?.amount
                                        })
                                      }
                                    />
                                  </div>
                                }
                                content={t("picking.detail.splitItemPopup")}
                              />
                            )
                        }
                      ]
                    : [])
                ]}
              />
              {withButtons && (
                <SplitItemModal
                  show={splitModalState.show}
                  initialAmount={splitModalState.amount}
                  onSave={handleSplitStage}
                  showModal={showSplitModal}
                />
              )}
            </>
          )}

          {Boolean(pickedItems.length) && (
            <>
              <div className="ts-shipment-pick__row">
                <h3 className="ts-shipment-pick__heading">{t("picking.detail.pickedTitle")}</h3>
                {Boolean(unpackAllItems.length) && withButtons && (
                  <Button
                    size="big"
                    onClick={onUnPackAll}
                    negative
                    content={t("picking.detail.unpackAllBtn")}
                  />
                )}
              </div>

              <ReactTable
                tableClass="ts-shipment-pick__table ui table"
                data={pickedItems}
                isExpandable
                initialState={{ expanded }}
                renderRowSubComponent={renderChildrenRow}
                columns={[
                  {
                    Header: () => "",
                    id: "expander",
                    Cell: ({ row }) => {
                      const { onClick, ...toggleProps } = row.getToggleRowExpandedProps();
                      const toggle = e => {
                        e.stopPropagation();
                        onClick();
                      };

                      return get(row, ["original", "subItems", "length"]) > 0 ? (
                        <span onClick={toggle} {...toggleProps}>
                          {row.isExpanded ? (
                            <Icon name="caret down" />
                          ) : (
                            <Icon name="caret right" />
                          )}
                        </span>
                      ) : null;
                    }
                  },
                  ...mainTableColumns,
                  {
                    accessor: "references.trackingNumber",
                    Header: t("item.references.trackingNumber")
                  },
                  {
                    accessor: "id",
                    Cell: ({ value, row: { original: item } }) => {
                      const handleCancel = () =>
                        setConfirmCancelState({ show: true, packingItemIds: [value] });

                      const handleUnpack = () => {
                        setConfirmState({ show: true, packingUnitsIds: [value] });
                      };

                      if (!withButtons) return null;

                      return (
                        <Button.Group>
                          {item.labelUrl ? (
                            <Button
                              size="large"
                              onClick={handleCancel}
                              negative
                              content={t("picking.detail.cancelLabelBtn")}
                            />
                          ) : (
                            <PackingLabelsModal packingItemIds={[value]} onCompleted={refetch} />
                          )}
                          {!item.labelUrl && (
                            <Button
                              size="large"
                              onClick={handleUnpack}
                              content={t("picking.detail.unpackBtn")}
                            />
                          )}
                          {item.isPackingUnit && item.labelUrl && (
                            <Button
                              as="a"
                              size="large"
                              onClick={onPrint}
                              href={item.labelUrl}
                              target="_blank"
                              primary
                              icon="print"
                              content={t("picking.detail.printLabelBtn")}
                            />
                          )}
                        </Button.Group>
                      );
                    }
                  }
                ]}
              />
              {withButtons && (
                <>
                  <ConfirmComponent
                    show={confirmState.show}
                    showConfirm={showConfirm}
                    onConfirm={unpackItems}
                  />
                  {/* confirm cancel label:*/}
                  <ConfirmComponent
                    show={confirmCancelState.show}
                    showConfirm={showConfirmCancel}
                    onConfirm={onCancelLabel}
                  />
                </>
              )}
            </>
          )}
        </Segment>
      </div>

      {withButtons && <PackingFooter className="pick-footer" onPrint={onPrint} />}
    </div>
  );
};

export default ShipmentPicking;
