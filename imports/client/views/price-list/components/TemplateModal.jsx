import React from "react";
import get from "lodash.get";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";
import { Card, Image, Button } from "semantic-ui-react";
import { ModalComponent, ModalActionsClose } from "/imports/client/components/modals";

import { PRICELIST_TEMPLATES } from "/imports/api/_jsonSchemas/enums/priceListTemplates";

const DEFAULT_TEMPLATES = Object.entries(PRICELIST_TEMPLATES)
  .filter(([k]) => !["spot"].includes(k))
  .map(([key, { name, description, modes = [] }]) => ({
    key,
    name,
    description,
    modes
  }));

export const TemplateSelectionForm = ({ selectTemplate }) => {
  const allTemplates = [...DEFAULT_TEMPLATES];

  return (
    <Card.Group centered itemsPerRow={4}>
      {allTemplates.map((template, i) => (
        <Card key={i} color="blue" raised>
          <Card.Content>
            <Image
              fluid
              src={`https://assets.transmate.eu/app/${template.key}PriceListTemplate.png`}
            />
            <Card.Header>{template.name}</Card.Header>
            <Card.Meta>{template.modes.join(", ")}</Card.Meta>
            <Card.Description>{template.description}</Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Button
              basic
              content={<Trans i18nKey="form.select_btn" />}
              onClick={() => selectTemplate(template.key)}
              data-test={`selectTemplateBtn-${template.key}`}
            />
          </Card.Content>
        </Card>
      ))}
    </Card.Group>
  );
};

const TemplateModal = ({ show, showModal, onSave }) => {
  function selectTemplate(templateKey) {
    const template = PRICELIST_TEMPLATES[templateKey];
    onSave({ template: { type: templateKey }, mode: get(template, ["modes", 0]) });
  }

  return (
    <ModalComponent
      size="large"
      scrolling
      show={show}
      showModal={showModal}
      title={<Trans i18nKey="price.list.template.title" />}
      body={<TemplateSelectionForm {...{ selectTemplate }} />}
      actions={<ModalActionsClose {...{ showModal }} />}
    />
  );
};

TemplateModal.propTypes = {
  show: PropTypes.bool.isRequired,
  showModal: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default TemplateModal;
