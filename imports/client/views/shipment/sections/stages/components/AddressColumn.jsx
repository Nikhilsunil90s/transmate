import React, { useState } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import { Trans } from "react-i18next";
import { Icon, Grid } from "semantic-ui-react";
import classNames from "classnames";
import pick from "lodash.pick";

import LocationTag from "/imports/client/components/tags/LocationTag.jsx";
import AddressModal from "./AddressSelectModal";
import { UPDATE_STAGE_LOCATION } from "../utils/queries";

const debug = require("debug")("shipment:stage");

let formRef;
const StageAddressColumn = ({ stop, editable, location, stageId, accountId }) => {
  const [show, showModal] = useState(false);
  const [disabledForm, setDisabledForm] = useState("");
  const [updatStageLocation, { loading }] = useMutation(UPDATE_STAGE_LOCATION, {
    onCompleted() {
      toast.success("Address modified");
      showModal(false);
    },
    onError(error) {
      console.error({ error });
      toast.error("Could not update address");
    }
  });

  const onChangeAddress = formData => {
    const { location: updatedLocation = {}, city, street, countryCode, number, name } = formData;
    const changedKeys = Object.keys(formRef.state.changedMap);
    const overrides = pick({ city, street, countryCode, number, name }, changedKeys);
    debug("update address %o, overrides: %o", updatedLocation, overrides);

    if (Object.keys(updatedLocation).length < 1 && changedKeys.length < 1) {
      debug("no updates to save");
      return toast.error("please provide a location or an address");
    }

    updatStageLocation({
      variables: {
        input: {
          stageId,
          stop: stop === "pickup" ? "from" : "to",
          location: Object.keys(updatedLocation).length > 0 ? updatedLocation : null,
          overrides
        }
      }
    });

    return true;
  };

  // will disable the form overrides || location
  const onFieldChanged = (key, value) => {
    const internalKeys = ["number", "city", "street"];
    const externalKeys = ["name", "countryCode"];

    const currentLocation = { ...location };

    if (key === "location" && Object.keys(value).length < 1) {
      setDisabledForm("");
    }

    if (key === "location" && Object.keys(value).length > 1) {
      setDisabledForm("override");
    }

    if (internalKeys.includes(key) && value !== currentLocation.address[key]) {
      setDisabledForm("location");
    }

    if (externalKeys.includes(key) && value !== currentLocation[key]) {
      setDisabledForm("location");
    }

    if (externalKeys.includes(key) && value === currentLocation[key]) {
      setDisabledForm("");
    }

    if (internalKeys.includes(key) && value === currentLocation.address[key]) {
      setDisabledForm("");
    }
  };

  return (
    <Grid.Column className={classNames(stop, { editable })}>
      <div className={classNames("relative", { editable })} style={{ position: "relative" }}>
        <div className="float top right" style={{ visibility: "hidden" }}>
          <Icon name="pencil" color="grey" onClick={() => showModal(true)} />
          <AddressModal
            show={show}
            showModal={showModal}
            title={<Trans i18nKey={`shipment.stage.${stop}`} />}
            onSubmitForm={onChangeAddress}
            location={location}
            onFieldChanged={onFieldChanged}
            forwardRef={ref => {
              formRef = ref;
            }}
            disabledForm={disabledForm || loading}
          />
        </div>
        <div className="content">
          <h4>
            <Trans i18nKey={`shipment.stage.${stop}`} />
          </h4>
          <LocationTag
            location={location}
            annotation={{ enable: true, accountId }}
            options={{ lines: 3 }}
          />
        </div>
      </div>
    </Grid.Column>
  );
};

export default StageAddressColumn;
