import React from "react";
import { Button } from "semantic-ui-react";
import { useApolloClient } from "@apollo/client";
import { MassPriceRequest, MassAction } from "./multi-action";
import HeaderViewSelect from "./HeaderViewSelect";
import { mutate } from "/imports/utils/UI/mutate";
import { UPDATE_USER_PREFERENCES } from "../utils/queries";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("shipments:header");

// const debug = require("debug")("shipment:overview-menu");

const HeaderMenu = props => {
  const {
    viewName,
    viewId,
    selectedShipments,
    onChangeView: changeViewHandler,
    sortedViews = {}
  } = props;
  const { goRoute } = useRoute();
  const client = useApolloClient();
  const hasSelectedShipments = Array.isArray(selectedShipments) && selectedShipments.length > 0;
  debug("HeaderMenu call , can select shipments? %o", hasSelectedShipments);
  function getSelectedShipments() {
    return selectedShipments.map(({ _id }) => ({ shipmentId: _id }));
  }

  const onChangeView = view => {
    changeViewHandler(view);

    // store last selected to preferences:
    mutate({
      client,
      query: {
        mutation: UPDATE_USER_PREFERENCES,
        variables: { input: { topic: "shipmentsView", update: view.id } }
      }
    });
  };

  return (
    <header className="view ui basic segment">
      {hasSelectedShipments ? (
        <div>
          <Button.Group>
            <MassAction {...{ getSelectedShipments, action: "archive" }} />
            <MassAction {...{ getSelectedShipments, action: "delete" }} />
            <MassAction {...{ getSelectedShipments, action: "copy" }} />
          </Button.Group>
          <Button.Group>
            <MassPriceRequest {...{ getSelectedShipments }} />
          </Button.Group>
        </div>
      ) : (
        <HeaderViewSelect {...{ onChangeView, viewName, sortedViews }} />
      )}

      <a
        className="button"
        style={{ cursor: "pointer" }}
        onClick={
          viewId ? () => goRoute("shipmentsView", { _id: viewId }) : debug("no view id yet defined")
        }
        data-tooltip="Configure view (change columns or filters)"
        data-position="left center"
      >
        <i className="icon-settings" />
      </a>
    </header>
  );
};

export default HeaderMenu;
