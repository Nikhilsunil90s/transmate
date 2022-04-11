import React from "react";
import { Trans } from "react-i18next";
import { Dimmer, Loader, Segment } from "semantic-ui-react";

const ImportWait = ({ imp }) => {
  const total = imp.total || {};
  return (
    <>
      <div>
        <Dimmer active inverted>
          <Loader
            content={
              <Trans
                i18nKey="edi.steps.process.scheduling"
                values={{ value: total.shipments || 0 }}
              />
            }
          />
        </Dimmer>
      </div>
      <Segment as="footer">
        <div />
      </Segment>
    </>
  );
};

export default ImportWait;
