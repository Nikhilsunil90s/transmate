import React, { useContext } from "react";
import { Trans } from "react-i18next";
import { Segment, Button } from "semantic-ui-react";
import moment from "moment";

import LoginContext from "/imports/client/context/loginContext";
import useRoute from "/imports/client/router/useRoute";

import { toggleSidePanel } from "../tabs/sheet/sideBar/toggleSidePanel";
import { tabProptypes } from "../utils/propTypes";

const FEATURE = "tenderify";

const TenderifyFooter = ({ security, selectNextTab, activeTab, lastSave }) => {
  const { account } = useContext(LoginContext);
  const { goRoute } = useRoute();
  const hasFeature = (account.features || []).includes(FEATURE);
  function statusText() {
    if (lastSave) {
      const saveTS = moment(lastSave).fromNow();
      return <Trans i18nKey="tender.footer.status.lastSave" {...{ saveTS }} />;
    }
    return <Trans i18nKey="tender.footer.status.info" />;
  }
  return (
    <Segment as="footer" className="actions locked">
      <div>
        {hasFeature && (
          <Button
            primary
            icon="arrow left"
            content={<Trans i18nKey="form.back" />}
            onClick={() => goRoute("bid-overview")}
          />
        )}

        {/* goes to next tab: */}
        <Button primary content={<Trans i18nKey="tender.footer.next" />} onClick={selectNextTab} />

        {/* sets the status to open & becomes visible for bidders */}
        {security.canRelease && (
          <Button primary content={<Trans i18nKey="tender.footer.release" />} icon="send" />
        )}

        {/* sets status back to draft (owner can do this) */}
        {security.canSetBackToDraft && (
          <Button basic content={<Trans i18nKey="tender.footer.draft.action" />} />
        )}

        {/* sets status to review (owner can do this) */}
        {security.canSetToReview && (
          <Button color="green" content={<Trans i18nKey="tender.footer.review.action" />} />
        )}

        {/* sets status to closed (owner can do this) */}
        {security.canBeClosed && (
          <Button primary content={<Trans i18nKey="tender.footer.close.action" />} />
        )}

        {/* sets status to cancelled (owner can do this) */}
        {security.canBeCanceled && (
          <Button primary content={<Trans i18nKey="tender.footer.cancel.action" />} />
        )}
        {activeTab === "sheet" && (
          <Button
            primary
            icon="lightbulb outline"
            content={<Trans i18nKey="tenderify.footer.bidControl" />}
            onClick={toggleSidePanel}
            data-test="insightsBtn"
          />
        )}
      </div>
      <div className="status">{statusText()}</div>
    </Segment>
  );
};

TenderifyFooter.propTypes = tabProptypes;

export default TenderifyFooter;
