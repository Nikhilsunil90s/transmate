import React, { useState } from "react";
import { Icon, List, Loader } from "semantic-ui-react";
import { useLazyQuery, gql } from "@apollo/client";
import { ConfirmComponent } from "../modals";

const debug = require("debug")("partnertag");

const GET_PARTNER_DATA = gql`
  query getPartnerForTag($partnerId: String!) {
    partner: getPartner(partnerId: $partnerId) {
      id
      name
    }
  }
`;

export const PartnerTag = ({ name, accountId }) =>
  name ? (
    <>
      {name}
      <span style={{ opacity: 0.5 }}> —{accountId}</span>
    </>
  ) : (
    accountId || "No account"
  );

const PartnerTagLoader = ({ accountId, name }) => {
  const [getName, { data = {}, loading, error, called }] = useLazyQuery(GET_PARTNER_DATA, {
    variables: { partnerId: accountId }
  });

  if (error) debug("error in data fetch %o", error);

  if (!name && accountId && !called) getName();
  const partnerName = name || data.partner?.name;

  return loading ? (
    <Loader active inline />
  ) : (
    <PartnerTag name={partnerName} accountId={accountId} />
  );
};

export const PartnerListItemTag = ({ accountId, name, canRemove, onRemoveAction }) => {
  const [show, showConfirm] = useState(false);
  return (
    <>
      <List.Item>
        {canRemove && (
          <List.Content floated="right">
            <span style={{ cursor: "pointer" }} onClick={() => showConfirm(true)}>
              <Icon name="trash alternate outline" />
            </span>
          </List.Content>
        )}
        <List.Content>
          <PartnerTagLoader accountId={accountId} name={name} />
        </List.Content>
      </List.Item>
      <ConfirmComponent
        show={show}
        showConfirm={showConfirm}
        onConfirm={() =>
          canRemove && onRemoveAction({ partnerId: accountId }, () => showConfirm(false))
        }
      />
    </>
  );
};

export default PartnerTagLoader;
