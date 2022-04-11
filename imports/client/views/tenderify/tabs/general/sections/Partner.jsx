import React from "react";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { useMutation } from "@apollo/client";

// data
import { customerSegments } from "/imports/api/_jsonSchemas/enums/tenderify";

import { Form, Grid, Header, List, Divider, Segment, Button } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { AutoForm } from "uniforms-semantic";
import { SelectField } from "/imports/client/components/forms/uniforms";
import SelectPartnerModal from "/imports/client/components/modals/specific/partnerSelect";
import { TenderifySchema } from "/imports/api/_jsonSchemas/simple-schemas/collections/tenderify";

import { SELECT_PARTNER } from "../../../utils/queries";

const FIELDS = ["partner"];
const schema = new SimpleSchema2Bridge(TenderifySchema.pick(...FIELDS));

const debug = require("debug")("tenderify:general");
const PartnerDetail = ({ tenderBid, security }) => {
  const { t } = useTranslation();
  return (
    <Grid columns={2}>
      <Grid.Row>
        <Grid.Column>
          <AutoForm
            schema={schema}
            model={{ partner: tenderBid.partner }}
            disabled={!security.editPartnerData}
          >
            <Form.Field>
              <label>{t("tenderify.partner.name")}</label>
              <p>{tenderBid.partner?.name}</p>
            </Form.Field>

            {/* // {{> InputTags
          //     label=(_ 'tenderify.partner.accountNumbers')
          //     name="partner.management.accountNumbers"
          //     value=tenderBid.partner.management.accountNumbers
          //     disabled=(not (accessControl 'editPartnerData'))
          //   }} */}
            <SelectField
              name="partner.management.segment"
              label={t("tenderify.partner.segment")}
              options={customerSegments.map(key => ({ key, value: key, text: key }))}
            />
          </AutoForm>
        </Grid.Column>
        <Grid.Column>
          <Header as="h4">
            <Trans i18nKey="tenderify.partner.internalContacts.title" />
          </Header>
          {/* TODO [$6130a08837762e00094fd3e1]: */}
          {/* {{> TenderifyContactList 
          contacts=bid.partner.management.internalContacts}} */}

          <Divider />
          <Header as="h4">
            <Trans i18nKey="tenderify.partner.contacts.title" />{" "}
          </Header>
          <Segment basic>
            <List>
              {(tenderBid.partner.contacts || []).map((contact, i) => (
                <List.Item key={`contact-${i}`}>
                  <List.Content>
                    <List.Header>{contact.contactType}</List.Header>
                    <List.Description>{contact.name}</List.Description>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

const TenderifySectionPartner = ({ ...props }) => {
  const { tenderBidId, tenderBid, security } = props;
  const [savePartner, { loading }] = useMutation(SELECT_PARTNER);

  const handleSavePartner = ({ partnerId }, cb) => {
    debug("setting partner %s", partnerId);
    const { error } = savePartner({ variables: { input: { partnerId, tenderBidId } } });
    if (error) return toast.error("Could not save partner");
    if (cb && typeof cb === "function") cb();
  };

  return (
    <IconSegment
      name="partner"
      icon="bullseye"
      title={<Trans i18nKey="tenderify.partner.title" />}
      footerButton={"footerButton"}
      body={
        tenderBid.partner ? (
          <PartnerDetail {...props} />
        ) : (
          <Trans i18nKey="tenderify.partner.empty" />
        )
      }
      footer={
        security.changePartner && (
          <SelectPartnerModal
            options={{
              includeInactive: false,
              types: ["carrier", "provider", "shipper"]
            }}
            value={tenderBid.partner?.id}
            onSave={handleSavePartner}
          >
            <Button
              primary
              content={<Trans i18nKey="tenderify.partner.edit" />}
              loading={loading}
            />
          </SelectPartnerModal>
        )
      }
    />
  );
};

export default TenderifySectionPartner;
