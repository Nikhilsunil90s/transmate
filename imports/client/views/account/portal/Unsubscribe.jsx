import React, { useState } from "react";

import {
  Container,
  Image,
  Segment,
  Header,
  Grid,
  Divider,
  Button,
  Icon,
  Input,
  Message
} from "semantic-ui-react";
import client from "/imports/client/services/apollo/client"; // root -> required
import { PORTAL_UNSUBSCRIBE } from "./utils/queries";
import useRoute from "/imports/client/router/useRoute";

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const PortalUnsubscribe = () => {
  const [email, setValue] = useState();
  const [submitState, setSubmitState] = useState({});
  const { params, queryParams } = useRoute();
  const { id } = params;
  const { userKey } = queryParams;

  const isError = email && !validateEmail(email);

  async function unSubscribe(withContact) {
    if (withContact && isError) return;
    try {
      const { errors } = await client.mutate({
        mutation: PORTAL_UNSUBSCRIBE,
        variables: { input: { id, userKey, email: withContact ? email : null } }
      });

      if (errors) throw errors;
      setSubmitState({ success: true, error: false });
    } catch (error) {
      console.error(error);
      setSubmitState({ error: true });
    }
  }

  return (
    <Container>
      <Segment padded>
        <Image
          src="https://assets.transmate.eu/app/logo_transmate_transparent_full.png"
          centered
          size="small"
        />

        {submitState.success ? (
          <Message
            style={{ marginTop: "50px" }}
            attached="top"
            header="Success"
            content="Your request has been saved."
          />
        ) : (
          <>
            <Message
              style={{ marginTop: "50px" }}
              attached="top"
              header="Unsubsribe"
              content="Are you sure you want to unsubscribe? Your inputs in the Transmate carrier database can help your company to get found for business. Having a complete company profile will boost your company searches. If we need to contact someone else in the organization, please leave their email address in the field below (you will be unsubscribed as well). How do you want ro proceed?"
            />
            <Segment placeholder attached="bottom">
              <Grid columns={2} stackable textAlign="center">
                <Divider vertical>Or</Divider>

                <Grid.Row verticalAlign="middle">
                  <Grid.Column>
                    <Header icon>
                      <Icon name="sign out" />
                      Yes, unsubscribe:
                    </Header>

                    <Button color="red" content="Unsubscribe" onClick={() => unSubscribe(false)} />
                  </Grid.Column>

                  <Grid.Column>
                    <Header icon>
                      <Icon name="user" />
                      Forward to the right user in the organization:
                    </Header>
                    <Grid verticalAlign="bottom" textAlign="left">
                      <Grid.Row>
                        <Grid.Column width={10}>
                          <Input
                            fluid
                            error={isError}
                            value={email || ""}
                            onChange={(e, { value }) => setValue(value)}
                            placeholder="Contact email"
                          />
                        </Grid.Column>
                        <Grid.Column>
                          <Button
                            primary
                            content="Send"
                            disabled={!email}
                            onClick={() => unSubscribe(true)}
                          />
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>
            {submitState.error && (
              <Message error attached="bottom" content="We could not save your request" />
            )}
          </>
        )}
      </Segment>
      <div style={{ fontSize: "0.733rem", marginTop: "-15px" }}>
        <a href="https://www.transmate.eu">www.transmate.eu</a>
      </div>
    </Container>
  );
};

export default PortalUnsubscribe;
