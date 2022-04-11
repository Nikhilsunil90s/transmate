import React, { useState } from "react";
import PropTypes from "prop-types";
import { useApolloClient, gql } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Button, Popup } from "semantic-ui-react";

const PATH_TRANSMATE_PRICING = "https://www.transmate.eu/pricing";

export const REQUEST_UPGRADE = gql`
  mutation upgradeRequest($reference: String!) {
    upgradeRequest(reference: $reference)
  }
`;

const UpgradePopup = ({ trigger, reference }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [isClicked, setIsClicked] = useState(false);
  async function requestUpgrade() {
    try {
      const { errors } = await client.mutate({
        mutation: REQUEST_UPGRADE,
        variables: { reference }
      });

      if (errors) throw errors;
      setIsClicked(true);
    } catch (error) {
      toast.error("Could not request upgrade");
    }
  }

  return (
    <Popup trigger={trigger} position="top left" className="upgrade" on="click">
      <Popup.Header>Upgrade account</Popup.Header>
      <Popup.Content>
        {isClicked ? (
          <p>{t("upgrade.feature.clicked")}</p>
        ) : (
          <>
            <p>{t("upgrade.feature.generic")}</p>
            <Button primary content={t("upgrade.button.upgrade")} onClick={requestUpgrade} />
            <Button
              as="a"
              basic
              content={t("upgrade.button.plans")}
              href={PATH_TRANSMATE_PRICING}
              target="_blank"
            />
          </>
        )}
      </Popup.Content>
    </Popup>
  );
};

UpgradePopup.propTypes = {
  reference: PropTypes.string.isRequired
};

export default UpgradePopup;
