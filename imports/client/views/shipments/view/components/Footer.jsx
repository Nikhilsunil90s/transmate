import { toast } from "react-toastify";
import { useApolloClient } from "@apollo/client";
import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { Trans } from "react-i18next";
import get from "lodash.get";
import { Segment, Button, Popup } from "semantic-ui-react";
import { ConfirmComponent } from "/imports/client/components/modals";
import SimpleInputModal from "/imports/client/components/modals/specific/SimpleInput.jsx";

import { UPSERT_SHIPMENT_VIEW, REMOVE_SHIPMENT_VIEW } from "../utils/queries";
import { GET_SHIPMENT_VIEWS } from "../../utils/queries";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("shipments:view");

const ShipmentViewFooter = ({ view, state }) => {
  const client = useApolloClient();
  const [show, showConfirm] = useState(false);
  const [modalOpen, showModal] = useState();
  const { goRoute, params } = useRoute();
  const viewId = params._id;

  const allowUpdate = view.type !== "global" && get(view, "created.by") === Meteor.userId();
  debug("view allowupdate %o view data %o", allowUpdate, view);
  function goAction() {
    return goRoute("shipments");
  }
  async function deleteView() {
    debug("deleting viewId %s", viewId);
    try {
      if (!viewId) throw new Error("No viewId set");
      const { errors } = await client.mutate({
        mutation: REMOVE_SHIPMENT_VIEW,
        variables: { viewId },
        refetchQueries: [{ query: GET_SHIPMENT_VIEWS }],
        awaitRefetchQueries: true
      });
      if (errors) throw errors;
      showConfirm(false);
      goAction();
    } catch (error) {
      console.error({ error });
      toast.error("Can't remove view");
    }
  }

  async function saveView(asNew, overrides, cb) {
    // data from state:
    const { columns = [], filters, name, shipmentOverviewType, isShared } = state;
    if (!name) return toast.error("View name is required");
    const data = { name, columns, filters, shipmentOverviewType, isShared, ...overrides };
    debug("saving view id:%s, data: %o, asNew:%s", viewId, data, asNew);

    try {
      const { data: mData, errors } = await client.mutate({
        mutation: UPSERT_SHIPMENT_VIEW,
        variables: { input: { viewId, data, asNew } },
        refetchQueries: [{ query: GET_SHIPMENT_VIEWS }],
        awaitRefetchQueries: true
      });
      if (errors) throw errors;
      const rViewId = mData?.upsertShipmentView?.id;
      if (!rViewId) throw new Error("Did not get an id from mutation result");
      if (typeof cb === "function") cb();

      goAction(rViewId);
      return toast.success("Changes stored");
    } catch (error) {
      console.error({ error });
      return toast.error("Could not save view.");
    }
  }

  function saveAsNew() {
    showModal(true);
  }

  return (
    <Segment as="footer">
      <div>
        {view ? (
          <>
            <Popup
              content={<Trans i18nKey="shipments.view.canNotModify" />}
              disabled={allowUpdate}
              trigger={
                <div style={{ display: "inline-block" }}>
                  <Button
                    primary
                    disabled={!allowUpdate}
                    content={<Trans i18nKey="shipments.view.update" />}
                    onClick={() => saveView(false, {})}
                  />
                </div>
              }
            />
            <Button
              primary
              basic
              content={<Trans i18nKey="shipments.view.save_new" />}
              onClick={saveAsNew}
            />
            {allowUpdate && (
              <Button
                basic
                color="red"
                content={<Trans i18nKey="shipments.view.delete" />}
                onClick={() => showConfirm(true)}
              />
            )}
            <ConfirmComponent
              show={show}
              showConfirm={showConfirm}
              content={<Trans i18nKey="shipments.view.deleteView" />}
              onConfirm={deleteView}
            />
          </>
        ) : (
          <Button primary content={<Trans i18nKey="shipments.view.save" />} onClick={saveAsNew} />
        )}
        <SimpleInputModal
          show={modalOpen}
          showModal={showModal}
          onSave={({ input }) => {
            saveView(true, { name: input }, () => showModal(false));
          }}
          model={{ input: state.name }}
        />
      </div>
    </Segment>
  );
};

export default ShipmentViewFooter;
