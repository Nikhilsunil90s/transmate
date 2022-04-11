import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "semantic-ui-react";
import useRoute from "/imports/client/router/useRoute";

const OverviewHeaderBack = ({ redirectTo }) => {
  const { t } = useTranslation();
  const { goRoute } = useRoute();
  return (
    <header className="view ui basic segment">
      <div />
      <a className="button" style={{ cursor: "pointer" }} onClick={() => goRoute(redirectTo)}>
        <Icon name="arrow left" />
        {t("form.back")}
      </a>
    </header>
  );
};

export default OverviewHeaderBack;
