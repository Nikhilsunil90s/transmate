import { toast } from "react-toastify";
import React, { useContext } from "react";
import { Trans, useTranslation } from "react-i18next";
import SimpleSchema from "simpl-schema";
import { Segment, Divider, Grid, Button, Icon, Header } from "semantic-ui-react";
import { AutoForm, BoolField, ErrorField } from "uniforms-semantic";
import FileUpload from "/imports/client/components/forms/input/FileUpload.jsx";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { uploadDocumentToCollection } from "/imports/utils/functions/fnUpload";
import useRoute from "/imports/client/router/useRoute";
import LoginContext from "/imports/client/context/loginContext";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    NDAconsent: Boolean,
    file: String
  })
);

let formRef;
const NDALockScreen = ({ saveBid }) => {
  const { t } = useTranslation();
  const { goRoute, params } = useRoute();
  const { accountId } = useContext(LoginContext);

  const onSubmitForm = ({ file }) => {
    uploadDocumentToCollection({
      file,
      directive: "tender.document",

      reference: {
        tenderId: params._id
      },
      type: "NDA",
      accountId
    })
      .then(({ documentId, name }) => {
        saveBid("NDAresponse", {
          accepted: true,
          doc: {
            name,
            id: documentId
          }
        });
        toast.success("Sucessfully stored your NDA.", {
          onRouteClose: false
        });
        return goRoute("tender", {
          _id: params._id
        });
      })
      .catch(err => {
        return toast.error(err);
      });
  };
  return (
    <Segment placeholder data-test="NDALock">
      <Divider vertical>AND</Divider>
      <AutoForm
        schema={schema}
        modelTransform={(mode, model) => {
          if (mode === "validate") {
            const { name } = model.file || {};

            return {
              ...model,
              file: name
            };
          }
          return model;
        }}
        onSubmit={onSubmitForm}
        ref={ref => {
          formRef = ref;
        }}
      >
        <Grid columns={2} relaxed="very" stackable textAlign="center">
          <Grid.Row verticalAlign="middle">
            <Grid.Column>
              <Header icon>
                <Icon name="file" />
                <Trans i18nKey="tender.NDA.upload" />
              </Header>
              <p>
                <a
                  href="https://files.transmate.eu/support/basic%20NDA%20tender.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  File
                </a>
              </p>

              <FileUpload name="file" />
              <ErrorField name="file" />
            </Grid.Column>

            <Grid.Column>
              <BoolField name="NDAconsent" label={t("tender.NDA.accept")} />
              <Button
                content={<Trans i18nKey="tender.NDA.submit" />}
                onClick={() => formRef.submit()}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </AutoForm>
    </Segment>
  );
};
export default NDALockScreen;
