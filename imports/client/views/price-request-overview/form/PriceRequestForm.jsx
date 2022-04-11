import React, { useState } from "react";
import { Step, Segment, Button, Icon } from "semantic-ui-react";

import ConfirmForm from "./components/ConfirmSection";
import ItemSection from "./components/ItemsSection";
import LaneSection from "./components/LaneSection";

const INITIAL_STEP = "lane";
const STEPS = {
  lane: {
    icon: "truck",
    title: "Shipping",
    description: "Where to ship?"
  },
  items: {
    icon: "box",
    title: "Items",
    description: "What to ship?"
  },
  confirm: { icon: "info", title: "Confirm Order", description: "Finalize & confirm" }
};

const STEP_LIST = Object.keys(STEPS);

// state || apollo cache keeps information on where we are in the request creation
// step1: lane > shipmentId is returned & stored in the state
// step2: items are added
// step3: request information is added and released to owner
// shipmentId and other data can be optionally passed in as initial state here
const PriceRequestForm = ({ shipmentId }) => {
  // eslint-disable-next-line no-unused-vars
  const [activeStep, setActiveStep] = useState(INITIAL_STEP);
  const [state, setState] = useState({ shipmentId });
  const onSaveLane = update => setState({ ...state, ...update });
  return (
    <>
      <Step.Group stackable="tablet" attached>
        {Object.entries(STEPS).map(([key, { icon, title, description }]) => (
          <Step
            key={key}
            active={activeStep === key}
            disabled={key !== STEPS[0] && !state.shipmentId}
            onClick={() => setActiveStep(key)}
          >
            <Icon name={icon} />
            <Step.Content>
              <Step.Title>{title}</Step.Title>
              <Step.Description>{description}</Step.Description>
            </Step.Content>
          </Step>
        ))}
      </Step.Group>
      <Segment>
        {activeStep === "lane" && <LaneSection onSave={onSaveLane} />}
        {activeStep === "items" && <ItemSection security={{}} />}
        {activeStep === "confirm" && <ConfirmForm />}
      </Segment>
      <Segment
        as="footer"
        content={
          <Button
            primary
            content="next"
            onClick={() => {
              const currentStepIndex = STEP_LIST.indexOf(activeStep);
              const newStep = STEP_LIST[(currentStepIndex + 1) % STEP_LIST.length];
              setActiveStep(newStep);
            }}
          />
        }
      />
    </>
  );
};

export default PriceRequestForm;
