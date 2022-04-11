import React from "react";
import { Button, Segment } from "semantic-ui-react";
import { Trans } from "react-i18next";

const PackingFooter = ({ className, onPrint }) => {
  return (
    <Segment className={className} as="footer">
      <div>
        <Button
          as="a"
          primary
          icon="arrow left"
          content={<Trans i18nKey="form.back" />}
          href="/picking-overview"
        />

        {onPrint && <Button primary basic icon="print" content="Print" onClick={onPrint} />}
      </div>
    </Segment>
  );
};

export default PackingFooter;
