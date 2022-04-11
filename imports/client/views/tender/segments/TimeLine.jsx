import React, { useState } from "react";
import moment from "moment";
import { Trans, useTranslation } from "react-i18next";
import { Form, Icon } from "semantic-ui-react";
import classNames from "classnames";

import { IconSegment, SegmentFooter } from "/imports/client/components/utilities/IconSegment";
import { RichTextEditor } from "/imports/client/components/forms/uniforms/RichTextEditor";
import { initSlateValue } from "/imports/client/components/forms/uniforms";
import { serializeSlateString } from "/imports/client/components/forms/uniforms/RichText.utils";
import MilestoneModal from "./modals/Milestone";

const debug = require("debug")("tender:UI");

//#region components
const chronological = (a, b) => {
  if (a.date < b.date) {
    return -1;
  }
  if (a.date > b.date) {
    return 1;
  }
  return 0;
};

//#endregion

const TenderTimeline = ({ tender = {}, security = {}, onSave }) => {
  const { t } = useTranslation();
  const [hasChanges, setChanged] = useState(false);
  const [noteData, setNoteData] = useState(tender.notes?.procedure);
  const [modalState, setModalstate] = useState({ show: false });
  const showModal = show => setModalstate({ ...modalState, show });

  const timeline = tender.timeline || [];
  const canEdit = security.canEditGeneral;

  const updateMilestones = (data, index) => {
    debug("update milestones", { data, index });
    let timelineMod = timeline;
    if (index != null) {
      timelineMod[index] = data;
    } else {
      timelineMod.push(data);
    }
    timelineMod = timeline.sort(chronological);
    onSave({ timeline: timelineMod }, () => showModal(false));
  };
  const deleteMilestone = index => {
    const timelineMod = timeline;
    timelineMod.splice(index, 1);
    return onSave({ timeline: timelineMod }, () => showModal(false));
  };

  const saveNote = () =>
    onSave({ "notes.procedure": JSON.stringify(noteData) }, () => setChanged(false));

  return (
    <IconSegment
      name="milestones"
      icon="hourglass half"
      title={<Trans i18nKey="tender.timeline" />}
      body={
        <>
          {timeline.map((milestone, index) => {
            const checked = milestone.date < new Date() || tender.status === "closed";
            return (
              <div
                key={`timeline-${index}`}
                className={classNames("milestone", { checked })}
                onClick={() => canEdit && setModalstate({ show: true, milestone, index })}
              >
                <Icon name="check" color="blue" inverted={checked} circular />
                <b>{milestone.title}</b>
                <br />
                <i>{moment(milestone.date).format("LL")}</i>
                <br />
                {milestone.details}
              </div>
            );
          })}
          {canEdit && (
            <div
              className="milestone button"
              data-test="addMilestone"
              onClick={() => setModalstate({ show: true })}
            >
              <Icon circular inverted color="blue" name="add" />
              <b>{t("tender.milestone.add")}</b>
            </div>
          )}

          <Form>
            <Form.Field>
              <label>
                <Trans i18nKey="tender.procedure" />
              </label>
              {canEdit && tender.status === "draft" ? (
                <RichTextEditor
                  name="procedure"
                  onChange={value => {
                    setNoteData(value);
                    setChanged(true);
                  }}
                  value={initSlateValue(tender.notes?.procedure)}
                />
              ) : (
                tender.notes?.procedure && <div>{serializeSlateString(tender.notes.procedure)}</div>
              )}
            </Form.Field>
          </Form>

          <MilestoneModal
            {...modalState}
            isLocked={!canEdit}
            onSave={updateMilestones}
            onDelete={deleteMilestone}
            showModal={showModal}
          />
        </>
      }
      footerElement={
        canEdit &&
        hasChanges && <SegmentFooter {...{ btnText: t("form.save"), onClick: saveNote }} />
      }
    />
  );
};
export default TenderTimeline;
