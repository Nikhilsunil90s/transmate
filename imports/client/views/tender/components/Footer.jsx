import React, { useContext, useState } from "react";
import { Trans } from "react-i18next";
import { useApolloClient } from "@apollo/client";
import { Segment, Button } from "semantic-ui-react";
import moment from "moment";
import { ConfirmComponent } from "/imports/client/components/modals/confirm";

import { mutate } from "/imports/utils/UI/mutate";
import { UPDATE_STATUS } from "../utils/queries";
import useRoute from "/imports/client/router/useRoute";
import LoginContext from "/imports/client/context/loginContext";

const REQUIRED_ACCOUNT_FEATURE = "tender";

const TenderFooter = ({ ...props }) => {
  const { account } = useContext(LoginContext);
  const client = useApolloClient();
  const { goRoute, params } = useRoute();
  const tenderId = params._id;
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });

  const { security, lastSave } = props;
  const hasFeature = account.hasFeature(REQUIRED_ACCOUNT_FEATURE);

  function statusText() {
    if (lastSave) {
      const saveTS = moment(lastSave).fromNow();
      return <Trans i18nKey="tender.footer.status.lastSave" {...{ saveTS }} />;
    }
    return <Trans i18nKey="tender.footer.status.info" />;
  }

  function confirmAction(action) {
    setConfirmState({
      show: true,
      content: <Trans i18nKey={`tender.actions.${action}`} />,
      onConfirm: () => {
        mutate(
          {
            client,
            query: {
              mutation: UPDATE_STATUS,
              variables: {
                input: {
                  tenderId,
                  action
                }
              }
            }
          },
          () => showConfirm(false)
        );
      }
    });
  }

  return (
    <>
      <Segment as="footer" className="actions locked">
        <div>
          {hasFeature && (
            <Button
              primary
              icon="arrow left"
              content={<Trans i18nKey="form.back" />}
              onClick={() => goRoute("tenders")}
            />
          )}

          {security.canRelease && (
            <Button
              primary
              icon="send"
              content={<Trans i18nKey="tender.footer.release" />}
              onClick={() => confirmAction("release")}
            />
          )}

          {security.canSetBackToDraft && (
            <Button
              primary
              icon="send"
              content={<Trans i18nKey="tender.footer.draft.action" />}
              onClick={() => confirmAction("setToDraft")}
            />
          )}

          {security.canSetToReview && (
            <Button
              primary
              icon="send"
              content={<Trans i18nKey="tender.footer.review.action" />}
              onClick={() => confirmAction("setToReview")}
            />
          )}

          {security.canBeClosed && (
            <Button
              primary
              icon="send"
              content={<Trans i18nKey="tender.footer.close.action" />}
              onClick={() => confirmAction("close")}
            />
          )}

          {security.canBeCanceled && (
            <Button
              primary
              icon="send"
              content={<Trans i18nKey="tender.footer.cancel.action" />}
              onClick={() => confirmAction("cancel")}
            />
          )}
        </div>
        <div className="status">{statusText()}</div>
      </Segment>
      <ConfirmComponent {...confirmState} showConfirm={showConfirm} />
    </>
  );
};

export default TenderFooter;
