import React from "react";
import moment from "moment";
import pick from "lodash.pick";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { Trans } from "react-i18next";
import { Button, Divider, Form, Grid, Header, List, Icon, Loader } from "semantic-ui-react";
import { AutoForm, AutoField } from "uniforms-semantic";
import { DateField } from "/imports/client/components/forms/uniforms";
import { DateTag } from "/imports/client/components/tags";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { useMutation } from "@apollo/client";

import { GENERATE_OFFER_SHEET } from "../../../utils/queries";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    validFrom: Date,
    validTo: Date,
    termsOfDelivery: { type: String, optional: true }
  })
);

const DEFAULTS = {
  validFrom: moment()
    .startOf("day")
    .toDate(),
  validTo: moment()
    .startOf("day")
    .add(1, "year")
    .toDate()
};

const OfferTag = ({ bid }) => (
  <>
    version: {bid.version} |{" "}
    {bid.file === "pending" ? (
      <Loader active inline size="tiny" />
    ) : (
      <a href={bid.file}>
        link <Icon name="download" />
      </a>
    )}
    |
    <span style={{ opacity: 0.5 }}>
      {" "}
      date: <DateTag date={bid.ts} />
    </span>
  </>
);

const TenderifySectionOffer = ({ ...props }) => {
  const { security, tenderBid, tenderBidId } = props;

  const [generateOfferSheet, { loading, error }] = useMutation(GENERATE_OFFER_SHEET, {
    variables: { tenderBidId }
  });

  if (error) console.error({ offerSheetError: error });

  const currentOffer = tenderBid.offer?.latest;
  return (
    <IconSegment
      icon="handshake"
      title="Offer"
      body={
        <>
          <AutoForm
            disabled={!security.generateOffer}
            model={{
              ...DEFAULTS,
              ...(currentOffer ? pick(currentOffer, "validFrom", "validTo", "termsOfDelivery") : {})
            }}
            schema={schema}
            onChange={console.log} // TODO : tie to mutation
          >
            <Grid columns={2}>
              <Grid.Column>
                <Form.Group>
                  <Form.Field>
                    <label>
                      <Trans i18nKey="tenderify.offer.valid.from" />
                    </label>
                    {security.generateOffer ? (
                      <DateField name="validFrom" />
                    ) : (
                      <DateTag date={tenderBid.offer?.validFrom} />
                    )}
                  </Form.Field>
                  <Form.Field>
                    <label>
                      <Trans i18nKey="tenderify.offer.valid.to" />
                    </label>
                    {security.generateOffer ? (
                      <DateField name="validTo" />
                    ) : (
                      <DateTag date={tenderBid.offer?.validTo} />
                    )}
                  </Form.Field>
                </Form.Group>
                <AutoField name="termsOfDelivery" label="Terms of Delivery" />
              </Grid.Column>
              <Grid.Column>
                {security.generateOffer && (
                  <Button
                    primary
                    loading={loading}
                    icon="lightning"
                    content={<Trans i18nKey="tenderify.offer.generate" />}
                    onClick={generateOfferSheet}
                  />
                )}
              </Grid.Column>
            </Grid>
          </AutoForm>
          {(currentOffer || tenderBid.offer?.history) && (
            <>
              <Divider />
              <Header as="h4" content={<Trans i18nKey="tenderify.offer.overview" />} />
              <List>
                {currentOffer && (
                  <List.Item>
                    <List.Icon name="file outline" />
                    <List.Content>
                      <List.Header>Current</List.Header>
                      <List.Description>
                        <OfferTag bid={currentOffer} />
                      </List.Description>
                    </List.Content>
                  </List.Item>
                )}
                {(tenderBid.offer?.history || []).map((pastBid, i) => (
                  <List.Item key={`pastBid-${i}`}>
                    <List.Icon name="file outline" />
                    <List.Content>
                      <List.Header>{`Offer v.${pastBid.version}`}</List.Header>
                      <List.Description>
                        <OfferTag bid={pastBid} />
                      </List.Description>
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </>
          )}
        </>
      }
    />
  );
};

export default TenderifySectionOffer;
