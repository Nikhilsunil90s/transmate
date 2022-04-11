import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, Label, Button } from "semantic-ui-react";
import PropTypes from "prop-types";

import SimpleInputModal from "/imports/client/components/modals/specific/SimpleInput.jsx";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { AccountRatingTag } from "/imports/client/components/tags";

const GeneralStatic = ({ profile = {}, isOwnAccount }) => {
  const { t } = useTranslation();
  const { slug, description, name, id } = profile;
  return (
    <>
      <div className="starRatingProfile">
        <AccountRatingTag partnerId={id} />
      </div>
      <h3 className="name"> {name} </h3>
      <div className="description"> {description} </div>
      {!isOwnAccount && !slug ? null : (
        <>
          <br key="break" />
          <Form key="url">
            <label>{t("account.portal.trace")}</label>
            <p>{slug ? <Label>{slug}.transmate.eu</Label> : t("account.portal.traceEmpty")}</p>
          </Form>
        </>
      )}
    </>
  );
};

const ProfileGeneralSegment = ({ canEdit, isOwnAccount, profile = {}, onSave }) => {
  const { t } = useTranslation();
  const [show, showModal] = useState(false);
  const segmentData = {
    name: "general",
    icon: "marker",
    title: t("partner.profile.description.title"),
    body: <GeneralStatic {...{ profile, isOwnAccount }} />,
    footer: canEdit ? (
      <>
        <Button primary content={t("form.edit")} onClick={() => showModal(true)} />
        <SimpleInputModal
          {...{
            show,
            showModal,
            title: t("partner.profile.general.edit"),
            label: t("partner.profile.general.name"),
            model: { input: profile.name },
            onSave: ({ input }) => {
              onSave({ name: input });
              showModal(false);
            }
          }}
        />
      </>
    ) : (
      undefined
    )
  };
  return <IconSegment {...segmentData} />;
};

ProfileGeneralSegment.propTypes = {
  canEdit: PropTypes.bool.isRequired,
  isOwnAccount: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  profile: PropTypes.object
};

// when editing own account:
// const GeneralForm = () => {};

export default ProfileGeneralSegment;
