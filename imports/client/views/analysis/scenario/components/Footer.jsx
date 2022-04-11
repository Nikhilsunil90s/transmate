import React from "react";
import { Trans } from "react-i18next";
import { Button, Segment } from "semantic-ui-react";
import useRoute from "/imports/client/router/useRoute";

const Footer = () => {
  const { goRoute } = useRoute();
  return (
    <Segment as="footer">
      <div>
        <Button
          primary
          icon="arrow left"
          content={<Trans i18nKey="form.back" />}
          onClick={() => goRoute("analyses")}
        />
      </div>
    </Segment>
  );
};

export default Footer;
