import React from "react";
import { Container, Image, Segment, Message } from "semantic-ui-react";

const IntegrationSuccess = () => {
  return (
    <Container text>
      <Segment padded>
        <Image
          src="https://assets.transmate.eu/app/logo_transmate_transparent_full.png"
          centered
          size="small"
        />

        <Message
          success
          icon="check"
          header="Success"
          content="Your account has been created. Please go to your mailbox to set your password and follow
         the instructions."
        />
      </Segment>
      <div style={{ fontSize: "0.733rem", marginTop: "-15px" }}>
        <a href="https://www.transmate.eu">www.transmate.eu</a>
      </div>
    </Container>
  );
};

export default IntegrationSuccess;
