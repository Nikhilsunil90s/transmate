import React from "react";
import { Button, Card, Grid, Icon, List, Segment } from "semantic-ui-react";

const SALES_ITEMS = [
  "Freight optimization",
  "Automated workflows",
  "Data connections",
  "Premium support"
];

const AccountUpgradeBlock = () => {
  return (
    <Segment className="accountUpgrade">
      <h4>Premium feature</h4>
      <Grid columns={3}>
        <Grid.Column>
          <Segment className="leftShadow">
            <List>
              {SALES_ITEMS.map((item, i) => (
                // eslint-disable-next-line
                <List.Item key={`item-${i}`}>
                  <Icon name="check" color="green" />
                  <List.Content>{item}</List.Content>
                </List.Item>
              ))}
            </List>
            <a href="https://www.transmate.eu/pricing" target="_blank" rel="noreferrer">
              Check out our pricing
            </a>
          </Segment>
        </Grid.Column>
        <Grid.Column>
          <Card raised>
            <Card.Content>
              <Card.Header content="Upgrade now" />
              <Card.Meta content="starting from 59 EUR" />
              <Card.Description
                content={
                  <p>
                    Access premium features, use data connections, improve your supply chain
                    efficiency now
                  </p>
                }
              />
            </Card.Content>
            <Card.Content
              extra
              content={
                <Button
                  as="a"
                  primary
                  href="https://www.transmate.eu/contact-us"
                  target="_blank"
                  rel="noreferrer"
                  content="Start now"
                />
              }
            />
          </Card>
        </Grid.Column>
        <Grid.Column>
          <Segment basic>
            <p>
              Looking for API implementation and flexible billing options?{" "}
              <a href="https://www.transmate.eu/contact-us" target="_blank" rel="noreferrer">
                Talk to us
              </a>
            </p>
          </Segment>
        </Grid.Column>
      </Grid>
    </Segment>
  );
};

export default AccountUpgradeBlock;
