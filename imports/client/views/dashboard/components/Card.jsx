import React from "react";
import PropTypes from "prop-types";
import { Button, Card } from "semantic-ui-react";
import { useTranslation, Trans } from "react-i18next";

const DashboardCard = ({ icon, title, metaText, urlOverview, count }) => {
  const { t } = useTranslation();
  return (
    <Card
      content={
        <>
          <Card.Content>
            <i className={`right floated ${icon}`} />
            <div className="header">{t(title)} </div>
            <div className="meta">
              <Trans i18nKey={metaText} values={{ count: count || 0 }} />
            </div>
          </Card.Content>
          <Card.Content extra>
            <Button
              as="a"
              basic
              primary
              href={urlOverview}
              content={t("dashboard.card.btnOverview")}
            />
          </Card.Content>
        </>
      }
    />
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  metaText: PropTypes.string.isRequired,
  urlOverview: PropTypes.string.isRequired,
  count: PropTypes.number
};

export default DashboardCard;
