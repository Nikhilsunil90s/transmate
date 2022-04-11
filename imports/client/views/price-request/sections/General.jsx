/* eslint-disable no-use-before-define */
import React, { useState } from "react";
import { Trans } from "react-i18next";
import SimpleSchema from "simpl-schema";
import classNames from "classnames";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

// UI
import { AutoForm, AutoFields } from "uniforms-semantic";
import { Form, Message, Modal, Button } from "semantic-ui-react";
import { IconSegment } from "../../../components/utilities/IconSegment";
import PriceRequestStatus from "../components/PriceRequestStatus";

import { tabPropTypes } from "../tabs/_tabProptypes";

const rootEl = document.getElementById("react-root");

//#region component
/** rendered as static form for info */
const GeneralForm = ({ ...props }) => {
  const { priceRequest = {}, onSave, noBidMessage, security = {} } = props;
  const { requestedByName, customerName, title, ref } = priceRequest;

  const [isModalOpen, setModalOpen] = useState(false);
  const editTitle = () => {
    if (!security.canEditTitle) return;
    setModalOpen(true);
  };

  const onEditTitle = newTitle => {
    const callback = () => setModalOpen(false);
    onSave({ update: { title: newTitle } }, callback);
  };

  return (
    <>
      {noBidMessage && (
        <Message warning>
          <Message.Header>
            <Trans i18nKey="price.request.form.noBidMessageHeader" />
          </Message.Header>
          <p>
            <Trans i18nKey="price.request.form.noBidMessage" />
          </p>
        </Message>
      )}
      <Form>
        <Form.Group widths={2}>
          <Form.Field>
            <label>
              <Trans i18nKey="price.request.form.ref" />
            </label>
            <div
              className={classNames("relative", { editable: security.canEditTitle })}
              style={{ position: "relative" }}
              onClick={editTitle}
              data-test="changeTitle"
            >
              <div className="float top right" style={{ visibility: "hidden" }}>
                <i className="ui grey pencil icon" />
              </div>
              <div className="content">
                <p>{title || ref}</p>
              </div>
            </div>
            <EditTitleModal
              {...{ isModalOpen, setModalOpen, onEditTitle, model: { title: title || ref } }}
            />
          </Form.Field>
          <Form.Field>
            <label>
              <Trans i18nKey="price.request.form.status" />
            </label>
            <PriceRequestStatus priceRequest={priceRequest} />
          </Form.Field>
        </Form.Group>
        <Form.Group widths={2}>
          <Form.Field>
            <label>
              <Trans i18nKey="price.request.form.createdBy" />
            </label>
            <p>{requestedByName}</p>
          </Form.Field>
          <Form.Field>
            <label>
              <Trans i18nKey="price.request.form.customerId" />
            </label>
            <p>{customerName}</p>
          </Form.Field>
        </Form.Group>
      </Form>
    </>
  );
};

let formRef;
const EditTitleModal = ({ isModalOpen, setModalOpen, onEditTitle, model = {} }) => {
  const handleFormSubmit = ({ title }) => {
    onEditTitle(title);
  };
  return (
    <Modal open={isModalOpen} size="small" mountNode={rootEl}>
      <Modal.Header>Change title</Modal.Header>

      <Modal.Content>
        <AutoForm
          schema={new SimpleSchema2Bridge(new SimpleSchema({ title: String }))}
          model={model}
          onSubmit={handleFormSubmit}
          ref={ref => {
            formRef = ref;
          }}
        >
          <AutoFields />
        </AutoForm>
      </Modal.Content>

      <Modal.Actions>
        <Button onClick={() => setModalOpen(false)} content={<Trans i18nKey="form.cancel" />} />
        <Button primary onClick={() => formRef.submit()} content={<Trans i18nKey="form.save" />} />
      </Modal.Actions>
    </Modal>
  );
};
//#endregion

const PriceRequestGeneral = ({ ...props }) => {
  const segmentData = {
    name: "general",
    icon: "file outline",
    title: <Trans i18nKey="price.request.general.title" />,
    body: <GeneralForm {...props} />
  };

  return <IconSegment {...segmentData} />;
};

PriceRequestGeneral.propTypes = tabPropTypes;

export default PriceRequestGeneral;
