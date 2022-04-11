import React from "react";
import { useApolloClient } from "@apollo/client";
import { toast } from "react-toastify";
import { Trans } from "react-i18next";
import { Segment, Container, Button } from "semantic-ui-react";
import PropTypes from "prop-types";
import GeneralForm from "./components/GeneralForm";
import LaneOverview from "./components/LaneOverview";

import { UPDATE_SWITCHPOINT } from "./utils/queries";
import { switchPointPropType } from "./utils/propTypes";

const debug = require("debug")("switchPoint:UI");

const SwitchPointAnalysis = ({ ...props }) => {
  const client = useApolloClient();
  const { analysisId } = props;

  async function onSave(update, cb) {
    debug("saving updates, %o", update);
    try {
      const { errors } = await client.mutate({
        mutation: UPDATE_SWITCHPOINT,
        variables: { input: { analysisId, update } }
      });
      if (errors) throw errors;
      if (typeof cb === "function") cb();
      toast.success("Changes stored");
    } catch (error) {
      toast.error("Could not save your changes");
      console.error({ error });
    }
  }
  return (
    <>
      <Container fluid className="switch-point">
        <GeneralForm {...props} onSave={onSave} />
        <LaneOverview {...props} onSave={onSave} />
      </Container>
      <Segment as="footer">
        <Button primary content={<Trans i18nKey="form.calculate" />} />
      </Segment>
    </>
  );
};

SwitchPointAnalysis.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  switchPoint: switchPointPropType
};

export default SwitchPointAnalysis;
