import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import { Trans } from "react-i18next";
import { Button, Segment } from "semantic-ui-react";
import { ConfirmComponent } from "/imports/client/components/modals";
import gql from "graphql-tag";
import { toast } from "react-toastify";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("partner");

const PartnerFooter = ({ partnerId, security = {} }) => {
  const client = useApolloClient();
  const [action, setAction] = useState();
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });
  const { goRoute } = useRoute();

  function createPartnerShip() {
    debug("call for creation of partnership with id:", partnerId);

    client
      .mutate({
        variables: { partnerId },
        mutation: gql`
          mutation createPartnershipInPartnerOverview($partnerId: String!) {
            createPartnership(partnerId: $partnerId) {
              id
              name
            }
          }
        `
      })
      .then(({ errors }) => {
        if (errors) throw errors;
      })
      .catch(error => toast.error(error.reason));
  }

  // action [accept, reject, deactivate]
  function updatePartnership() {
    debug("call for accept of partnership with id:", partnerId);
    client
      .mutate({
        variables: { partnerId, action },
        mutation: gql`
          mutation updatePartnership($partnerId: String!, $action: PARTNERSHIP_ACTION!) {
            updatePartnership(partnerId: $partnerId, action: $action) {
              id
              status
            }
          }
        `
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        showConfirm(false);
        goRoute("partners");
      })
      .catch(error => toast.error(error.reason));
  }
  debug("security %o", security);
  return (
    <Segment as="footer">
      <div>
        <Button
          primary
          icon="arrow left"
          content={<Trans i18nKey="form.back" />}
          onClick={() => goRoute("partners")}
        />
        {security.canBeDeactivated && (
          <Button
            color="orange"
            icon="toggle off"
            content={<Trans i18nKey="partner.button.deactivate" />}
            onClick={() => {
              setAction("deactivate");
              setConfirmState({ show: true });
            }}
          />
        )}
        {security.canAcceptRejectRequest && (
          <>
            <Button
              primary
              content={<Trans i18nKey="partner.button.accept" />}
              onClick={() => {
                setAction("accept");
                setConfirmState({ show: true });
              }}
            />
            <Button
              basic
              color="orange"
              content={<Trans i18nKey="partner.button.reject" />}
              onClick={() => {
                setAction("reject");
                setConfirmState({ show: true });
              }}
            />
          </>
        )}
        {security.canResendRequest && (
          <Button
            primary
            icon="refresh"
            content={<Trans i18nKey="partner.button.resend" />}
            onClick={createPartnerShip}
          />
        )}
        {security.canBeReactivated && (
          <Button
            primary
            icon="refresh"
            content={<Trans i18nKey="partner.button.reactivate" />}
            onClick={() => {
              setAction("accept");
              setConfirmState({ show: true });
            }}
          />
        )}
        {security.canCreatePartnerShip && (
          <Button
            primary
            icon="refresh"
            content={<Trans i18nKey="partner.button.create" />}
            onClick={createPartnerShip}
          />
        )}
        <ConfirmComponent
          {...confirmState}
          showConfirm={showConfirm}
          onConfirm={updatePartnership}
        />
      </div>
    </Segment>
  );
};

export default PartnerFooter;
