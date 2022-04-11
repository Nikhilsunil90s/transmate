import React from "react";
import { Grid } from "semantic-ui-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { DropdownModes } from "/imports/client/components/forms/uniforms/DropdownModes";
import { useApolloClient } from "@apollo/client";

import { UPDATE_STAGE } from "../utils/queries";

const StageModeColumn = ({ ...props }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const { stage = {}, canChangeMode } = props;
  const { mode } = stage;

  const onChangeMode = newVal => {
    if (newVal !== mode) {
      client
        .mutate({
          mutation: UPDATE_STAGE,
          variables: {
            input: {
              stageId: stage.id,
              updates: { mode: newVal }
            }
          }
        })
        .then(({ errors }) => {
          if (errors) throw errors;
          toast.success("Mode updated");
        })
        .catch(error => {
          console.error(error);
          toast.error("Could not update");
        });
    }
  };

  return (
    <Grid.Column className="mode">
      <DropdownModes
        label={t("shipment.stage.mode")}
        name="mode"
        value={mode}
        disabled={!canChangeMode}
        onChange={onChangeMode}
      />
    </Grid.Column>
  );
};

export default StageModeColumn;
