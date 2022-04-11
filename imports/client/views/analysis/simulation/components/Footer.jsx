import { useMutation, useApolloClient } from "@apollo/client";
import gql from "graphql-tag";
import React from "react";
import { Trans } from "react-i18next";
import { Button, Segment } from "semantic-ui-react";
import useRoute from "/imports/client/router/useRoute.js";
import { NEXT_STEP_SIMULATION } from "../utils/queries";
import { steps } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_analysis.js";

const debug = require("debug")("analysis:simulation");

const Footer = ({ ...props }) => {
  const { goRoute } = useRoute();
  const client = useApolloClient();
  const { analysisId, simulation, activeTab, selectTab } = props;
  const [nextStep] = useMutation(NEXT_STEP_SIMULATION);

  const passedSteps = new Set(simulation?.steps || []);
  const idx = [...passedSteps].indexOf(activeTab);

  const gotoNextStep = () => {
    debug({ activeTab, passedSteps: [...passedSteps], idx });
    if (passedSteps.size < steps.length && idx === passedSteps.size - 1) {
      // we are at the max step but we have not gotten all steps yet:
      const newStep = steps[idx + 1];
      const allSteps = [...passedSteps, newStep];

      // modify remotely
      nextStep({ variables: { analysisId, nextStep: newStep } });

      // quickly modify local:
      client.writeFragment({
        id: `AnalysisSimulation:${simulation.id}`,
        fragment: gql`
          fragment Fragment on AnalysisSimulation {
            steps
          }
        `,
        data: { steps: allSteps }
      });
    }

    const nextTab = steps[idx + 1];
    selectTab(nextTab);
  };
  return (
    <Segment as="footer">
      <div>
        <Button
          primary
          icon="arrow left"
          content={<Trans i18nKey="form.back" />}
          onClick={() => goRoute("analyses")}
        />
        <Button
          primary
          disabled={idx === steps.length - 1}
          content={<Trans i18nKey="analysis.simulation.button.next" />}
          onClick={gotoNextStep}
          data-test="nextBtn"
        />
      </div>
    </Segment>
  );
};

export default Footer;
