import React, { useMemo, useState } from "react";
import pick from "lodash.pick";
import { Trans } from "react-i18next";
import { Modal, Button } from "semantic-ui-react";
import { SegmentBody } from "/imports/client/views/shipment/sections/items/ItemSection";
import { ItemForm } from "/imports/client/views/shipment/sections/items/modals/ItemForm";
import { removeEmpty } from "/imports/utils/functions/fnRemoveNullFromObject";
import { TAXABLE_OPTIONS_KEYS } from "/imports/api/_jsonSchemas/enums/shipmentItems";

const rootEl = document.getElementById("react-root");

const MOCK_SHIPMENT_ITEMS = [
  {
    __typename: "ShipmentItemType",
    id: "mSRekTLMpXXP2dx55",
    shipmentId: null,
    parentItemId: null,
    level: 0,
    quantity: {
      __typename: "ShipmentItemQuantityType",
      amount: 10,
      code: "PAL"
    },
    type: "HU",
    itemType: null,
    number: null,
    description: "boxes",
    commodity: null,
    references: null,
    material: null,
    DG: null,
    DGClassType: null,
    temperature: null,
    weight_net: null,
    weight_tare: null,
    weight_gross: null,
    weight_unit: "kg",
    dimensions: null,
    taxable: [
      {
        __typename: "ShipmentItemTaxableType",
        type: "pal",
        quantity: 10
      },
      {
        __typename: "ShipmentItemTaxableType",
        type: "kg",
        quantity: 15000
      }
    ],
    calcSettings: null,
    customs: null,
    notes: null
  }
];
let formRef;
const ItemsSection = ({ shipmentId, security = {} }) => {
  const [state, setState] = useState({
    open: false,
    item: {},
    disabled: false
  }); // modalState
  const showModal = (open: boolean) => setState({ ...state, open });
  const shipment = {};
  const items = {};
  const onChangeParentNode = () => {};
  const onDelete = () => {};

  const handleSubmit = async model => {
    model.shipmentId = shipmentId;
    delete model.subItems;

    // // const {
    // //   data,
    // //   loading: mutationLoading,
    // //   error: mutationError
    // // } = await saveShipmentItem({
    // //   variables: { input: model }
    // // });
    // // const { saveShipmentItem: itemId } = data || {};

    // // debug("save item: %o", { itemId, mutationLoading, mutationError });

    // if (mutationError) {
    //   console.error("submitted error", mutationError);
    //   return;
    // }

    showModal(false);
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
      showModal(false);
    }
  };

  const onRowClick = (itemData, disabled: boolean) => {
    const { __typename, treePath, subItems, subitems, ...item } = itemData;
    const cleanedItem = removeEmpty(item || {}, true);

    setState({ open: true, item: cleanedItem, disabled });
  };

  const renderModal = () => {
    const modalSecurity = pick(security, [
      "canEditItems",
      "canEditItemReferences",
      "canEditWeights"
    ]);
    const { disabled } = state;
    const canSave = Object.values(modalSecurity).some(x => x);

    return (
      <Modal
        size="large"
        open={state.open}
        onClose={() => showModal(false)}
        mountNode={rootEl}
      >
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
      <SegmentBody
        {...{
          shipmentId,
          isEditing: true,
          shipmentItems: MOCK_SHIPMENT_ITEMS,
          security,
          shipment: { number: "Test ref", references: { number: "Some ref#" } },
          onRowClick,
          loading: false
        }}
      />{" "}
      {modalComp}
    </>
  );
};

export default ItemsSection;
