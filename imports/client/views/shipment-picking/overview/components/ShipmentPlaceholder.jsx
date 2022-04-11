import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Header, Icon, Segment, Container } from "semantic-ui-react";

const ShipmentPlaceholder = ({ showModal }) => {
  const { t } = useTranslation();
  const handleClick = () => showModal(true);

  return (
    <Container>
      <Segment placeholder>
        <Header icon>
          <Icon name="compass outline" />
          {t("picking.overview.placeholder.message")}
        </Header>
        <Button primary onClick={handleClick} content={t("picking.overview.placeholder.btn")} />
      </Segment>
    </Container>
  );
};

export default ShipmentPlaceholder;
