import React from "react";
import { Segment, Button } from "semantic-ui-react";
import { Trans } from "react-i18next";

const WorkflowFooter = () => {
  return (
    <Segment as="footer">
      <div>
        <Button
          as="a"
          primary
          icon="circle add"
          content={<Trans i18nKey="dashboard.add.shipment" />}
        />
      </div>
    </Segment>
  );
};

export default WorkflowFooter;
