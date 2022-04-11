import React from "react";
import { Button, Divider, Grid, Header, Icon, Segment } from "semantic-ui-react";

import { IconSegment } from "/imports/client/components/utilities/IconSegment";

const InvoiceEmptyDataSection = ({ ...props }) => {
  const { onSelectTab } = props;
  return (
    <IconSegment
      icon="bookmark outline"
      title="Load data"
      body={
        <>
          <p>You have not loaded any data yet. You can either:</p>
          <br />
          <Segment>
            <Grid columns={2} stackable textAlign="center">
              <Divider vertical>Or</Divider>

              <Grid.Row verticalAlign="middle">
                <Grid.Column>
                  <Header icon>
                    <Icon name="check square outline" />
                    Select from shipments
                  </Header>
                  <br />
                  <Button primary onClick={() => onSelectTab("select")} content="Select" />
                </Grid.Column>

                <Grid.Column>
                  <Header icon>
                    <Icon name="cloud upload" />
                    Upload file
                  </Header>
                  <br />
                  <Button primary onClick={() => onSelectTab("upload")} content="Load" />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>
        </>
      }
    />
  );
};

export default InvoiceEmptyDataSection;
