import React, { useState } from "react";
import get from "lodash.get";
import { Trans, useTranslation } from "react-i18next";
import { Message, List, Button, Checkbox, Form, Dropdown, TextArea } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import TenderRequirementModal from "./modals/Requirement";

// this block allows to set the requirements, used by the tender owner
// if the account is tender participant -> render the fields as a form

const ResponseField = ({ requirement, myResponses, handleResponses, canEdit, index }) => {
  const { t } = useTranslation();
  const refId = requirement.id;
  const responseObj = myResponses.find(({ id }) => id === refId) || {};
  const [myResponse, setResponse] = useState(responseObj);

  function modifyMyBids(newValue = {}) {
    setResponse(newValue);
    handleResponses({ id: refId, ...newValue });
  }

  const component = (function getComponent(type) {
    switch (type) {
      case "list":
        return (
          <Dropdown
            data-test={`requirement${index}`}
            selection
            simple
            disabled={!canEdit}
            placeholder={t("form.select")}
            value={myResponse.responseStr || ""}
            options={(requirement.responseOptions || []).map(key => ({
              key,
              value: key,
              text: key
            }))}
            onChange={(_, { value }) => modifyMyBids({ responseStr: value })}
          />
        );
      case "YN":
        return (
          <Checkbox
            data-test={`requirement${index}`}
            disabled={!canEdit}
            checked={!!myResponse.responseBool}
            onClick={(_, { checked }) => modifyMyBids({ responseBool: checked })}
          />
        );
      default:
        return (
          <TextArea
            data-test={`requirement${index}`}
            disabled={!canEdit}
            value={myResponse.responseStr || ""}
            onChange={(_, { value }) => modifyMyBids({ responseStr: value })}
          />
        );
    }
  })(requirement.responseType);

  return component;
};

const TenderRequirementSection = ({ tender = {}, security = {}, onSave, onSaveBid }) => {
  const [modalState, setModalstate] = useState({ show: false });
  const showModal = show => setModalstate({ ...modalState, show });

  const requirements = tender.requirements || [];
  const { isBidder, canPlaceBid, canEditRequirement } = security;
  const myResponses = isBidder ? get(tender, ["bidders", 0, "requirements"]) || [] : [];

  const [responses, setResponses] = useState(myResponses);

  function handleResponses({ id, responseStr, responseBool }) {
    const newResponses = [
      ...responses.filter(({ id: curId }) => curId !== id),
      { id, responseStr, responseBool, modified: true }
    ];
    setResponses(newResponses);
  }

  function saveResponses() {
    onSaveBid("requirements", {
      array: responses
    });
    setResponses([]);
  }

  const updateRequirements = (data, index) => {
    const mod = requirements;
    if (index != null) {
      mod[index] = data;
    } else {
      mod.push(data);
    }
    onSave({ requirements: mod }, () => showModal(false));
  };
  const deleteRequirement = index => {
    const mod = requirements;
    mod.splice(index, 1);
    return onSave({ requirements: mod }, () => showModal(false));
  };

  const hasUnsavedRespones = responses.filter(({ modified }) => modified).length > 0;

  return (
    <IconSegment
      name="requirements"
      icon="thumbtack"
      title={<Trans i18nKey="tender.requirement.title" />}
      body={
        <>
          {requirements.length ? (
            <List relaxed ordered divided selection={canEditRequirement}>
              {requirements.map((requirement, i) => (
                <List.Item
                  key={i}
                  onClick={() => canEditRequirement && setModalstate({ show: true, requirement })}
                >
                  {isBidder && (
                    <List.Content floated="right">
                      <Form.Field width="six">
                        <ResponseField
                          {...{
                            requirement,
                            myResponses,
                            handleResponses,
                            canEdit: canPlaceBid,
                            index: i
                          }}
                        />
                      </Form.Field>
                    </List.Content>
                  )}
                  <List.Content>
                    <List.Header content={requirement.title} />
                    <List.Description
                      content={
                        <>
                          {requirement.details}
                          <span style={{ opacity: 0.5 }}>( {requirement.type} )</span>
                        </>
                      }
                    />
                  </List.Content>
                </List.Item>
              ))}
            </List>
          ) : (
            <p>
              <Trans i18nKey="tender.requirement.empty" />
            </p>
          )}

          <TenderRequirementModal
            {...modalState}
            isLocked={!canEditRequirement}
            onSave={updateRequirements}
            onDelete={deleteRequirement}
            showModal={showModal}
          />

          {tender.requirements && (
            <Message
              size="small"
              info
              floating
              content={
                <List as="ul">
                  <List.Item as="li" content={<Trans i18nKey="tender.requirement.legend.hard" />} />
                  <List.Item as="li" content={<Trans i18nKey="tender.requirement.legend.soft" />} />
                </List>
              }
            />
          )}
        </>
      }
      footer={
        canEditRequirement || hasUnsavedRespones ? (
          <>
            {canEditRequirement && (
              <Button
                primary
                icon="add circle"
                content={<Trans i18nKey="tender.requirement.add" />}
                onClick={() => {
                  setModalstate({
                    show: true
                  });
                }}
              />
            )}
            {hasUnsavedRespones && (
              <Button
                data-test="saveRequirements"
                primary
                content={<Trans i18nKey="form.save" />}
                onClick={saveResponses}
              />
            )}
          </>
        ) : null
      }
    />
  );
};

export default TenderRequirementSection;
