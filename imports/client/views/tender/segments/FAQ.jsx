import React, { useState } from "react";
import { Trans } from "react-i18next";
import { List, Icon, Item, Button, Accordion } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import FAQModal from "./modals/FAQ";
import { ConfirmComponent } from "/imports/client/components/modals";

const debug = require("debug")("tender:UI");

const FAQsection = ({ tender = {}, security = {}, onSave }) => {
  const [confirmState, setConfirmState] = useState({ show: false });
  const [modalState, setModalState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });
  const showModal = show => setModalState({ ...modalState, show });
  const { canEditTenderFaq } = security;
  const FAQ = tender.FAQ || [];

  const updateFAQ = (data, index) => {
    const mod = FAQ;
    if (index != null) {
      mod[index] = data;
    } else {
      mod.push(data);
    }
    onSave({ FAQ: mod }, () => showModal(false));
  };

  const deleteFAQ = index => {
    showModal(false);
    setConfirmState({
      ...confirmState,
      show: true,
      onConfirm: () => {
        debug("remove item %s", index);
        const newFAQs = FAQ.splice(index, 1);
        onSave({ FAQ: newFAQs }, () => showConfirm(false));
      }
    });
  };

  return (
    <IconSegment
      name="FAQ"
      icon="tasks"
      title={<Trans i18nKey="tender.FAQ.title" />}
      body={
        canEditTenderFaq ? (
          <>
            <List relaxed divided>
              {FAQ.map((item, index) => (
                <List.Item key={index}>
                  <div className="right floated icons">
                    <Icon
                      name="edit"
                      onClick={() => setModalState({ show: true, item, index })}
                      style={{ cursor: "pointer" }}
                    />
                    <Icon
                      name="trash alternate"
                      onClick={() => deleteFAQ(index)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>

                  <Item.Content>
                    <Item.Header>{item.title}</Item.Header>
                    <Item.Description>{item.details}</Item.Description>
                  </Item.Content>
                </List.Item>
              ))}
            </List>

            <Button
              as="a"
              primary
              basic
              icon="add circle"
              content={<Trans i18nKey="tender.FAQ.add" />}
              onClick={() => showModal(true)}
              data-test="addFAQ"
            />
            <ConfirmComponent {...confirmState} showConfirm={showConfirm} />
            <FAQModal {...modalState} {...{ showModal, onSave: updateFAQ, onDelete: deleteFAQ }} />
          </>
        ) : (
          <Accordion
            panels={FAQ.map(({ title, details }, i) => ({ key: i, title, content: details }))}
          />
        )
      }
    />
  );
};

export default FAQsection;
