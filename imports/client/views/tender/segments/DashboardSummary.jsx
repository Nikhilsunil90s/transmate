import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import moment from "moment";
import { Trans, useTranslation } from "react-i18next";
import { Grid, List, Icon, Form } from "semantic-ui-react";

import { mutate } from "/imports/utils/UI/mutate";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { ConfirmComponent } from "/imports/client/components/modals";
import { STATUS_COLORS, DEFAULT_STATUS_COLOR, STEPS } from "/imports/api/_jsonSchemas/enums/tender";
import { GENERATE_PACKAGES } from "../utils/queries";

//#region components

//#endregion
const debug = require("debug")("tender:UI");

const SummarySection = ({ tender = {}, security = {}, selectTab }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });

  const { canGeneratePackages } = security;

  const statusColor = STATUS_COLORS[tender.status] || DEFAULT_STATUS_COLOR;
  const nextMilestone = (tender.timeline || []).find(item => moment(item.date).isAfter(moment()));

  const switchTabs = step => {
    const tab = (() => {
      switch (step) {
        case "general":
          return "introduction";
        case "bidding":
          return "dashboard";
        default:
          return step;
      }
    })();
    selectTab(tab);
  };

  const onClickRedo = () => {
    setConfirmState({
      ...confirmState,
      show: true,
      content: "Do you want to regenerate the profile?",
      onConfirm: () => {
        debug("regenerate the profile", tender.id);
        mutate(
          {
            client,
            query: {
              mutation: GENERATE_PACKAGES,
              variables: { tenderId: tender.id }
            }
          },
          () => showConfirm(false)
        );
      }
    });
  };

  return (
    <IconSegment
      className={`very padded ${statusColor}`}
      name="summary"
      icon="paperclip"
      title={<Trans i18nKey="tender.dashboard.summary" />}
      body={
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column>
              <Form>
                {nextMilestone && (
                  <>
                    <Form.Field
                      inline
                      label={t("tender.profile.bidder.nextMilesone")}
                      content={nextMilestone.title}
                    />
                    <Form.Field
                      inline
                      label={t("tender.profile.bidder.due")}
                      content={
                        <Trans
                          i18nKey="tender.profile.bidder.remaining"
                          remaining={moment(nextMilestone.date).diff(new Date(), "days")}
                        />
                      }
                    />
                  </>
                )}
              </Form>
            </Grid.Column>
            <Grid.Column>
              <List>
                {STEPS.map((step, i) => (
                  <List.Item key={i}>
                    {canGeneratePackages && step === "profile" && (
                      <>
                        <List.Content
                          floated="right"
                          content={
                            <Icon
                              color="grey"
                              name="redo"
                              style={{ cursor: "pointer" }}
                              onClick={onClickRedo}
                            />
                          }
                        />
                        <ConfirmComponent {...confirmState} showConfirm={showConfirm} />
                      </>
                    )}
                    <List.Icon
                      name={(tender.steps || []).includes(step) ? "check" : "close"}
                      color={(tender.steps || []).includes(step) ? "green" : "red"}
                    />

                    <List.Content
                      content={
                        <a className="step" onClick={() => switchTabs(step)}>
                          {step}
                        </a>
                      }
                    />
                  </List.Item>
                ))}
              </List>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      }
    />
  );
};

export default SummarySection;
