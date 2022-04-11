import React from "react";
import { Button, Header, Icon, Segment } from "semantic-ui-react";
import { Trans } from "react-i18next";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

interface IAppProps {
  shipment: any;
  shipmentId: string;
}

const Success: React.FunctionComponent<IAppProps> = props => {
  const { shipment, shipmentId } = props;

  return (
    <Segment padded="very" placeholder style={{ background: "#fff" }}>
      <Header icon>
        <Icon name="send" />
        <Trans i18nKey="shipment.request.success.title" />
      </Header>
      <Segment className="inline">
        <Trans
          i18nKey="shipment.request.success.number"
          values={{ number: shipment.number }}
        />
      </Segment>
      <Segment className="inline">
        <Button
          content={<Trans i18nKey="shipment.request.success.track" />}
          primary
          as="a"
          href={generateRoutePath("track", { shipmentId })}
          target="_blank"
          rel="noreferrer"
        />
      </Segment>
    </Segment>
  );
};

export default Success;
