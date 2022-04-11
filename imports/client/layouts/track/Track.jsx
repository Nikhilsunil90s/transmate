import React, { Suspense } from "react";
import { ApolloProvider } from "@apollo/client";
import client from "/imports/client/services/apollo/client"; // root -> required
import { Container, Grid, Icon, Image } from "semantic-ui-react";
import ErrorBoundary from "/imports/client/components/utilities/ErrorBoundery";
import LogoLoading from "../../components/utilities/LogoLoading";

const TrackLayout = ({ ...props }) => {
  const { name, main } = props;
  const account = undefined;
  return (
    <main className="track">
      <Container fluid className="limit">
        <header>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                {account && account.logo ? (
                  <Image className="logo" src={account.logo} />
                ) : (
                  <Image className="logo" src="/images/logo-transmate-inv.svg" />
                )}
              </Grid.Column>
              <Grid.Column width={4} textAlign="right">
                <Icon name="mail outline" size="big" />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </header>
        <div>
          <ErrorBoundary>
            <Suspense fallback={<LogoLoading />}>
              <main className={name}>
                <div>{main && <div>{main}</div>}</div>
              </main>
            </Suspense>
          </ErrorBoundary>
        </div>
      </Container>
    </main>
  );
};

const TrackLayoutWithProvider = ({ ...props }) => {
  return (
    <ApolloProvider client={client}>
      <TrackLayout {...props} />
    </ApolloProvider>
  );
};

export default TrackLayoutWithProvider;
