import { toast } from "react-toastify";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, Button, Image, Divider, Grid } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import get from "lodash.get";
import SafetyModal from "../modals/Safety";
import { serializeSlateString } from "/imports/client/components/forms/uniforms/RichText.utils";

const AddressSafetySegment = ({ annotation, canEdit, onSave }) => {
  const { t } = useTranslation();
  const [show, showModal] = useState(false);

  const onSubmitForm = ({ pbm, instructions }) => {
    onSave({ safety: { pbm, instructions } }, err => {
      if (err) return toast.error(err.reason);
      return showModal(false);
    });
  };

  return (
    <IconSegment
      name="safety"
      title={t("address.form.safety.title")}
      icon="warning sign"
      body={<AddressSafety {...{ annotation }} />}
      footer={
        canEdit && (
          <>
            <Button
              primary
              basic
              icon="edit"
              content={t("form.edit")}
              onClick={() => showModal(true)}
            />
            <SafetyModal {...{ show, showModal, annotation, onSubmitForm }} />
          </>
        )
      }
    />
  );
};

export const AddressSafety = ({ annotation }) => {
  const { t } = useTranslation();
  const pbm = get(annotation, ["safety", "pbm"]) || [];

  return (
    <>
      <Table collapsing>
        <Table.Body>
          <Table.Row>
            {pbm.map((item, idx) => (
              <Table.Cell key={idx}>
                <Image size="mini" src={`/safety-icons/${item}.svg`} alt={`${item}`} />
              </Table.Cell>
            ))}
          </Table.Row>
        </Table.Body>
      </Table>
      <Divider hidden />
      <Grid>
        <Grid.Column>
          {serializeSlateString(get(annotation, ["safety", "instructions"])) ||
            t("address.form.safety.empty")}
        </Grid.Column>
      </Grid>
    </>
  );
};

export default AddressSafetySegment;
