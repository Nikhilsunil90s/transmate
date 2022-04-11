import React, { useState, useMemo } from "react";

import PropTypes from "prop-types";
import { useMutation } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import get from "lodash.get";
import pick from "lodash.pick";
import { Modal, Button } from "semantic-ui-react";
import { ItemOverview } from "./overview/ItemOverview";
import { ItemForm } from "./modals/ItemForm";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { removeEmpty } from "/imports/utils/functions/fnRemoveNullFromObject";
import ItemTable from "./overview-simple/ItemTable";
import { buildNestedItems } from "/imports/api/items/items-helper";

import {
  SAVE_SHIPMENT_ITEM,
  CHANGE_SHIPMENT_ITEM_PARENT_NODE,
  DELETE_SHIPMENT_ITEM
} from "./utils/queries";

import { TAXABLE_OPTIONS_KEYS } from "/imports/api/_jsonSchemas/enums/shipmentItems";

const rootEl = document.getElementById("react-root");

const debug = require("debug")("shipment:items");

let formRef;
let itemSegmentRef = {};
export const SegmentBody = ({
  shipmentId,
  isEditing,
  shipmentItems,
  security,
  shipment,
  loading,
  fwdRef
}) => {
  const [state, setState] = useState({ open: false, item: {} });
  const [changeShipmentItemParentNode] = useMutation(CHANGE_SHIPMENT_ITEM_PARENT_NODE);
  const [deleteShipmentItem] = useMutation(DELETE_SHIPMENT_ITEM);
  const [saveShipmentItem] = useMutation(SAVE_SHIPMENT_ITEM);

  const onChangeParentNode = async ({ node, targetParent }) => {
    const {
      data: { changeShipmentItemParentNode: changeShipmentItemParentNodeResult },
      loading: mutationLoading,
      error: mutationError
    } = await changeShipmentItemParentNode({
      variables: {
        input: {
          shipmentId,
          id: node.id,
          targetParentItemId: targetParent ? targetParent.id : null
        }
      }
    });
    debug("items - change parent node: %o", {
      changeShipmentItemParentNodeResult,
      mutationLoading,
      mutationError
    });

    if (mutationError) {
      console.error("change node error", mutationError);
    }
  };
  const onDelete = async ({ id }) => {
    const { data: d, loading: deleteLoading, errors: deleteError } = await deleteShipmentItem({
      variables: {
        input: { id }
      }
    });
    debug("deleting item: %o", {
      data: d,
      deleteLoading,
      deleteError
    });

    if (deleteError) {
      console.error("delete error", deleteError);
    }
  };

  const close = () => {
    setState({ open: false });
  };

  const closeAction = async yes => {
    if (yes) {
      try {
        await formRef.validate();

        // the model is null, uniforms bug?
        await formRef.submit();
      } catch (err) {
        // validation error
        console.error("submit error--", err);
      }
    } else {
      setState({ open: false });
    }
  };

  const handleSubmit = async model => {
    debug("handleSubmit", model);
    model.shipmentId = shipmentId;
    delete model.subItems;

    const { data, loading: mutationLoading, error: mutationError } = await saveShipmentItem({
      variables: { input: model }
    });
    const { saveShipmentItem: itemId } = data || {};

    debug("save item: %o", { itemId, mutationLoading, mutationError });

    if (mutationError) {
      console.error("submitted error", mutationError);
      return;
    }

    close();
  };

  const handleClickAdd = () => {
    setState({ ...state, open: true });
  };

  const onRowClick = (itemData, disabled) => {
    const { __typename, treePath, subItems, subitems, ...item } = itemData;
    const cleanedItem = removeEmpty(item || {}, true);

    debug("opening modal for %o", cleanedItem);
    setState({ open: true, item: cleanedItem, disabled });
  };

  const hasItems = shipmentItems.length > 0;

  itemSegmentRef = { handleClickAdd };

  // eslint-disable-next-line no-unused-expressions
  fwdRef && fwdRef(itemSegmentRef);

  const renderModal = () => {
    const modalSecurity = pick(security, [
      "canEditItems",
      "canEditItemReferences",
      "canEditWeights"
    ]);
    const { disabled } = state;
    const canSave = Object.values(modalSecurity).some(x => x);

    return (
      <Modal size="large" open={state.open} onClose={close} mountNode={rootEl}>
        <Modal.Header>
          <Trans i18nKey="shipment.form.itemNew.modal.title" />
        </Modal.Header>
        <Modal.Content>
          <ItemForm
            taxableOptions={TAXABLE_OPTIONS_KEYS}
            security={disabled ? {} : modalSecurity}
            value={state.item}
            onSubmit={handleSubmit}
            formRef={ref => {
              formRef = ref;
            }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            onClick={() => {
              closeAction(false);
            }}
          >
            <Trans i18nKey="form.cancel" />
          </Button>
          {canSave && !disabled ? (
            <Button
              onClick={() => {
                closeAction(true);
              }}
              primary
              icon="save outline"
              content={<Trans i18nKey="form.save" />}
            />
          ) : null}
        </Modal.Actions>
      </Modal>
    );
  };

  const modalComp = useMemo(renderModal, [state.open]);

  return (
    <>
      {!hasItems && (
        <p>
          <Trans i18nKey="shipment.goods.empty" />
        </p>
      )}
      {hasItems && isEditing && (
        <div style={{ height: 300 }}>
          <ItemOverview
            shipment={shipment}
            canDrag={security.canDragItems}
            canEditItems={security.canEditItems}
            onRowClick={onRowClick}
            onChangeParentNode={onChangeParentNode}
            data={shipmentItems}
            onDelete={onDelete}
          />
        </div>
      )}
      {hasItems && !isEditing && (
        <ItemTable
          items={buildNestedItems(shipmentItems)}
          isDataLoading={loading}
          options={{ hideTaxable: true }}
          onRowClick={onRowClick}
        />
      )}
      {modalComp}
    </>
  );
};

export const ItemSection = ({ ...props }) => {
  const { t } = useTranslation();
  const { shipmentItems, security } = props;

  const hasItems = shipmentItems?.length > 0;

  const [isEditing, setEditing] = useState(!hasItems);
  debug("shipment has %o items, show edit? %o", shipmentItems?.length, isEditing);

  return (
    <IconSegment
      {...{
        name: "item",
        icon: "paste",
        title: t("shipment.form.itemNew.title"),
        body: <SegmentBody {...props} {...{ shipmentItems, isEditing }} />,
        footer: security.canEditItems ? (
          <>
            <div>
              {security.canAddItem && isEditing && (
                <Button
                  primary
                  content={t("form.add")}
                  onClick={() => itemSegmentRef?.handleClickAdd()}
                  data-test="addItemBn"
                />
              )}
            </div>

            <div>
              {hasItems ? (
                <Button
                  basic
                  primary
                  content={
                    isEditing ? <Trans i18nKey="form.close" /> : <Trans i18nKey="form.edit" />
                  }
                  onClick={() => setEditing(!isEditing)}
                />
              ) : (
                ""
              )}
            </div>
          </>
        ) : (
          undefined
        )
      }}
    />
  );
};
//#endregion

const ItemSectionLoader = ({ ...props }) => {
  const { shipment } = props;
  const shipmentItems = get(shipment, ["nestedItems"]) || [];

  return <ItemSection {...props} {...{ shipmentItems }} />;
};

ItemSectionLoader.propTypes = {
  accountId: PropTypes.string,
  shipment: PropTypes.object,
  onSave: PropTypes.func,
  security: PropTypes.object
};

export default ItemSectionLoader;
