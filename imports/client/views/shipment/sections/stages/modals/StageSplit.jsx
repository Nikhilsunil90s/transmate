import React, { useState } from "react";
import { toast } from "react-toastify";
import { Trans, useTranslation } from "react-i18next";

import { AutoForm } from "uniforms-semantic";
import AddressInput from "/imports/client/components/forms/input/Address.jsx";
import LocationTag from "/imports/client/components/tags/LocationTag.jsx";
import { ModalComponent, ModalActions } from "/imports/client/components/modals";
import { AddressInputSchema } from "/imports/client/components/forms/input/Address.schema.js";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { useApolloClient } from "@apollo/client";
import { STAGE_SPLIT } from "../utils/queries";

let formRef;
const SplitForm = ({ stage, onSubmitForm }) => {
  const { t } = useTranslation();
  return (
    <AutoForm
      schema={new SimpleSchema2Bridge(AddressInputSchema)}
      onSubmit={onSubmitForm}
      ref={ref => {
        formRef = ref;
      }}
    >
      <div className="field">
        <LocationTag location={stage.from} />
      </div>
      <div className="field">
        <AddressInput
          name="location"
          label={t("shipment.stage.stop")}
          options={{ excludeGlobal: true }}
          noAdd
        />
      </div>
      <div className="field">
        <LocationTag location={stage.to} />
      </div>
    </AutoForm>
  );
};

const SplitStageModal = ({ ...props }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { show, showModal, stage } = props;
  const client = useApolloClient();

  const splitStage = ({ location = {} }) => {
    const stageId = stage.id;
    setLoading(true);
    client
      .mutate({ mutation: STAGE_SPLIT, variables: { stageId, location } })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Stage modified");
        showModal(false);
      })
      .catch(error => {
        console.error("error splitting stage %o", error);
        toast.error(error.message || "could not split stage");
        setLoading(false);
      });
  };

  return (
    <ModalComponent
      title={<Trans i18nKey="shipment.stage.menu.split" />}
      show={show}
      className="stage-split"
      showModal={showModal}
      body={<SplitForm {...props} onSubmitForm={splitStage} />}
      actions={
        <ModalActions
          {...{
            showModal,
            disableBtn: loading,
            onSave: () => formRef.submit(),
            saveLabel: t("shipment.stage.menu.split")
          }}
        />
      }
    />
  );
};

export default SplitStageModal;
