import React from "react";
import { Segment, Button } from "semantic-ui-react";
import { Trans } from "react-i18next";
import useRoute from "/imports/client/router/useRoute";

const Footer = () => {
  const { goRoute } = useRoute();
  return (
    <Segment as="footer">
      <div>
        <Button
          primary
          icon="arrow left"
          id="close"
          content={<Trans i18nKey="form.back" />}
          onClick={() => goRoute("settings", { section: "fuel" })}
        />
      </div>
    </Segment>
  );
};

export default Footer;
